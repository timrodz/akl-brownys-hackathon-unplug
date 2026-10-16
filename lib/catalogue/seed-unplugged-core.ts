import { businessItems, businesses, items } from "@/lib/db/schema";
import dataset from "./unplugged-data.json";

export type SeedUnpluggedResult = {
  items: number;
  businesses: number;
  businessItems: number;
};

export async function seedUnpluggedCatalogueWithDb(
  database: any,
): Promise<SeedUnpluggedResult> {
  const itemIdByExternal = new Map<string, string>();
  const businessIdByExternal = new Map<string, string>();

  // 1. Items
  for (const row of dataset.items) {
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

  // 2. Businesses
  for (const row of dataset.businesses) {
    const [record] = await database
      .insert(businesses)
      .values({
        source: "manual",
        externalId: row.externalId,
        name: row.name,
        description: row.description,
        businessType: row.businessType,
        acceptsHousehold: true,
        streetAddress: row.streetAddress ?? null,
        suburb: row.suburb ?? null,
        latitude: row.latitude ?? null,
        longitude: row.longitude ?? null,
        phone: row.phone ?? null,
        website: row.website ?? null,
        dropOff: true,
        chargesForDropOff: row.chargesForDropOff ?? null,
        openingHours: row.openingHours ?? null,
        sourceUrl: row.sourceUrl ?? "https://auckland-unplugged.nz",
      })
      .onConflictDoUpdate({
        target: [businesses.source, businesses.externalId],
        set: {
          name: row.name,
          description: row.description,
          businessType: row.businessType,
          streetAddress: row.streetAddress ?? null,
          suburb: row.suburb ?? null,
          latitude: row.latitude ?? null,
          longitude: row.longitude ?? null,
          phone: row.phone ?? null,
          website: row.website ?? null,
          chargesForDropOff: row.chargesForDropOff ?? null,
          openingHours: row.openingHours ?? null,
          updatedAt: new Date(),
        },
      })
      .returning({ id: businesses.id, externalId: businesses.externalId });

    businessIdByExternal.set(record.externalId, record.id);
  }

  // 3. Business-Item mappings (in chunks)
  const linksToInsert = [];
  for (const row of dataset.businessItems) {
    const businessId = businessIdByExternal.get(row.businessExternalId);
    const itemId = itemIdByExternal.get(row.itemExternalId);

    if (businessId && itemId) {
      linksToInsert.push({
        businessId,
        itemId,
        role: "drop_off" as const,
      });
    }
  }

  const chunkSize = 100;
  for (let i = 0; i < linksToInsert.length; i += chunkSize) {
    const chunk = linksToInsert.slice(i, i + chunkSize);
    await database.insert(businessItems).values(chunk).onConflictDoNothing();
  }

  return {
    items: itemIdByExternal.size,
    businesses: businessIdByExternal.size,
    businessItems: linksToInsert.length,
  };
}
