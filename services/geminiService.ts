// --- FINAL CONFIGURATION (Gemini 2.0) ---

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!key) {
    console.error("CRITICAL: API Key is missing. Check Vercel Environment Variables.");
    return null;
  }
  return key;
};

// --- CHAT (Using Gemini 2.0 Flash) ---
export const generateMarketingChat = async (history: any[], text: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: API Key is missing.";

  // UPDATED: Using a model from your authorized list
  const modelName = "gemini-2.0-flash-001"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

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

    if (!response.ok) {
      console.error("API Error:", data);
      return `Error: ${data.error?.message || "Unknown error"}`;
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

  } catch (error) {
    console.error("Network Error:", error);
    return "Connection failed. Please check your internet.";
  }
};

// --- TEXT GENERATION (Using Gemini 2.0 Flash) ---
export const generateText = async (prompt: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: Key missing";

  const modelName = "gemini-2.0-flash-001";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

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

// --- IMAGE GENERATION (Using Your Experimental Image Model) ---
export const generateOrEditImage = async (prompt: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: Key missing";

  // Using the specific image generation model from your list
  const modelName = "gemini-2.0-flash-exp-image-generation";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    
    // Check if we got an image back (inlineData)
    const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    
    if (inlineData) {
      return `data:image/png;base64,${inlineData.data}`;
    } else {
      // Fallback: If image gen fails, return a text description instead of crashing
      const text = await generateText(`Describe an image of: ${prompt}`);
      return `(Image generation unavailable. Description: ${text})`;
    }

  } catch (e) {
    return "Image generation failed.";
  }
};

// --- STUBS ---
export const generateVideo = async () => "Video generation coming soon.";
export const generateSpeech = async () => null;
export const analyzeImage = async () => "Image analysis coming soon.";
export const generateSpeechFromReference = async () => null;
