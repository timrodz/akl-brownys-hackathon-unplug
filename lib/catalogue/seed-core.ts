import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "@/lib/db/schema";
import {
  businessItems,
  businesses,
  items,
} from "@/lib/db/schema";

import {
  SEED_BUSINESSES,
  SEED_BUSINESS_ITEMS,
  SEED_ITEMS,
} from "./seed-data";

export type SeedCatalogueResult = {
  items: number;
  businesses: number;
  businessItems: number;
};

type Db = PostgresJsDatabase<typeof schema>;

export async function seedCatalogueWithDb(
  database: Db,
): Promise<SeedCatalogueResult> {
  const itemIdByExternal = new Map<string, string>();
  const businessIdByExternal = new Map<string, string>();

  for (const row of SEED_ITEMS) {
    const [record] = await database
      .insert(items)
      .values({
        source: "manual",
        externalId: row.externalId,
        title: row.title,
        keywords: row.keywords,
        hazardAlert: row.hazardAlert ?? null,
        disposalGuidance: row.disposalGuidance,
        slug: row.slug,
      })
      .onConflictDoUpdate({
        target: [items.source, items.externalId],
        set: {
          title: row.title,
          keywords: row.keywords,
          hazardAlert: row.hazardAlert ?? null,
          disposalGuidance: row.disposalGuidance,
          slug: row.slug,
          updatedAt: new Date(),
        },
      })
      .returning({ id: items.id, externalId: items.externalId });

    itemIdByExternal.set(record.externalId, record.id);
  }

  for (const row of SEED_BUSINESSES) {
    const [record] = await database
      .insert(businesses)
      .values({
        source: "manual",
        externalId: row.externalId,
        name: row.name,
        description: row.description,
        businessType: row.businessType,
        acceptsHousehold: true,
        acceptsCommercial: false,
        streetAddress: row.streetAddress,
        suburb: row.suburb,
        latitude: row.latitude,
        longitude: row.longitude,
        phone: row.phone ?? null,
        website: row.website ?? null,
        dropOff: row.dropOff,
        dropOffNotes: row.dropOffNotes ?? null,
        chargesForDropOff: row.chargesForDropOff ?? null,
        openingHours: row.openingHours ?? null,
        sourceUrl: row.sourceUrl,
        status: "demo",
      })
      .onConflictDoUpdate({
        target: [businesses.source, businesses.externalId],
        set: {
          name: row.name,
          description: row.description,
          businessType: row.businessType,
          streetAddress: row.streetAddress,
          suburb: row.suburb,
          latitude: row.latitude,
          longitude: row.longitude,
          phone: row.phone ?? null,
          website: row.website ?? null,
          dropOff: row.dropOff,
          dropOffNotes: row.dropOffNotes ?? null,
          chargesForDropOff: row.chargesForDropOff ?? null,
          openingHours: row.openingHours ?? null,
          sourceUrl: row.sourceUrl,
          updatedAt: new Date(),
        },
      })
      .returning({ id: businesses.id, externalId: businesses.externalId });

    businessIdByExternal.set(record.externalId, record.id);
  }

  let linkCount = 0;
  for (const link of SEED_BUSINESS_ITEMS) {
    const itemId = itemIdByExternal.get(link.itemExternalId);
    const businessId = businessIdByExternal.get(link.businessExternalId);
    if (!itemId || !businessId) continue;

    await database
      .insert(businessItems)
      .values({
        businessId,
        itemId,
        role: link.role,
        notes: link.notes ?? null,
      })
      .onConflictDoNothing({
        target: [
          businessItems.businessId,
          businessItems.itemId,
          businessItems.role,
        ],
      });
    linkCount += 1;
  }

  return {
    items: SEED_ITEMS.length,
    businesses: SEED_BUSINESSES.length,
    businessItems: linkCount,
  };
}
