import type { InferSelectModel } from "drizzle-orm";

import type { items } from "@/lib/db/schema";

export type CatalogueItem = InferSelectModel<typeof items>;

export type ItemMatchResult =
  | {
      item: CatalogueItem;
      confidence: number;
      method: "keyword";
    }
  | { item: null; confidence: 0; method: null };

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function tokenise(text: string): string[] {
  return normalise(text)
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

/**
 * Keyword match against catalogue titles and keywords. Returns the best item
 * when confidence is above threshold, otherwise null.
 */
export function matchItemByKeywords(
  description: string,
  catalogue: CatalogueItem[],
): ItemMatchResult {
  const tokens = tokenise(description);
  if (tokens.length === 0 || catalogue.length === 0) {
    return { item: null, confidence: 0, method: null };
  }

  let best: { item: CatalogueItem; score: number } | null = null;

  for (const item of catalogue) {
    const haystack = normalise(
      [item.title, ...(item.keywords ?? [])].join(" "),
    );
    let score = 0;
    for (const token of tokens) {
      if (haystack.includes(token)) {
        score += 1;
      }
    }
    const titleNorm = normalise(item.title);
    if (tokens.some((t) => titleNorm.includes(t))) {
      score += 2;
    }
    if (!best || score > best.score) {
      best = { item, score };
    }
  }

  if (!best || best.score < 2) {
    return { item: null, confidence: 0, method: null };
  }

  const confidence = Math.min(0.95, 0.35 + best.score * 0.12);
  return { item: best.item, confidence, method: "keyword" };
}
