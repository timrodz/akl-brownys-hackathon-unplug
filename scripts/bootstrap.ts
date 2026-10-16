/**
 * Bootstrap catalogue from data/*.csv in FK order (items → businesses → business_items).
 * Usage: bun db:bootstrap
 */
import path from "node:path";

import {
  bootstrapCatalogue,
  CATALOGUE_BOOTSTRAP_STEPS,
} from "../lib/catalogue/bootstrap-catalogue";
import { createScriptDb } from "../lib/db/create-client";
import { loadProjectEnv, projectEnvFilePaths, projectRoot } from "./load-env";

const DEFAULT_DATA_DIR = path.join(projectRoot, "data");

function parseArgs(argv: string[]): { dataDir: string } {
  let dataDir = DEFAULT_DATA_DIR;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--data-dir" || arg === "-d") {
      dataDir = argv[++i] ?? dataDir;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: bun db:bootstrap [--data-dir <path>]

Imports (in order):
${CATALOGUE_BOOTSTRAP_STEPS.map((s) => `  ${s.file} → ${s.table}`).join("\n")}

CSV columns map 1:1 to nullable DB fields; FKs in business_items.csv
resolve to UUIDs after parents are upserted.
`);
      process.exit(0);
    }
  }
  return { dataDir };
}

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

  const { dataDir } = parseArgs(process.argv.slice(2));
  const { db, close } = createScriptDb(url);

  try {
    const result = await bootstrapCatalogue(db, { dataDir });
    for (const step of result.steps) {
      const skipped =
        step.skipped !== undefined && step.skipped > 0
          ? ` (${step.skipped} skipped: missing parent FK)`
          : "";
      console.log(
        `✓ ${step.table}: ${step.rows} row(s) from ${step.file}${skipped}`,
      );
    }
    console.log(`Done (source=${result.source}).`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await close();
  }

  process.exit(process.exitCode ?? 0);
}

run();
