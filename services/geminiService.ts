import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchBookDetails = async (query: string) => {
  const ai = getClient();
  if (!ai) throw new Error("API Key configuration missing");

  const prompt = `
    I need details for a book matching the query: "${query}".
    Return a JSON object with the best match found.
    If exact match not found, return the closest.
    The language of the response content (summary) should be Portuguese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            author: { type: Type.STRING },
            publisher: { type: Type.STRING },
            isbn: { type: Type.STRING },
            pageCount: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            suggestedCategories: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            chapters: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of estimated or actual chapter titles"
            }
          },
          required: ["title", "author", "pageCount"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};