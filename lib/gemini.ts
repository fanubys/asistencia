
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client with the API key from the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a unique, abstract avatar for a student using the Gemini API.
 * @param studentName The name of the student, used to add uniqueness to the prompt.
 * @returns A base64 encoded JPEG data URL string.
 */
export async function generateAvatar(studentName: string): Promise<string> {
  // Fallback to a placeholder if the API key is missing.
  if (!process.env.API_KEY) {
      console.warn('Gemini API key (API_KEY) is not configured. Falling back to default avatar.');
      return `https://picsum.photos/seed/${encodeURIComponent(studentName)}/100`;
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
      return `https://picsum.photos/seed/${encodeURIComponent(studentName)}/100`; // Fallback
    }
  } catch (error) {
    console.error('Error generating avatar with Gemini API:', error);
    // Fallback to picsum if the API call fails
    return `https://picsum.photos/seed/${encodeURIComponent(studentName)}/100`;
  }
}

// --- Nueva funcionalidad de Análisis con IA ---

export interface AttendanceSummary {
    title: string;
    summaryPoints: string[];
    suggestions: string[];
}

interface AttendanceSummaryData {
  groupAttendanceData: { name: string; Asistencia: number }[];
  overallStatusData: { name: string; value: number }[];
  totalStudents: number;
}

/**
 * Generates a friendly, structured analysis of attendance data using the Gemini API.
 * @param data The attendance data to analyze.
 * @returns A structured object with title, summary points, and suggestions.
 */
export async function generateAttendanceSummary(data: AttendanceSummaryData): Promise<AttendanceSummary> {
  if (!process.env.API_KEY) {
    throw new Error("La función de análisis con IA no está disponible. Por favor, configura la clave de API de Gemini (API_KEY).");
  }

  const prompt = `
    Analiza los siguientes datos de asistencia y genera un título, puntos de resumen y sugerencias.
    Datos: ${JSON.stringify(data, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "Eres un asistente educativo amigable y proactivo llamado 'Profe-Bot'. Tu objetivo es analizar datos de asistencia y ofrecer un resumen útil, positivo y motivador para un profesor. Usa un tono cercano y alentador y emojis para hacerlo más ameno. Proporciona un título creativo para el informe, 2-3 puntos clave en el resumen y 1-2 sugerencias accionables y amables.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "Un título creativo y positivo para el resumen de asistencia."
                    },
                    summaryPoints: {
                        type: Type.ARRAY,
                        description: "Una lista de 2 a 3 puntos clave que resumen los datos de asistencia.",
                        items: { type: Type.STRING }
                    },
                    suggestions: {
                        type: Type.ARRAY,
                        description: "Una lista de 1 a 2 sugerencias prácticas y amables para el profesor.",
                        items: { type: Type.STRING }
                    }
                },
                required: ["title", "summaryPoints", "suggestions"]
            }
        },
    });
    
    return JSON.parse(response.text) as AttendanceSummary;

  } catch (error) {
    console.error('Error generating attendance summary with Gemini API:', error);
    throw new Error("🤖 ¡Vaya! No pude generar el análisis. Parece que hubo un problema de conexión. Por favor, inténtalo de nuevo en un momento.");
  }
}