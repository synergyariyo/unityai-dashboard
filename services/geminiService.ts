// --- FINAL FORCE UPDATE (Model: Gemini 2.0 Flash Lite) ---

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!key) console.error("API Key Missing");
  return key;
};

// I renamed this function internally to force Vercel to rebuild it
export const generateMarketingChat = async (history: any[], text: string) => {
  const apiKey = getApiKey();
  
  // WE ARE USING ONLY THE "LITE" MODEL
  // This is the fastest, cheapest, and most available model on your list.
  const model = "gemini-2.0-flash-lite-001";
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }
    
    // If we see the error you mentioned, we print a specific message
    if (data.error) {
      return `(API Error: ${data.error.message}. This proves the code Updated.)`;
    }

    return "No response.";

  } catch (error) {
    return "Network Error.";
  }
};

// --- STUBS ---
export const generateText = async (prompt: string) => await generateMarketingChat([], prompt);
export const generateOrEditImage = async () => "(Images paused for system test)";
export const generateVideo = async () => "Video paused";
export const generateSpeech = async () => null;
export const analyzeImage = async () => "Analysis paused";
export const generateSpeechFromReference = async () => null;
