/**
 * Dedicated migration & update script for item-based approximate costs.
 * Usage: bun scripts/update-item-costs.ts
 */
import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { createScriptDb } from "../lib/db/create-client";
import { loadProjectEnv, projectEnvFilePaths, projectRoot } from "./load-env";

async function run(): Promise<void> {
  loadProjectEnv();

  const url = process.env.DATABASE_URL;
  if (!url) {
    const paths = projectEnvFilePaths();
    console.error(
      "DATABASE_URL is not set after loading:\n" +
        `  ${paths.env}\n` +
        `  ${paths.local}`,
    );
    process.exit(1);
  }

  const { db, close } = createScriptDb(url);

  try {
    console.log("1. Ensuring approx_cost and cost_type columns exist on items table...");
    await db.execute(sql`
      ALTER TABLE items 
      ADD COLUMN IF NOT EXISTS approx_cost text,
      ADD COLUMN IF NOT EXISTS cost_type text;
    `);
    console.log("✓ Columns verified.");

    console.log("2. Loading cost data from data/items.csv...");
    const csvPath = path.join(projectRoot, "data", "items.csv");
    if (!fs.existsSync(csvPath)) {
      throw new Error(`data/items.csv not found at ${csvPath}`);
    }

    const content = fs.readFileSync(csvPath, "utf-8");
    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const header = lines[0].split(",");
    const idIdx = header.indexOf("item_id");
    const costIdx = header.indexOf("approx_cost");
    const typeIdx = header.indexOf("cost_type");

    if (idIdx === -1 || costIdx === -1 || typeIdx === -1) {
      throw new Error("CSV missing required headers: item_id, approx_cost, cost_type");
    }

    let updatedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      // Basic CSV line splitter respecting quoted fields
      const row = lines[i];
      const match = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
      // Fallback split if simple regex doesn't match all columns
      const parts = row.split(",");
      const externalId = parts[0]?.trim();
      const cost = parts[parts.length - 2]?.trim();
      const costType = parts[parts.length - 1]?.trim();

      if (!externalId || !cost) continue;

      await db.execute(sql`
        UPDATE items
        SET approx_cost = ${cost},
            cost_type = ${costType || null},
            updated_at = NOW()
        WHERE external_id = ${externalId};
      `);
      updatedCount++;
    }

    console.log(`✓ Updated approximate costs for ${updatedCount} items.`);
    console.log("All item-based costs successfully updated!");
  } catch (error) {
    console.error("Failed to update item costs:", error);
    process.exitCode = 1;
  } finally {
    await close();
  }

  process.exit(process.exitCode ?? 0);
}

run();
