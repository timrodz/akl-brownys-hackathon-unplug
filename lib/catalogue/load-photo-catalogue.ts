import "server-only";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { items, itemTypes } from "@/lib/db/schema";
import type { PhotoCatalogue } from "./photo-selection";

export async function loadPhotoCatalogue(): Promise<PhotoCatalogue | null> {
  if (!db) return null;
  const [catalogueItems, types] = await Promise.all([
    db
      .select({
        id: items.id,
        title: items.title,
        keywords: items.keywords,
        externalId: items.externalId,
      })
      .from(items)
      .orderBy(asc(items.title))
      .limit(1001),
    db
      .select({
        id: itemTypes.itemTypeId,
        name: itemTypes.itemTypeName,
        description: itemTypes.description,
      })
      .from(itemTypes)
      .orderBy(asc(itemTypes.itemTypeName))
      .limit(101),
  ]);
  // Do not silently offer the model a truncated catalogue.
  if (catalogueItems.length > 1000 || types.length > 100) return null;
  const realItems = catalogueItems.filter((item) => !item.externalId.startsWith("demo-"));
  return realItems.length
    ? {
        items: realItems.map(({ id, title, keywords }) => ({ id, title, keywords })),
        itemTypes: types,
      }
    : null;
}
