
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// Helper to get client
const getClient = () => {
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
};

// Helper to remove any rogue asterisks or markdown symbols from the AI response
const cleanResponse = (text: string): string => {
  return text
    .replace(/\*\*/g, '') // Remove bold symbols
    .replace(/\*/g, '')   // Remove italic/list symbols
    .replace(/#/g, '')    // Remove header symbols
    .replace(/__/g, '')   // Remove underline symbols
    .trim();
};

// Helper for Veo client (requires specific key selection)
const getVeoClient = async () => {
  // @ts-ignore - Window extension for Veo key selection
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
          // @ts-ignore
          await window.aistudio.openSelectKey();
      }
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const isQuotaError = (error: any) => {
  return error.status === 429 || error.code === 429 || error.message?.includes('RESOURCE_EXHAUSTED');
};

const isNotFoundError = (error: any) => {
  return error.status === 404 || error.code === 404 || error.message?.includes('not found');
};

// --- Text Generation ---
export const generateText = async (
  prompt: string, 
  systemInstruction?: string,
  model: string = 'gemini-3-flash-preview'
): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction ? systemInstruction + " IMPORTANT: Use plain text only. Strictly no asterisks, no bolding, no markdown." : "Use plain text only. No asterisks.",
      },
    });
    return cleanResponse(response.text || "No response generated.");
  } catch (error: any) {
    console.error("Text generation error:", error);
    throw error;
  }
};

// --- Marketing Chat (Multimodal) ---
export const generateMarketingChat = async (
  history: { role: 'user' | 'model', text: string, images?: string[] }[],
  currentText: string,
  currentImages: string[] = [],
  systemInstruction: string = ''
): Promise<string> => {
  const ai = getClient();
  const model = 'gemini-3-flash-preview';

  try {
    const recentHistory = history.slice(-8);
    
    const contents: any[] = recentHistory.map(msg => {
      const parts: any[] = [];
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(img => {
          const base64 = img.includes(',') ? img.split(',')[1] : img;
          parts.push({ inlineData: { data: base64, mimeType: 'image/jpeg' } });
        });
      }
      parts.push({ text: msg.text });
      return { role: msg.role, parts };
    });

    const currentParts: any[] = [];
    currentImages.forEach(img => {
      const base64 = img.includes(',') ? img.split(',')[1] : img;
      currentParts.push({ inlineData: { data: base64, mimeType: 'image/jpeg' } });
    });
    currentParts.push({ text: currentText + " (IMPORTANT: Respond in plain text only. Strictly no asterisks.)" });
    contents.push({ role: 'user', parts: currentParts });

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: { 
        systemInstruction: systemInstruction + " CRITICAL: NEVER use asterisks or markdown formatting. Use plain text only." 
      }
    });

    return cleanResponse(response.text || "No response.");
  } catch (error: any) {
    console.error("Marketing chat error details:", error);
    throw error;
  }
};

// --- Image Generation & Editing ---
export const generateOrEditImage = async (
  prompt: string,
  imageBase64?: string,
  mimeType: string = 'image/png',
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '1:1'
): Promise<string> => {
  const ai = getClient();
  const model = 'gemini-2.5-flash-image'; 

  try {
    const parts: any[] = [];
    if (imageBase64) {
      const base64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      parts.push({ inlineData: { data: base64, mimeType } });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: { imageConfig: { aspectRatio } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error: any) {
    console.error("Image generation error:", error);
    throw error;
  }
};

// --- Video Generation (Veo) ---
export const generateVideo = async (prompt: string, aspectRatioRaw: string = '16:9'): Promise<string> => {
  const ai = await getVeoClient();
  let targetRatio: '16:9' | '9:16' = aspectRatioRaw === '9:16' ? '9:16' : '16:9';

  const runGeneration = async (modelName: string) => {
    let operation = await ai.models.generateVideos({
      model: modelName,
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: targetRatio }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video URI not found.");
    return `${videoUri}&key=${process.env.API_KEY}`;
  };

  try {
    return await runGeneration('veo-3.1-generate-preview');
  } catch (error: any) {
    if (isQuotaError(error) || isNotFoundError(error)) {
      return await runGeneration('veo-3.1-fast-generate-preview');
    }
    throw error;
  }
};

// --- Speech Generation (TTS) ---
export const generateSpeech = async (
  text: string, 
  voiceName: string = 'Kore',
  styleInstruction: string = ''
): Promise<AudioBuffer> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: styleInstruction ? `(Style: ${styleInstruction}) ${text}` : text }] }],
      config: {
        responseModalalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data");
    return decodeAudio(base64Audio);
  } catch (error) {
    console.error("Speech error:", error);
    throw error;
  }
};

// --- Custom Voice Generation (Cloning) ---
export const generateSpeechFromReference = async (
  text: string,
  base64Audio: string,
  mimeType: string,
  styleInstruction: string = ''
): Promise<AudioBuffer> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-native-audio-preview-12-2025",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Audio, mimeType } },
            { text: `Target voice is provided. Use this exact voice to say: "${text}". Style: ${styleInstruction}` }
          ]
        }
      ],
      config: {
        responseModalalities: [Modality.AUDIO],
      },
    });
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("No audio data");
    return decodeAudio(audioData);
  } catch (error) {
    console.error("Speech cloning error:", error);
    throw error;
  }
};

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string = 'image/png'): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ inlineData: { data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64, mimeType } }, { text: prompt + " (Strictly no asterisks.)" }] }
    });
    return cleanResponse(response.text || "");
  } catch (error) {
    throw error;
  }
};

const decodeAudio = async (base64Audio: string): Promise<AudioBuffer> => {
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  const sampleRate = 24000;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate});
  const dataInt16 = new Int16Array(bytes.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}
