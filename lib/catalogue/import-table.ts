import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "@/lib/db/schema";
import {
  businessItems,
  businesses,
  dataSourceEnum,
  items,
} from "@/lib/db/schema";

import { parseCsv } from "./parse-csv";

export type CatalogueDataSource = (typeof dataSourceEnum.enumValues)[number];

export type ImportableTable = "items" | "businesses" | "business_items";

export type ImportTableOptions = {
  table: ImportableTable;
  filePath: string;
  /** Upsert key namespace; defaults to `manual`. */
  source?: CatalogueDataSource;
};

export type ImportTableResult = {
  table: ImportableTable;
  rows: number;
};

type Db = PostgresJsDatabase<typeof schema>;

const DEFAULT_SOURCE: CatalogueDataSource = "manual";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractKeywords(title: string): string[] {
  const terms = new Set<string>();
  terms.add(title.toLowerCase());
  for (const part of title.toLowerCase().split(/[\s/,&]+/)) {
    if (part.length > 2) terms.add(part);
  }
  return Array.from(terms);
}

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

async function importItems(
  database: Db,
  rows: Array<Record<string, string>>,
  source: CatalogueDataSource,
): Promise<number> {
  let count = 0;
  for (const row of rows) {
    const externalId = row.item_id ?? row.externalId;
    const title = row.item_name ?? row.title;
    if (!externalId || !title) continue;

    const keywordsRaw = row.keywords;
    const keywords =
      keywordsRaw && keywordsRaw.length > 0
        ? keywordsRaw.split("|").map((k) => k.trim()).filter(Boolean)
        : extractKeywords(title);
    const disposalGuidance =
      row.disposal_guidance ??
      row.disposalGuidance ??
      "Responsible disposal via specialist recycler.";
    const hazardAlert = row.hazard ?? row.hazardAlert ?? null;
    const slug = row.slug?.length ? row.slug : slugify(title);

    await database
      .insert(items)
      .values({
        source,
        externalId,
        title,
        keywords,
        hazardAlert: hazardAlert || null,
        disposalGuidance,
        slug,
      })
      .onConflictDoUpdate({
        target: [items.source, items.externalId],
        set: {
          title,
          keywords,
          hazardAlert: hazardAlert || null,
          disposalGuidance,
          slug,
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
    const externalId = row.business_id ?? row.externalId;
    const name = row.business_name ?? row.name;
    if (!externalId || !name) continue;

    const latRaw = row.latitude;
    const lngRaw = row.longitude;
    const lat = latRaw ? Number.parseFloat(latRaw) : null;
    const lng = lngRaw ? Number.parseFloat(lngRaw) : null;
    const cost = row.cost ?? row.chargesForDropOff;
    const costNotes =
      cost && cost.toLowerCase() !== "unknown" ? cost : null;
    const businessType = row.business_type ?? row.businessType ?? null;
    const website = row.website || null;

    await database
      .insert(businesses)
      .values({
        source,
        externalId,
        name,
        description:
          row.description ??
          businessType ??
          "Auckland recycling / reuse location",
        businessType,
        acceptsHousehold: true,
        streetAddress: row.address ?? row.streetAddress ?? null,
        suburb: row.suburb ?? null,
        latitude: Number.isFinite(lat) ? lat : null,
        longitude: Number.isFinite(lng) ? lng : null,
        phone: row.phone || null,
        website,
        dropOff: true,
        chargesForDropOff: costNotes,
        openingHours: row.opening_hours ?? row.openingHours ?? null,
        sourceUrl: website ?? row.sourceUrl ?? "https://auckland-unplugged.nz",
      })
      .onConflictDoUpdate({
        target: [businesses.source, businesses.externalId],
        set: {
          name,
          description:
            row.description ??
            businessType ??
            "Auckland recycling / reuse location",
          businessType,
          streetAddress: row.address ?? row.streetAddress ?? null,
          suburb: row.suburb ?? null,
          latitude: Number.isFinite(lat) ? lat : null,
          longitude: Number.isFinite(lng) ? lng : null,
          phone: row.phone || null,
          website,
          chargesForDropOff: costNotes,
          openingHours: row.opening_hours ?? row.openingHours ?? null,
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
): Promise<number> {
  const { itemIdByExternal, businessIdByExternal } =
    await loadExternalIdMaps(database, source);

  const linksToInsert: Array<{
    businessId: string;
    itemId: string;
    role: "drop_off";
  }> = [];

  for (const row of rows) {
    const businessExternalId =
      row.business_id ?? row.businessExternalId ?? row.businessId;
    const itemExternalId = row.item_id ?? row.itemExternalId ?? row.itemId;
    if (!businessExternalId || !itemExternalId) continue;

    const businessId = businessIdByExternal.get(businessExternalId);
    const itemId = itemIdByExternal.get(itemExternalId);
    if (!businessId || !itemId) continue;

    linksToInsert.push({
      businessId,
      itemId,
      role: "drop_off",
    });
  }

  const batchSize = 100;
  let linked = 0;
  for (let i = 0; i < linksToInsert.length; i += batchSize) {
    const chunk = linksToInsert.slice(i, i + batchSize);
    await database.insert(businessItems).values(chunk).onConflictDoNothing();
    linked += chunk.length;
  }
  return linked;
}

export async function importTableFromFile(
  database: Db,
  options: ImportTableOptions,
): Promise<ImportTableResult> {
  const source = options.source ?? DEFAULT_SOURCE;
  const rows = readRows(options.filePath);

  let count: number;
  switch (options.table) {
    case "items":
      count = await importItems(database, rows, source);
      break;
    case "businesses":
      count = await importBusinesses(database, rows, source);
      break;
    case "business_items":
      count = await importBusinessItems(database, rows, source);
      break;
    default:
      throw new Error(`Unknown table: ${options.table}`);
  }

  return { table: options.table, rows: count };
}
