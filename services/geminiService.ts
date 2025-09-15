
import { GoogleGenAI } from "@google/genai";
import { Goal } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this environment, we assume it's always available.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getFinancialTip = async (goal: Goal): Promise<string> => {
  if (!API_KEY) {
    return "API Key not configured. Please set the API_KEY environment variable.";
  }

  try {
    const prompt = `You are a helpful financial advisor. Provide a short, actionable, and motivational tip for someone trying to achieve the following financial goal: "${goal.name}" with a target of $${goal.targetAmount}. Keep the tip under 50 words and be encouraging.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching financial tip from Gemini API:", error);
    return "Sorry, I couldn't fetch a tip right now. Please try again later.";
  }
};
