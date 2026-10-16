/**
 * Upsert one catalogue table from a single CSV or JSON array file.
 *
 * Usage:
 *   tsx scripts/import-table.ts --table items --file data/items.csv
 *   tsx scripts/import-table.ts --table businesses --file data/businesses.csv
 *   tsx scripts/import-table.ts --table business_items --file data/business_items.csv
 */
import {
  type CatalogueDataSource,
  type ImportableTable,
  importTableFromFile,
} from "../lib/catalogue/import-table";
import { dataSourceEnum } from "../lib/db/schema";
import { createScriptDb } from "../lib/db/create-client";
import { loadProjectEnv, projectEnvFilePaths } from "./load-env";

const VALID_TABLES: ImportableTable[] = [
  "business_types",
  "item_types",
  "data_dictionary",
  "items",
  "businesses",
  "business_items",
];

function parseArgs(argv: string[]): {
  table: ImportableTable;
  file: string;
  source: CatalogueDataSource;
} {
  let table: ImportableTable | undefined;
  let file: string | undefined;
  let source: CatalogueDataSource = "manual";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--table" || arg === "-t") {
      table = argv[++i] as ImportableTable;
    } else if (arg === "--file" || arg === "-f") {
      file = argv[++i];
    } else if (arg === "--source" || arg === "-s") {
      source = argv[++i] as CatalogueDataSource;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  if (!table || !file) {
    console.error("Missing required --table and --file.");
    printHelp();
    process.exit(1);
  }

  if (!VALID_TABLES.includes(table)) {
    console.error(
      `Invalid --table "${table}". Use: ${VALID_TABLES.join(", ")}`,
    );
    process.exit(1);
  }

  if (!dataSourceEnum.enumValues.includes(source)) {
    console.error(
      `Invalid --source "${source}". Use: ${dataSourceEnum.enumValues.join(", ")}`,
    );
    process.exit(1);
  }

  return { table, file, source };
}

function printHelp(): void {
  console.log(`Usage: tsx scripts/import-table.ts --table <name> --file <path>

Tables: ${VALID_TABLES.join(", ")}
Source (--source): ${dataSourceEnum.enumValues.join(", ")} (default: manual)
`);
}

async function run(): Promise<void> {
  loadProjectEnv();

  const url = process.env.DATABASE_URL;
  if (!url) {
    const paths = projectEnvFilePaths();
    console.error(
      "DATABASE_URL is not set after loading:\n" +
        `  ${paths.env}\n` +
        `  ${paths.local}\n` +
        "(paths are relative to the repo root, not your shell cwd.)",
    );
    process.exit(1);
  }

  const { table, file, source } = parseArgs(process.argv.slice(2));
  const { db, close } = createScriptDb(url);

  try {
    const result = await importTableFromFile(db, {
      table,
      filePath: file,
      source,
    });
    const skipped =
      result.skipped !== undefined && result.skipped > 0
        ? ` (${result.skipped} skipped: missing parent FK)`
        : "";
    console.log(
      `✓ ${result.table}: upserted ${result.rows} row(s) from ${file}${skipped}`,
    );
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await close();
  }

  process.exit(process.exitCode ?? 0);
}

run();
