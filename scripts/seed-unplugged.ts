/**
 * Seed Auckland Unplugged catalogue from data/*.csv (items → businesses → links).
 * Usage: pnpm db:seed:unplugged (or tsx scripts/seed-unplugged.ts)
 */
import path from "node:path";

import { importTableFromFile } from "../lib/catalogue/import-table";
import { createScriptDb } from "../lib/db/create-client";
import { loadProjectEnv, projectRoot } from "./load-env";

const DATA_DIR = path.resolve(projectRoot, "data");

const IMPORT_ORDER = [
  { table: "items" as const, file: "items.csv" },
  { table: "businesses" as const, file: "businesses.csv" },
  { table: "business_items" as const, file: "business_items.csv" },
];

async function run(): Promise<void> {
  loadProjectEnv();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Set DATABASE_URL before seeding.");
    process.exit(1);
  }

  const { db, close } = createScriptDb(url);

  try {
    for (const step of IMPORT_ORDER) {
      const filePath = path.join(DATA_DIR, step.file);
      const result = await importTableFromFile(db, {
        table: step.table,
        filePath,
      });
      console.log(
        `✓ ${result.table}: ${result.rows} row(s) from ${step.file}`,
      );
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await close();
  }

  process.exit(process.exitCode ?? 0);
}

run();
