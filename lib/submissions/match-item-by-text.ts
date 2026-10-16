import "server-only";

import { generateText, Output } from "ai";

import { createAnalysisModel, defaultModel, hasGeminiApiKey } from "@/lib/ai";
import { safeFailure } from "@/lib/diagnostics";
import {
  catalogueSelectionSchema,
  resolveCatalogueSelection,
  textCatalogueSelectionPrompt,
} from "@/lib/catalogue/catalogue-selection";
import { loadPhotoCatalogue } from "@/lib/catalogue/load-photo-catalogue";
import type { CatalogueItem, ItemMatchResult } from "./match-item";

/** Typed AI match for text-only submissions when keywords fail (no photo on submit). */
export async function matchItemByTextAi<T extends CatalogueItem>(
  description: string,
  catalogueItems: T[],
  reference?: string,
): Promise<ItemMatchResult<T>> {
  const empty: ItemMatchResult<T> = { item: null, confidence: 0, method: null };
  if (!hasGeminiApiKey()) return empty;

  const catalogue = await loadPhotoCatalogue();
  if (!catalogue) return empty;

  const trimmed = description.trim();
  if (!trimmed) return empty;

  try {
    const model = reference ? createAnalysisModel(reference) : defaultModel;
    const { output } = await generateText({
      model,
      prompt: textCatalogueSelectionPrompt(trimmed, catalogue),
      output: Output.object({ schema: catalogueSelectionSchema }),
      maxOutputTokens: 256,
      maxRetries: 1,
    });

    const resolved = resolveCatalogueSelection(output, catalogue, catalogueItems);
    if (!resolved) return empty;

    return {
      item: resolved.item,
      confidence: resolved.confidence,
      method: "ai",
    };
  } catch (error) {
    console.error("[submission]", {
      event: "text_catalogue_match_failed",
      reference,
      ...safeFailure(error),
    });
    return empty;
  }
}
