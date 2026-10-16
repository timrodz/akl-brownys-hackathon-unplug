import fs from "node:fs";
import path from "node:path";
import { businessItems, businesses, items } from "../lib/db/schema";
import { createScriptDb } from "../lib/db/create-client";
import { loadProjectEnv } from "./load-env";

/** RFC 4180 CSV parser supporting quoted strings, newlines, and commas */
function parseCsv(content: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
      } else if (char === "\r") {
        if (nextChar === "\n") {
          i++;
        }
        currentRow.push(currentField);
        currentField = "";
        rows.push(currentRow);
        currentRow = [];
      } else if (char === "\n") {
        currentRow.push(currentField);
        currentField = "";
        rows.push(currentRow);
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((cell) => cell.trim().length > 0))
    .map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, index) => {
        obj[h] = row[index]?.trim() ?? "";
      });
      return obj;
    });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractKeywords(title: string, categoryName?: string): string[] {
  const terms = new Set<string>();
  terms.add(title.toLowerCase());
  for (const part of title.toLowerCase().split(/[\s/,&]+/)) {
    if (part.length > 2) terms.add(part);
  }
  if (categoryName) {
    for (const part of categoryName.toLowerCase().split(/[\s/,&]+/)) {
      if (part.length > 2 && !["and", "the", "other"].includes(part)) {
        terms.add(part);
      }
    }
  }
  return Array.from(terms);
}

