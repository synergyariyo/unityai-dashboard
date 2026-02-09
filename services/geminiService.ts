// --- Image Generation & Editing ---
export const generateOrEditImage = async (
  prompt: string,
  imageBase64?: string,
  mimeType: string = 'image/png',
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '1:1'
): Promise<string> => {
  const ai = getClient();
  const model = 'imagen-3.0-generate-001';

  try {
    // 1. Check if user is trying to EDIT (Image + Text)
    // Imagen 3.0 via API currently supports Text-to-Image best. 
    // Image-to-Image editing is often a different endpoint or model.
    if (imageBase64) {
       throw new Error("Image Editing is currently limited in the public API. Please try generating a new image from text.");
    }

    // 2. Use the CORRECT method for Images: .generateImages()
    // @ts-ignore - The SDK types might be slightly behind the live API
    const response = await ai.models.generateImages({
      model: model,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio
      }
    });

    // 3. Extract the image correctly
    const generatedImage = response.generatedImages?.[0]?.image;
    
    if (generatedImage?.imageBytes) {
      // The API returns the image as a base64 string directly
      return `data:image/jpeg;base64,${generatedImage.imageBytes}`;
    }
    
    throw new Error("No image data found in response.");
    
  } catch (error: any) {
    console.error("Image generation error:", error);
    // If Imagen 3 fails (due to free tier limits), fallback to a friendly error
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      throw new Error("Imagen 3 is not yet enabled for your API Key. Please wait for Google to rollout access to your account.");
    }
    throw error;
  }
};
