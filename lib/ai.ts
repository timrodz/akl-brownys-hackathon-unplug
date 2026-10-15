import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
export const GEMINI_MODEL_ID = "gemini-2.5-flash";
const apiKey = process.env.Gemini_API_Key ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("[lib/ai] Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY for inference.");
}
const google = createGoogleGenerativeAI({
    apiKey: apiKey ?? "",
});
export const defaultModel = google(GEMINI_MODEL_ID);
export const hasGeminiApiKey = (): boolean => Boolean(apiKey);
export { google };
