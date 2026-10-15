import { hasGeminiApiKey } from "@/lib/ai";
import { isDatabaseConfigured } from "@/lib/db";

export const GET = () =>
  Response.json({
    ok: true,
    database: isDatabaseConfigured() ? "configured" : "missing",
    gemini: hasGeminiApiKey() ? "configured" : "missing",
  });
