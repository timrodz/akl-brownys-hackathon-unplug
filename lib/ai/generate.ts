import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";

import { defaultModel, hasGeminiApiKey } from "@/lib/ai";

/** Example structured output — replace with your own Zod schema. */
const demoOutputSchema = z.object({
  reply: z.string().describe("Short helpful reply"),
});

export type DemoGenerateResult =
  | { ok: true; data: z.infer<typeof demoOutputSchema> }
  | { ok: false; error: string };

export const demoGenerate = async (prompt: string): Promise<DemoGenerateResult> => {
  if (!hasGeminiApiKey()) {
    return { ok: false, error: "Gemini API key is not configured." };
  }

  const trimmed = prompt.trim();
  if (trimmed.length < 1) {
    return { ok: false, error: "Prompt is required." };
  }

  try {
    const { output } = await generateText({
      model: defaultModel,
      prompt: trimmed,
      output: Output.object({ schema: demoOutputSchema }),
      maxOutputTokens: 256,
      maxRetries: 1,
    });
    return { ok: true, data: output };
  } catch (cause) {
    console.error("[demoGenerate]", cause);
    return {
      ok: false,
      error: "Could not get a response from the model. Try again shortly.",
    };
  }
};