export async function importUnpluggedData(dataDir: string) {
  loadProjectEnv();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Set DATABASE_URL before importing.");
    process.exit(1);
  }

  if (!fs.existsSync(dataDir)) {
    console.error(`Directory not found: ${dataDir}`);
    process.exit(1);
  }

  // 1. Read metadata lookup CSVs
  const businessTypesPath = path.join(dataDir, "business_types.csv");
  const itemTypesPath = path.join(dataDir, "item_types.csv");
  const itemsPath = path.join(dataDir, "items.csv");
  const businessesPath = path.join(dataDir, "businesses.csv");
  const businessItemsPath = path.join(dataDir, "business_items.csv");

  const businessTypes = fs.existsSync(businessTypesPath)
    ? parseCsv(fs.readFileSync(businessTypesPath, "utf-8"))
    : [];
  const itemTypes = fs.existsSync(itemTypesPath)
    ? parseCsv(fs.readFileSync(itemTypesPath, "utf-8"))
    : [];
  const rawItems = fs.existsSync(itemsPath)
    ? parseCsv(fs.readFileSync(itemsPath, "utf-8"))
    : [];
  const rawBusinesses = fs.existsSync(businessesPath)
    ? parseCsv(fs.readFileSync(businessesPath, "utf-8"))
    : [];
  const rawBusinessItems = fs.existsSync(businessItemsPath)
    ? parseCsv(fs.readFileSync(businessItemsPath, "utf-8"))
    : [];

  const businessTypeMap = new Map<string, { name: string; description: string; nextLifeLevel: number }>();
  for (const bt of businessTypes) {
    businessTypeMap.set(bt.business_type_id, {
      name: bt.business_type_name,
      description: bt.description,
      nextLifeLevel: Number.parseInt(bt.next_life_level || "6", 10),
    });
  }

  const itemTypeMap = new Map<string, string>();
  for (const it of itemTypes) {
    itemTypeMap.set(it.item_type_id, it.item_type_name);
  }

  console.log(
    `Loaded CSVs: ${rawItems.length} items, ${rawBusinesses.length} businesses, ${rawBusinessItems.length} business-item links.`,
  );

  const { db, close } = createScriptDb(url);

  try {
    const itemIdByExternal = new Map<string, string>();
    const businessIdByExternal = new Map<string, string>();

    // 2. Insert Items
    for (const row of rawItems) {
      const categoryName = itemTypeMap.get(row.item_type_id);
      const keywords = extractKeywords(row.item_name, categoryName);
      const guidanceParts = [
        row.best_next_life ? `Best next life: ${row.best_next_life}` : null,
        row.prep_before_drop_off ? `Preparation: ${row.prep_before_drop_off}` : null,
      ].filter(Boolean);

      const [record] = await db
        .insert(items)
        .values({
          source: "manual",
          externalId: row.item_id,
          title: row.item_name,
          keywords,
          hazardAlert: row.hazard || null,
          disposalGuidance: guidanceParts.join(". ") || "Responsible disposal via specialist recycler.",
          slug: slugify(row.item_name),
        })
        .onConflictDoUpdate({
          target: [items.source, items.externalId],
          set: {
            title: row.item_name,
            keywords,
            hazardAlert: row.hazard || null,
            disposalGuidance: guidanceParts.join(". ") || "Responsible disposal via specialist recycler.",
            slug: slugify(row.item_name),
            updatedAt: new Date(),
          },
        })
        .returning({ id: items.id, externalId: items.externalId });

      itemIdByExternal.set(record.externalId, record.id);
    }
    console.log(`✓ Inserted/updated ${itemIdByExternal.size} items.`);

    // 3. Insert Businesses
    for (const row of rawBusinesses) {
      const typeInfo = businessTypeMap.get(row.business_type_id);
      const lat = row.latitude ? Number.parseFloat(row.latitude) : null;
      const lng = row.longitude ? Number.parseFloat(row.longitude) : null;
      const costNotes = row.cost && row.cost.toLowerCase() !== "unknown" ? row.cost : null;

      const [record] = await db
        .insert(businesses)
        .values({
          source: "manual",
          externalId: row.business_id,
          name: row.business_name,
          description: typeInfo?.description || typeInfo?.name || "Auckland recycling / reuse location",
          businessType: typeInfo?.name || row.business_type_id,
          acceptsHousehold: true,
          streetAddress: row.address || null,
          suburb: row.suburb || null,
          latitude: Number.isFinite(lat) ? lat : null,
          longitude: Number.isFinite(lng) ? lng : null,
          phone: row.phone || null,
          website: row.website || null,
          dropOff: true,
          chargesForDropOff: costNotes,
          openingHours: row.opening_hours || null,
          sourceUrl: row.website || "https://auckland-unplugged.nz",
        })
        .onConflictDoUpdate({
          target: [businesses.source, businesses.externalId],
          set: {
            name: row.business_name,
            description: typeInfo?.description || typeInfo?.name || "Auckland recycling / reuse location",
            businessType: typeInfo?.name || row.business_type_id,
            streetAddress: row.address || null,
            suburb: row.suburb || null,
            latitude: Number.isFinite(lat) ? lat : null,
            longitude: Number.isFinite(lng) ? lng : null,
            phone: row.phone || null,
            website: row.website || null,
            chargesForDropOff: costNotes,
            openingHours: row.opening_hours || null,
            updatedAt: new Date(),
          },
        })
        .returning({ id: businesses.id, externalId: businesses.externalId });

      businessIdByExternal.set(record.externalId, record.id);
    }
    console.log(`✓ Inserted/updated ${businessIdByExternal.size} businesses.`);

    // 4. Insert Business Items in batches
    let linkedCount = 0;
    const batchSize = 100;
    const linksToInsert = [];

    for (const row of rawBusinessItems) {
      const businessId = businessIdByExternal.get(row.business_id);
      const itemId = itemIdByExternal.get(row.item_id);

      if (!businessId || !itemId) {
        continue;
      }

      linksToInsert.push({
        businessId,
        itemId,
        role: "drop_off" as const,
      });
    }

    for (let i = 0; i < linksToInsert.length; i += batchSize) {
      const chunk = linksToInsert.slice(i, i + batchSize);
      await db.insert(businessItems).values(chunk).onConflictDoNothing();
      linkedCount += chunk.length;
    }
    console.log(`✓ Linked ${linkedCount} business-item associations.`);

    return {
      items: itemIdByExternal.size,
      businesses: businessIdByExternal.size,
      links: linkedCount,
    };
  } finally {
    await close();
  }
}

async function main() {
  const dataDir = path.resolve(process.cwd(), "auckland-unplugged");
  console.log(`Importing Auckland Unplugged CSV dataset from: ${dataDir}`);
  const result = await importUnpluggedData(dataDir);
  console.log(`Done! Summary: ${result.items} items, ${result.businesses} businesses, ${result.links} mappings.`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
