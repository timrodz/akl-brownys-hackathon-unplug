import "server-only";

import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";

import { type SeedCatalogueResult, seedCatalogueWithDb } from "./seed-core";

export type { SeedCatalogueResult };

/** Idempotent upsert of demo catalogue rows (manual source). */
export async function seedCatalogue(): Promise<SeedCatalogueResult> {
  if (!db) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return seedCatalogueWithDb(db);
}

export async function catalogueHasItems(): Promise<boolean> {
  if (!db) return false;
  const [row] = await db.select({ id: items.id }).from(items).limit(1);
  return Boolean(row);
}
