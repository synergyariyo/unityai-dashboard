
import { GoogleGenAI } from "@google/genai";

// --- 1. CONFIGURATION ---
const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("API Key is missing. Check Vercel Settings.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const cleanResponse = (text: string) => {
  return text ? text.replace(/[\*#]/g, '').trim() : "";
};

// --- 2. CHAT (The Core Feature) ---
export const generateMarketingChat = async (history: any[], text: string) => {
  const ai = getClient();
  if (!ai) return "Error: API Key is missing.";

  // We convert history to a simple string format to prevent crashes
  // This is the safest way to chat
  let historyText = history.map(h => `${h.role}: ${h.text}`).join("\n");
  const prompt = `${historyText}\nuser: ${text}\n(Reply as a helpful AI assistant)`;

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // The most stable, free model
      contents: { parts: [{ text: prompt }] }
    });
    return cleanResponse(res?.text() || "No response.");
  } catch (error) {
    console.error("Chat Error:", error);
    return "I cannot connect right now. Please check your internet.";
  }
};

// --- 3. TEXT GENERATION ---
export const generateText = async (prompt: string) => {
  const ai = getClient();
  if (!ai) return "Error: API Key missing.";
  
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: { parts: [{ text: prompt }] }
    });
    return cleanResponse(res?.text() || "");
  } catch (e) {
    return "Text generation failed.";
  }
};

// --- 4. IMAGE GENERATION (Basic) ---
export const generateOrEditImage = async (prompt: string) => {
  // If this fails, we just return a text description instead of crashing
  try {
     const text = await generateText(`Describe an image of: ${prompt}`);
     return `(Image generation is currently unavailable. Description: ${text})`;
  } catch (e) {
     return "Image generation failed.";
  }
};

// --- 5. PLACEHOLDERS (To stop the 503 Crashes) ---
export const generateVideo = async () => "Video coming soon.";
export const generateSpeech = async () => null;
export const analyzeImage = async () => "Image analysis coming soon.";
export const generateSpeechFromReference = async () => null;
