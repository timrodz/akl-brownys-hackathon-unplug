/**
 * Load demo catalogue (5 items, 3 businesses) into Neon.
 * Usage: DATABASE_URL=... pnpm db:seed
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { seedCatalogueWithDb } from "../lib/catalogue/seed-core";
import * as schema from "../lib/db/schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL before seeding.");
  process.exit(1);
}

const cliDb = drizzle(neon(url), { schema });

async function main() {
  const result = await seedCatalogueWithDb(cliDb);
  console.log(
    `Seeded ${result.items} items, ${result.businesses} businesses, ${result.businessItems} business-item links.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
