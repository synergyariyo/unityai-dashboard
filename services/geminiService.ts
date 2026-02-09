import { GoogleGenAI, Modality } from "@google/genai";

// --- CORE CONFIGURATION ---
const getClient = () => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!API_KEY) throw new Error("API Key not found in environment variables");
  return new GoogleGenAI({ apiKey: API_KEY });
};

// Helper to remove any rogue asterisks or markdown symbols
const cleanResponse = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\*\*/g, '') 
    .replace(/\*/g, '')   
    .replace(/#/g, '')    
    .replace(/__/g, '')   
    .trim();
};

// Helper for Veo client
const getVeoClient = async () => {
  // @ts-ignore 
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      // @ts-ignore
      if (!hasKey) await window.aistudio.openSelectKey();
  }
  return getClient(); // Use our working client helper!
};

const isQuotaError = (error: any) => {
  return error?.status === 429 || error?.code === 429 || error?.message?.includes('RESOURCE_EXHAUSTED');
};

const isNotFoundError = (error: any) => {
  return error?.status === 404 || error?.code === 404 || error?.message?.includes('not found');
};

// --- Text Generation ---
export const generateText = async (
  prompt: string, 
  systemInstruction?: string,
  model: string = 'gemini-2.0-flash'
): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: {
        systemInstruction: systemInstruction ? systemInstruction + " IMPORTANT: Use plain text only. No markdown." : "Use plain text only.",
      },
    });
    return cleanResponse(response?.text() || "No response generated.");
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
  // FIXED: Changed from 'gemini-3-flash-preview' to stable model
  const model = 'gemini-2.0-flash'; 

  try {
    const recentHistory = history.slice(-8);
    
    // Map history to correct format
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
    currentParts.push({ text: currentText + " (Respond in plain text only)" });
    contents.push({ role: 'user', parts: currentParts });

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: { 
        systemInstruction: systemInstruction + " CRITICAL: Plain text only. No asterisks." 
      }
    });

    return cleanResponse(response?.text() || "No response.");
  } catch (error: any) {
    console.error("Marketing chat error:", error);
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
  // FIXED: Use the correct model for IMAGES (Gemini 2.0 Flash is for text!)
  const model = 'imagen-3.0-generate-001'; 

  try {
    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      // Note: Editing might use a different flow, but for generation:
      const base64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      parts.push({ inlineData: { data: base64, mimeType } });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: { imageConfig: { aspectRatio } }
    });

    // Check safely for image data
    const candidates = response.candidates || [];
    for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image')) {
                 return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
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
    // @ts-ignore
    let operation = await ai.models.generateVideos({
      model: modelName,
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: targetRatio }
    });
    
    // Note: In browser, we return the operation info because we can't long-poll effectively without backend
    // For now, returning a placeholder or success message
    return "Video generation started. (Veo requires backend polling).";
  };

  try {
    return await runGeneration('veo-2.0-generate-preview-0121');
  } catch (error: any) {
    console.error("Video error:", error);
    throw new Error("Video generation failed. Check Quota.");
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
      model: "gemini-2.0-flash", 
      contents: { parts: [{ text: styleInstruction ? `(Style: ${styleInstruction}) ${text}` : text }] },
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    
    if (!base64Audio) throw new Error("No audio data returned.");
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
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Audio, mimeType } },
            { text: `Target voice is provided. Use this exact voice to say: "${text}". Style: ${styleInstruction}` }
          ]
        }
      ],
      config: {
        responseModalities: ["AUDIO"],
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
      // FIXED: Changed from 'gemini-3' to stable model
      model: 'gemini-2.0-flash',
      contents: { parts: [{ inlineData: { data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64, mimeType } }, { text: prompt + " (Strictly no asterisks.)" }] }
    });
    return cleanResponse(response?.text() || "");
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
  return ctx.decodeAudioData(bytes.buffer);
}
