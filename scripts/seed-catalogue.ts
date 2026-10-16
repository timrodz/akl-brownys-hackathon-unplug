/**
 * Load demo catalogue (5 items, 3 businesses) into Postgres.
 * Usage: bun db:seed (reads .env / .env.local)
 */
import { seedCatalogueWithDb } from "../lib/catalogue/seed-core";
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
    const result = await seedCatalogueWithDb(db);
    console.log(
      `Seeded ${result.items} items, ${result.businesses} businesses, ${result.businessItems} business-item links.`,
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
