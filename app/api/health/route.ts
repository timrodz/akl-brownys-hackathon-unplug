import { hasGeminiApiKey } from "@/lib/ai";
import { hasImageApiKey, IMAGE_MODEL_ID } from "@/lib/ai/classify-photo";
import { isDatabaseConfigured } from "@/lib/db";

export const GET = () =>
  Response.json({
    ok: true,
    database: isDatabaseConfigured() ? "configured" : "missing",
    gemini: hasGeminiApiKey() ? "configured" : "missing",
    imageClassifier: hasImageApiKey() ? "configured" : "missing",
    imageModel: IMAGE_MODEL_ID,
  });
