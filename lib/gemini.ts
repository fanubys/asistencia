import { GoogleGenAI } from "@google/genai";

// As per instructions, assume process.env.API_KEY is available in the execution environment.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.error("Gemini API key (API_KEY) is not set in the environment. Avatar generation will fail.");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });

/**
 * Generates a unique, abstract avatar for a student using the Gemini API.
 * @param studentName The name of the student, used to add uniqueness to the prompt.
 * @returns A base64 encoded JPEG data URL string.
 */
export async function generateAvatar(studentName: string): Promise<string> {
  // Fallback to a placeholder if the API key is missing.
  if (!apiKey) {
      return `https://picsum.photos/seed/${studentName}/100`;
  }

  try {
    const prompt = `A modern, minimalist, abstract avatar for a student named ${studentName}. Geometric shapes, vibrant and friendly color palette (e.g., teal, coral, indigo), clean lines. No text or letters. Style: flat design.`;

    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      console.warn('Image generation did not return any images. Falling back to default.');
      return `https://picsum.photos/seed/${studentName}/100`; // Fallback
    }
  } catch (error) {
    console.error('Error generating avatar with Gemini API:', error);
    // Fallback to picsum if the API call fails
    return `https://picsum.photos/seed/${studentName}/100`;
  }
}
