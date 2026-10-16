/**
 * Seed the complete Auckland Unplugged catalogue (60 items, 214 businesses, 2407 links) into PostgreSQL.
 * Usage: pnpm db:seed:unplugged (or tsx scripts/seed-unplugged.ts)
 */
import { seedUnpluggedCatalogueWithDb } from "../lib/catalogue/seed-unplugged-core";
import { createScriptDb } from "../lib/db/create-client";
import { loadProjectEnv } from "./load-env";

async function run(): Promise<void> {
  loadProjectEnv();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Set DATABASE_URL before seeding.");
    process.exit(1);
  }

  const { db, close } = createScriptDb(url);

  try {
    const result = await seedUnpluggedCatalogueWithDb(db);
    console.log(
      `Seeded ${result.items} items, ${result.businesses} businesses, ${result.businessItems} business-item links from Auckland Unplugged dataset.`,
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
