// --- FINAL HYBRID ENGINE (Corrected Model Name) ---

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!key) {
    console.error("CRITICAL: API Key is missing.");
    return null;
  }
  return key;
};

// --- 1. CHAT (Updated to use 'latest') ---
export const generateMarketingChat = async (history: any[], text: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: API Key is missing.";

  // CORRECTED: Added '-latest' as you requested
  const modelName = "gemini-1.5-flash-latest"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: text }] });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: contents })
    });

    const data = await response.json();

    // ERROR HANDLING
    if (!response.ok) {
      console.error(`Model ${modelName} failed:`, data);
      
      // Fallback to Gemini Pro if Flash Latest fails
      if (data.error?.code === 404 || data.error?.code === 429) {
         return await generateChatFallback(history, text);
      }
      return `Error: ${data.error?.message || "Unknown error"}`;
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

  } catch (error) {
    return "Connection failed.";
  }
};

// --- Backup Chat (Gemini Pro) ---
const generateChatFallback = async (history: any[], text: string) => {
  const apiKey = getApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const prompt = `Context: ${history.map(h => h.text).join(' | ')}. User: ${text}`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Service busy.";
  } catch (e) { return "Service unavailable."; }
};

// --- 2. IMAGE GENERATION (Experimental) ---
export const generateOrEditImage = async (prompt: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: Key missing";

  // Using the experimental image model from your list
  const model = "gemini-2.0-flash-exp-image-generation";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      return `data:image/png;base64,${data.candidates[0].content.parts[0].inlineData.data}`;
    }

    if (data.error) {
      return `(Image Error: ${data.error.message})`;
    }

    return "(Image generation failed)";

  } catch (e) {
    return "Image generation failed.";
  }
};

// --- 3. TEXT GENERATION ---
export const generateText = async (prompt: string) => {
  return await generateMarketingChat([], prompt);
};

// --- STUBS ---
export const generateVideo = async () => "Video generation coming soon.";
export const generateSpeech = async () => null;
export const analyzeImage = async () => "Image analysis coming soon.";
export const generateSpeechFromReference = async () => null;
