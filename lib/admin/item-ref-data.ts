import "server-only";

import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { itemTypes } from "@/lib/db/schema";

export type ItemTypeOption = {
  id: string;
  name: string;
  description: string | null;
};

export async function loadItemTypes(): Promise<ItemTypeOption[]> {
  if (!db) return [];
  try {
    const rows = await db
      .select({
        id: itemTypes.itemTypeId,
        name: itemTypes.itemTypeName,
        description: itemTypes.description,
      })
      .from(itemTypes)
      .orderBy(asc(itemTypes.itemTypeName));
    return rows;
  } catch {
    return [];
  }
}
