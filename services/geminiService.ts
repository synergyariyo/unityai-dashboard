// --- FINAL CASCADE CONFIGURATION (Trying 4 Valid Models) ---

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!key) {
    console.error("CRITICAL: API Key is missing.");
    return null;
  }
  return key;
};

// --- CHAT (The "Unstoppable" Chain) ---
export const generateMarketingChat = async (history: any[], text: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: API Key is missing.";

  // THESE ARE EXACTLY FROM YOUR LIST (No guessing)
  const modelsToTry = [
    "gemini-2.5-flash",        // 1. Newest Stable
    "gemini-2.0-flash-lite-001", // 2. Fastest / Least Busy
    "gemini-flash-latest",     // 3. Generic Fast Alias
    "gemini-pro-latest"        // 4. Generic Standard Alias
  ];

  // Helper to run a specific model
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
      return { error: { message: "Network Connection Failed" } };
    }
  };

  // Format the conversation
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: text }] });

  // --- THE LOOP ---
  // We try each model one by one. If one works, we stop and return the text.
  let lastError = "";

  for (const model of modelsToTry) {
    console.log(`Attempting model: ${model}...`);
    const data = await tryModel(model, { contents });

    // 1. SUCCESS: We got text back
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }

    // 2. FAILURE: Log it and continue to the next model
    if (data.error) {
      console.warn(`Model ${model} failed:`, data.error.message);
      lastError = data.error.message;
      // We do NOT return here. We loop again to try the next model.
    }
  }

  // If we get here, ALL 4 models failed.
  return `(System Busy: All available models failed. Last Error: ${lastError})`;
};

// --- IMAGE GENERATION ---
export const generateOrEditImage = async (prompt: string) => {
  const apiKey = getApiKey();
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
