// --- FINAL "EXPRESS LANE" CONFIGURATION ---

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!key) {
    console.error("CRITICAL: API Key is missing.");
    return null;
  }
  return key;
};

// --- CHAT (Using Flash-Lite for maximum speed/availability) ---
export const generateMarketingChat = async (history: any[], text: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: API Key is missing.";

  // PRIORITY 1: The "Lite" model (Least busy, fastest)
  const modelPriority1 = "gemini-2.0-flash-lite-001";
  
  // PRIORITY 2: The Standard 2.0 Flash (Stable)
  const modelPriority2 = "gemini-2.0-flash-001";

  // PRIORITY 3: The Old Reliable (1.5 Flash)
  const modelPriority3 = "gemini-1.5-flash-latest";

  // Helper function to try a model
  const tryModel = async (modelName: string, payload: any) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      return { error: { message: "Network Error" } };
    }
  };

  // Format the conversation
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: text }] });

  // --- EXECUTION CHAIN ---
  
  // 1. Try Lite
  let data = await tryModel(modelPriority1, { contents });

  // 2. If Lite is busy/error, try Standard 2.0
  if (data.error) {
    console.warn(`Lite model (${modelPriority1}) busy. Switching to Standard 2.0...`);
    data = await tryModel(modelPriority2, { contents });
  }

  // 3. If Standard 2.0 is busy, try Old 1.5
  if (data.error) {
    console.warn(`Standard model (${modelPriority2}) busy. Switching to Legacy 1.5...`);
    data = await tryModel(modelPriority3, { contents });
  }

  // --- RESULT HANDLING ---
  if (data.candidates && data.candidates.length > 0) {
    return data.candidates[0].content.parts[0].text;
  }

  if (data.error) {
    // If all 3 failed, we finally show the error
    return `(System Busy: All models are currently overloaded. Please wait 1 minute. Error: ${data.error.message})`;
  }

  return "No response received.";
};

// --- IMAGE GENERATION ---
export const generateOrEditImage = async (prompt: string) => {
  const apiKey = getApiKey();
  // Using the specific experimental model from your list
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
    
    if (data.error?.code === 429) return "(Daily image limit reached - Try again tomorrow)";
    
    return "(Image generation currently unavailable)";

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
