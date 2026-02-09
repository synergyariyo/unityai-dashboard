// --- UNIVERSAL COMPATIBILITY MODE (Gemini Pro) ---

const getApiKey = () => {
  // Checks for both possible variable names to be safe
  const key = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!key) {
    console.error("CRITICAL: API Key is missing. Check Vercel Environment Variables.");
    return null;
  }
  return key;
};

// --- CHAT (Standard Model) ---
export const generateMarketingChat = async (history: any[], text: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: API Key is missing.";

  // HARDCODED FIX: specific use of 'gemini-pro' which works on ALL accounts
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  // Format history
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  
  // Add new message
  contents.push({ role: 'user', parts: [{ text: text }] });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: contents })
    });

    const data = await response.json();

    // If there is still an error, we show the raw message
    if (!response.ok) {
      console.error("Google API Error:", data);
      return `Error: ${data.error?.message || "Unknown error"}`;
    }

    // Success
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

  } catch (error) {
    console.error("Network Error:", error);
    return "Connection failed. Please check your internet.";
  }
};

// --- TEXT GENERATION (Standard Model) ---
export const generateText = async (prompt: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: Key missing";

  // Using gemini-pro here too
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (e) {
    return "Text generation failed.";
  }
};

// --- IMAGE PLACEHOLDER (Prevents Crashes) ---
export const generateOrEditImage = async (prompt: string) => {
  const text = await generateText(`Describe a scene of: ${prompt}`);
  return `(Image generation unavailable on this plan. Description: ${text})`; 
};

// --- STUBS ---
export const generateVideo = async () => "Video coming soon.";
export const generateSpeech = async () => null;
export const analyzeImage = async () => "Image analysis coming soon.";
export const generateSpeechFromReference = async () => null;
