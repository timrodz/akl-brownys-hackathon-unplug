import "server-only";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { matchItemByKeywords } from "@/lib/submissions/match-item";
/** AI output is evidence, not a new catalogue category. Never create an item here. */
export async function checkCatalogueDescription(description: string) {
 if (!db) return {catalogueMatch:null,catalogueWarning:"Item catalogue is unavailable. Please check the identified item before submitting."};
 try {
  const catalogue=await db.select({id:items.id,title:items.title,keywords:items.keywords,externalId:items.externalId}).from(items);
  const match=matchItemByKeywords(description,catalogue.filter(item => !item.externalId.startsWith("demo-")));
  return {catalogueMatch:match.item?{id:match.item.id,title:match.item.title,confidence:match.confidence}:null,catalogueWarning:match.item?null:"No clear match in the item catalogue. Please use a specific item name; we will not force a category."};
 }catch{return {catalogueMatch:null,catalogueWarning:"The item catalogue could not be checked. Please review the description before submitting."};}
}
