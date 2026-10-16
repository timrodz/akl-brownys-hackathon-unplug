import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "@/lib/db/schema";
import {
  businessItems,
  businessTypes,
  businesses,
  dataDictionary,
  dataSourceEnum,
  itemTypes,
  items,
} from "@/lib/db/schema";

import type { CatalogueDataSource } from "./catalogue-types";
import { clearBusinessItemPairs } from "./business-item-links";
import {
  mapBusinessCsvRow,
  mapBusinessItemCsvRow,
  mapBusinessTypeCsvRow,
  mapDataDictionaryCsvRow,
  mapItemCsvRow,
  mapItemTypeCsvRow,
} from "./map-csv-rows";
import { parseCsv } from "./parse-csv";

export type { CatalogueDataSource } from "./catalogue-types";

export type ImportableTable =
  | "business_types"
  | "item_types"
  | "data_dictionary"
  | "items"
  | "businesses"
  | "business_items";

export type ImportTableOptions = {
  table: ImportableTable;
  filePath: string;
  /** Upsert key namespace; defaults to `manual`. */
  source?: CatalogueDataSource;
};

export type ImportTableResult = {
  table: ImportableTable;
  rows: number;
  skipped?: number;
};

type Db = PostgresJsDatabase<typeof schema>;

const DEFAULT_SOURCE: CatalogueDataSource = "manual";

function readRows(filePath: string): Array<Record<string, string>> {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  const ext = path.extname(resolved).toLowerCase();
  const raw = fs.readFileSync(resolved, "utf-8");
  if (ext === ".csv") {
    return parseCsv(raw);
  }
  if (ext === ".json") {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error(`JSON import expects a top-level array in ${resolved}`);
    }
    return parsed as Array<Record<string, string>>;
  }
  throw new Error(`Unsupported file type "${ext}" (use .csv or .json)`);
}

async function loadExternalIdMaps(
  database: Db,
  source: CatalogueDataSource,
): Promise<{
  itemIdByExternal: Map<string, string>;
  businessIdByExternal: Map<string, string>;
}> {
  const itemRows = await database
    .select({ id: items.id, externalId: items.externalId })
    .from(items)
    .where(eq(items.source, source));
  const businessRows = await database
    .select({ id: businesses.id, externalId: businesses.externalId })
    .from(businesses)
    .where(eq(businesses.source, source));

  const itemIdByExternal = new Map<string, string>();
  for (const row of itemRows) {
    itemIdByExternal.set(row.externalId, row.id);
  }
  const businessIdByExternal = new Map<string, string>();
  for (const row of businessRows) {
    businessIdByExternal.set(row.externalId, row.id);
  }
  return { itemIdByExternal, businessIdByExternal };
}

async function importBusinessTypes(
  database: Db,
  rows: Array<Record<string, string>>,
): Promise<number> {
  let count = 0;
  for (const row of rows) {
    const mapped = mapBusinessTypeCsvRow(row);
    if (!mapped) continue;

    await database
      .insert(businessTypes)
      .values(mapped)
      .onConflictDoUpdate({
        target: businessTypes.businessTypeId,
        set: {
          businessTypeName: mapped.businessTypeName,
          nextLifeLevel: mapped.nextLifeLevel,
          description: mapped.description,
        },
      });
    count++;
  }
  return count;
}

async function importItemTypes(
  database: Db,
  rows: Array<Record<string, string>>,
): Promise<number> {
  let count = 0;
  for (const row of rows) {
    const mapped = mapItemTypeCsvRow(row);
    if (!mapped) continue;

    await database
      .insert(itemTypes)
      .values(mapped)
      .onConflictDoUpdate({
        target: itemTypes.itemTypeId,
        set: {
          itemTypeName: mapped.itemTypeName,
          description: mapped.description,
        },
      });
    count++;
  }
  return count;
}

async function importDataDictionary(
  database: Db,
  rows: Array<Record<string, string>>,
): Promise<number> {
  let count = 0;
  for (const row of rows) {
    const mapped = mapDataDictionaryCsvRow(row);
    if (!mapped) continue;

    await database
      .insert(dataDictionary)
      .values(mapped)
      .onConflictDoUpdate({
        target: [dataDictionary.entity, dataDictionary.columnName],
        set: {
          description: mapped.description,
          example: mapped.example,
        },
      });
    count++;
  }
  return count;
}

async function importItems(
  database: Db,
  rows: Array<Record<string, string>>,
  source: CatalogueDataSource,
): Promise<number> {
  let count = 0;
  for (const row of rows) {
    const mapped = mapItemCsvRow(row, source);
    if (!mapped) continue;

    await database
      .insert(items)
      .values(mapped)
      .onConflictDoUpdate({
        target: [items.source, items.externalId],
        set: {
          title: mapped.title,
          keywords: mapped.keywords,
          hazardAlert: mapped.hazardAlert,
          disposalGuidance: mapped.disposalGuidance,
          slug: mapped.slug,
          updatedAt: new Date(),
        },
      });
    count++;
  }
  return count;
}

