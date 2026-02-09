// --- FINAL GEMINI SERVICE (Direct Fetch Mode) ---

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!key) {
    console.error("CRITICAL: API Key is missing. Check Vercel Environment Variables.");
    return null;
  }
  return key;
};

// --- UNIVERSAL CHAT (The Bulletproof Function) ---
export const generateMarketingChat = async (
  history: any[], 
  text: string, 
  images: string[] = [] 
) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: API Key is missing.";

  // We try the modern model first.
  const primaryModel = "gemini-1.5-flash";
  const backupModel = "gemini-pro";
  
  // Format history for the API (User/Model roles)
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  
  // Add the new user message
  contents.push({ role: 'user', parts: [{ text: text }] });

  try {
    // --- ATTEMPT 1: Modern Model ---
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: contents })
    });

    const data = await response.json();

    // If successful, return the text
    if (response.ok && data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }

    // --- ATTEMPT 2: Backup Model (If attempt 1 failed) ---
    console.warn(`Primary model failed. Switching to Backup...`);
    
    const backupUrl = `https://generativelanguage.googleapis.com/v1beta/models/${backupModel}:generateContent?key=${apiKey}`;
    
    // Simplify conversation for the older model (prevents format errors)
    // We just send the last message + context
    const simplifiedPrompt = `Context: ${history.map(h => h.text).join(' | ')}. \nUser: ${text}`;
    
    const backupResponse = await fetch(backupUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: simplifiedPrompt }] }] })
    });

    const backupData = await backupResponse.json();

    if (backupData.candidates && backupData.candidates.length > 0) {
      return backupData.candidates[0].content.parts[0].text;
    }

    return "I'm having trouble connecting right now. Please try again later.";

  } catch (error) {
    console.error("Network Error:", error);
    return "Connection failed. Please check your internet connection.";
  }
};

// --- TEXT GENERATION (Direct Fetch) ---
export const generateText = async (prompt: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: Key missing";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  } catch (e) {
    return "Text generation failed.";
  }
};

// --- IMAGE GENERATION (Safe Fallback) ---
// Since images are causing crashes, we switch to "Description Mode" if it fails.
export const generateOrEditImage = async (prompt: string) => {
  // We return a text description to keep the app working smoothly
  const desc = await generateText(`Describe a scene showing: ${prompt}`);
  return `(Image generation unavailable. Description: ${desc})`; 
};

// --- PLACEHOLDERS (To stop Vercel 503 Crashes) ---
export const generateVideo = async () => "Video generation is coming soon.";
export const generateSpeech = async () => null;
export const analyzeImage = async () => "Image analysis coming soon.";
export const generateSpeechFromReference = async () => null;
