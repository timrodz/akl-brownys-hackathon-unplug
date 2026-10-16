import fs from "node:fs";
import path from "node:path";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "@/lib/db/schema";

import type { CatalogueDataSource } from "./catalogue-types";
import { importTableFromFile } from "./import-table";

type Db = PostgresJsDatabase<typeof schema>;

/** Lookup tables first, then catalogue parents, then link table. */
export const CATALOGUE_BOOTSTRAP_STEPS = [
  { table: "business_types" as const, file: "business_types.csv" },
  { table: "item_types" as const, file: "item_types.csv" },
  { table: "data_dictionary" as const, file: "data_dictionary.csv" },
  { table: "items" as const, file: "items.csv" },
  { table: "businesses" as const, file: "businesses.csv" },
  { table: "business_items" as const, file: "business_items.csv" },
] as const;

export type BootstrapCatalogueOptions = {
  dataDir: string;
  /** Row namespace for `source` + `external_id` upserts. */
  source?: CatalogueDataSource;
};

export type BootstrapCatalogueResult = {
  source: CatalogueDataSource;
  steps: Array<{ table: string; file: string; rows: number; skipped?: number }>;
};

export async function bootstrapCatalogue(
  database: Db,
  options: BootstrapCatalogueOptions,
): Promise<BootstrapCatalogueResult> {
  const source = options.source ?? "manual";
  const dataDir = path.resolve(options.dataDir);

  if (!fs.existsSync(dataDir)) {
    throw new Error(`Data directory not found: ${dataDir}`);
  }

  const steps: BootstrapCatalogueResult["steps"] = [];

  for (const step of CATALOGUE_BOOTSTRAP_STEPS) {
    const filePath = path.join(dataDir, step.file);
    const result = await importTableFromFile(database, {
      table: step.table,
      filePath,
      source,
    });
    steps.push({
      table: result.table,
      file: step.file,
      rows: result.rows,
      skipped: result.skipped,
    });
  }

  return { source, steps };
}
