// --- FINAL FIX (Corrected Model Name) ---

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!key) {
    console.error("CRITICAL: API Key is missing.");
    return null;
  }
  return key;
};

// --- CHAT (Using 'gemini-flash-latest') ---
export const generateMarketingChat = async (history: any[], text: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: API Key is missing.";

  // CORRECT NAME: 'gemini-flash-latest' (From your list)
  // This alias automatically points to the best available Flash model for your key
  const primaryModel = "gemini-flash-latest";

  // Helper to run the fetch
  const runChat = async (modelName: string, payload: any) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  };

  // Format history
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: text }] });

  try {
    // --- ATTEMPT 1: gemini-flash-latest ---
    let data = await runChat(primaryModel, { contents });

    // If that fails (e.g. Quota), try the Backup
    if (data.error) {
      console.warn(`Primary (${primaryModel}) failed:`, data.error.message);
      
      // --- ATTEMPT 2: gemini-2.0-flash-lite-001 ---
      // This is a lightweight model in your list that often has free quota
      const backupModel = "gemini-2.0-flash-lite-001";
      console.log(`Switching to backup: ${backupModel}`);
      data = await runChat(backupModel, { contents });
    }

    // Success Check
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }

    // If we still have an error, show it
    if (data.error) {
      return `(API Error: ${data.error.message})`;
    }

    return "Service busy (No text returned).";

  } catch (error) {
    return "Connection failed.";
  }
};

// --- IMAGE GENERATION ---
export const generateOrEditImage = async (prompt: string) => {
  const apiKey = getApiKey();
  // Using the model from your list
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
    
    // If quota exceeded, just say so instead of crashing
    if (data.error?.code === 429) return "(Daily image limit reached)";
    
    return "(Image generation unavailable)";

  } catch (e) {
    return "Image generation failed.";
  }
};

// --- TEXT GENERATION ---
export const generateText = async (prompt: string) => {
  return await generateMarketingChat([], prompt);
};

// --- STUBS ---
export const generateVideo = async () => "Video generation coming soon.";
export const generateSpeech = async () => null;
export const analyzeImage = async () => "Image analysis coming soon.";
export const generateSpeechFromReference = async () => null;
