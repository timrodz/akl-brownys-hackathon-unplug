import type { InferSelectModel } from "drizzle-orm";
import type { items } from "@/lib/db/schema";
export type CatalogueItem = InferSelectModel<typeof items>;
type MatchableItem = Pick<CatalogueItem, "id" | "title" | "keywords">;
export type ItemMatchResult<T = CatalogueItem> = { item: T; confidence: number; method: "keyword" } | { item: null; confidence: 0; method: null };
const GENERIC = new Set(["broken", "working", "item", "items", "household", "electrical", "electric", "appliance", "appliances", "wood", "old", "used", "small", "large", "repair", "recycle", "recycling", "reuse", "waste", "condition"]);
function words(text: string): string[] { return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean).map(word => word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word); }
/** Match whole product words/phrases, ignoring condition and generic category terms.
 * Equal best candidates remain unmatched rather than depending on catalogue order. */
export function matchItemByKeywords<T extends MatchableItem>(description: string, catalogue: T[]): ItemMatchResult<T> {
 const tokens = words(description); const text = ` ${tokens.join(" ")} `;
 const scored = catalogue.map(item => {
  const terms = [...new Set([...(item.keywords ?? []), item.title].map(term => words(term).filter(word => !GENERIC.has(word)).join(" ")).filter(Boolean))];
  const titlePhrase = words(item.title).join(" ");
  let score = titlePhrase && text.includes(` ${titlePhrase} `) ? 4 : 0;
  for (const term of terms) { if (text.includes(` ${term} `)) score += term.includes(" ") ? 3 : 2; }
  return { item, score };
 }).filter(row => row.score > 0).sort((a,b) => b.score-a.score);
 if (!scored.length || (scored[1] && scored[0].score === scored[1].score)) return {item:null,confidence:0,method:null};
 return {item:scored[0].item,confidence:Math.min(.95,.45+scored[0].score*.08),method:"keyword"};
}
