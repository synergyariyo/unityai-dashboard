import { GoogleGenAI } from "@google/genai";

// --- CLIENT CONFIGURATION ---
const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn("API Key missing. Check Vercel Environment Variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const cleanResponse = (text: string) => {
  return text ? text.replace(/[\*#]/g, '').trim() : "";
};

// --- 1. Text Generation (Gemini 2.0 Flash) ---
export const generateText = async (prompt: string) => {
  const ai = getClient();
  if (!ai) return "Error: API Key missing.";
  
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: [{ text: prompt }] }
    });
    return cleanResponse(res?.text() || "");
  } catch (e) {
    console.error(e);
    return "Text generation failed. (Check API Key)";
  }
};

// --- 2. Image Generation (Gemini 2.0 Flash) ---
export const generateOrEditImage = async (prompt: string) => {
  const ai = getClient();
  if (!ai) throw new Error("API Key missing");

  try {
    // gemini-2.0-flash is the best free model for this currently
    const res = await ai.models.generateContent({
      model: 'gemini-2.0-flash', 
      contents: { parts: [{ text: prompt }] }
    });

    const candidates = res.candidates || [];
    for (const c of candidates) {
      if (c.content?.parts?.[0]?.inlineData) {
        return `data:image/png;base64,${c.content.parts[0].inlineData.data}`;
      }
    }
    throw new Error("Model returned text instead of image. Try a clearer prompt.");
  } catch (e) {
    console.error(e);
    throw new Error("Image generation failed. Ensure your Google Cloud project has access.");
  }
};

// --- 3. Chat (Gemini 2.0 Flash) ---
export const generateMarketingChat = async (history: any[], text: string) => {
  const ai = getClient();
  if (!ai) return "Error: API Key missing";

  // Simplify history to prevent server format errors
  const simpleHistory = history.map(h => ({ 
    role: h.role, 
    parts: [{ text: h.text }] 
  }));
  simpleHistory.push({ role: 'user', parts: [{ text }] });

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: simpleHistory
    });
    return cleanResponse(res?.text() || "");
  } catch (e) {
    return "Chat failed. Please try again.";
  }
};

// --- 4. SAFE PLACEHOLDERS (Prevents 503 Build Crashes) ---
// These functions only run in the browser, never on the server.
export const generateVideo = async () => {
  if (typeof window === 'undefined') return "";
  return "Video generation is coming soon."; 
};

export const generateSpeech = async () => {
  if (typeof window === 'undefined') return null;
  console.log("Speech generation skipped in safe mode.");
  return null;
};

export const analyzeImage = async (prompt: string, imageBase64: string) => {
  const ai = getClient();
  if (!ai) return "API Key Missing";
  
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-1.5-pro', // Best for analysis
      contents: { 
        parts: [
          { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/png' } }, 
          { text: prompt }
        ] 
      }
    });
    return cleanResponse(res?.text() || "");
  } catch (error) {
    return "Failed to analyze image.";
  }
};

export const generateSpeechFromReference = async () => null;
