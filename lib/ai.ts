import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
export const GEMINI_MODEL_ID = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
const apiKey = [process.env.GEMINI_API_KEY, process.env.GOOGLE_GENERATIVE_AI_API_KEY].find(value => value?.trim())?.trim();
if (!apiKey) {
    console.warn("[lib/ai] Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY for inference.");
}
const google = createGoogleGenerativeAI({
    apiKey: apiKey ?? "",
});
export const defaultModel = google(GEMINI_MODEL_ID);
export const hasGeminiApiKey = (): boolean => Boolean(apiKey);
export { google };
