import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-1.5-flash";

const generateContent = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let text;
    if (typeof response.text === "function") {
      text = response.text();
    } else if (typeof response.text === "string") {
      text = response.text;
    } else {
      text = response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response generated";
    }

    return text;
  } catch (error) {
    console.error("Gemini API error:", error?.message || error);
    throw error;
  }
};

export { generateContent };