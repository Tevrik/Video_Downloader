import { GoogleGenAI } from "@google/genai";

// Safe initialization
const apiKey = process.env.API_KEY || ''; 
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateSmartTitle = async (originalTitle: string): Promise<string> => {
  if (!ai) return originalTitle;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Clean up this video filename to be SEO friendly and readable. Remove special chars and IDs. Keep it short. Input: "${originalTitle}"`,
    });
    return response.text.trim().replace(/^"|"$/g, '') || originalTitle;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return originalTitle;
  }
};

export const suggestTags = async (title: string): Promise<string[]> => {
  if (!ai) return ['video', 'download'];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 comma-separated relevant tags for a video titled: "${title}". Return only the tags.`,
    });
    const text = response.text;
    return text.split(',').map(s => s.trim()).slice(0, 5);
  } catch (error) {
    return ['viral', 'trending', 'video'];
  }
};
