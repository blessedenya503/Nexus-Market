import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateProductDescription = async (productName: string, features: string[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a professional, engaging product description for "${productName}" with these features: ${features.join(", ")}. Keep it under 150 words.`,
  });
  return response.text;
};

export const summarizeReviews = async (reviews: string[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Summarize these customer reviews into a concise pros and cons list: \n${reviews.join("\n")}`,
  });
  return response.text;
};

export const getRecommendations = async (userInterests: string[], recentPurchases: string[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these interests: ${userInterests.join(", ")} and recent purchases: ${recentPurchases.join(", ")}, suggest 5 product categories or types the user might like. Return as a JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const semanticSearch = async (query: string, productList: any[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Given the user query: "${query}", and this list of products: ${JSON.stringify(productList.map(p => ({ id: p.id, name: p.name, description: p.description })))}, return the IDs of the top 5 most relevant products in order of relevance. Return as a JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};