async function importBusinesses(
  database: Db,
  rows: Array<Record<string, string>>,
  source: CatalogueDataSource,
): Promise<number> {
  let count = 0;
  for (const row of rows) {
    const mapped = mapBusinessCsvRow(row, source);
    if (!mapped) continue;

    await database
      .insert(businesses)
      .values(mapped)
      .onConflictDoUpdate({
        target: [businesses.source, businesses.externalId],
        set: {
          name: mapped.name,
          description: mapped.description,
          businessType: mapped.businessType,
          acceptsHousehold: mapped.acceptsHousehold,
          acceptsCommercial: mapped.acceptsCommercial,
          streetAddress: mapped.streetAddress,
          suburb: mapped.suburb,
          latitude: mapped.latitude,
          longitude: mapped.longitude,
          phone: mapped.phone,
          email: mapped.email,
          website: mapped.website,
          dropOff: mapped.dropOff,
          dropOffNotes: mapped.dropOffNotes,
          chargesForDropOff: mapped.chargesForDropOff,
          paymentMethods: mapped.paymentMethods,
          paysForMaterial: mapped.paysForMaterial,
          offersCollection: mapped.offersCollection,
          collectionCharge: mapped.collectionCharge,
          openingHours: mapped.openingHours,
          status: mapped.status,
          sourceUrl: mapped.sourceUrl,
          updatedAt: new Date(),
        },
      });
    count++;
  }
  return count;
}

async function importBusinessItems(
  database: Db,
  rows: Array<Record<string, string>>,
  source: CatalogueDataSource,
): Promise<{ linked: number; skipped: number }> {
  const { itemIdByExternal, businessIdByExternal } =
    await loadExternalIdMaps(database, source);

  const linksToInsert: Array<(typeof businessItems.$inferInsert)> = [];
  let skipped = 0;

  for (const row of rows) {
    const mapped = mapBusinessItemCsvRow(
      row,
      itemIdByExternal,
      businessIdByExternal,
    );
    if ("missing" in mapped) {
      skipped++;
      continue;
    }
    linksToInsert.push(mapped.row);
  }

  const pairKey = (p: { businessId: string; itemId: string }) =>
    `${p.businessId}\0${p.itemId}`;
  const uniqueByPair = new Map<
    string,
    (typeof linksToInsert)[number]
  >();
  for (const link of linksToInsert) {
    uniqueByPair.set(pairKey(link), link);
  }
  const deduped = Array.from(uniqueByPair.values());

  await clearBusinessItemPairs(
    database,
    deduped.map((l) => ({ businessId: l.businessId, itemId: l.itemId })),
  );

  const batchSize = 100;
  let linked = 0;
  for (let i = 0; i < deduped.length; i += batchSize) {
    const chunk = deduped.slice(i, i + batchSize);
    await database.insert(businessItems).values(chunk);
    linked += chunk.length;
  }
  return { linked, skipped };
}

export async function importTableFromFile(
  database: Db,
  options: ImportTableOptions,
): Promise<ImportTableResult> {
  const rows = readRows(options.filePath);

  switch (options.table) {
    case "business_types": {
      const count = await importBusinessTypes(database, rows);
      return { table: options.table, rows: count };
    }
    case "item_types": {
      const count = await importItemTypes(database, rows);
      return { table: options.table, rows: count };
    }
    case "data_dictionary": {
      const count = await importDataDictionary(database, rows);
      return { table: options.table, rows: count };
    }
    case "items": {
      const source = options.source ?? DEFAULT_SOURCE;
      if (!dataSourceEnum.enumValues.includes(source)) {
        throw new Error(`Invalid source: ${source}`);
      }
      const count = await importItems(database, rows, source);
      return { table: options.table, rows: count };
    }
    case "businesses": {
      const source = options.source ?? DEFAULT_SOURCE;
      if (!dataSourceEnum.enumValues.includes(source)) {
        throw new Error(`Invalid source: ${source}`);
      }
      const count = await importBusinesses(database, rows, source);
      return { table: options.table, rows: count };
    }
    case "business_items": {
      const source = options.source ?? DEFAULT_SOURCE;
      if (!dataSourceEnum.enumValues.includes(source)) {
        throw new Error(`Invalid source: ${source}`);
      }
      const { linked, skipped } = await importBusinessItems(
        database,
        rows,
        source,
      );
      return {
        table: options.table,
        rows: linked,
        skipped,
      };
    }
    default:
      throw new Error(`Unknown table: ${options.table}`);
  }
}
