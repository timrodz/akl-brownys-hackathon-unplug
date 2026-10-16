/**
 * Apply Drizzle SQL migrations. If the DB was created with `db:push` and has no
 * journal rows, baseline earlier migrations that already match the live schema.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { loadProjectEnv, projectRoot } from "./load-env";

const MIGRATIONS_FOLDER = resolve(projectRoot, "drizzle");
const JOURNAL_PATH = resolve(MIGRATIONS_FOLDER, "meta/_journal.json");

type Journal = {
  entries: Array<{ tag: string; when: number }>;
};

function migrationHash(tag: string): string {
  const sql = readFileSync(resolve(MIGRATIONS_FOLDER, `${tag}.sql`), "utf8");
  return createHash("sha256").update(sql).digest("hex");
}

async function baselinePushCreatedDb(sql: postgres.Sql): Promise<void> {
  const journal = JSON.parse(readFileSync(JOURNAL_PATH, "utf8")) as Journal;
  const applied = await sql<{ hash: string }[]>`
    SELECT hash FROM drizzle.__drizzle_migrations
  `;
  if (applied.length > 0) {
    return;
  }

  const hasCatalogue = await sql<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'items'
    ) AS exists
  `;
  if (!hasCatalogue[0]?.exists) {
    return;
  }

  const initial = journal.entries[0];
  if (!initial) {
    return;
  }

  const hash = migrationHash(initial.tag);
  await sql`
    INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES (${hash}, ${initial.when})
  `;
  console.log(`Baselined ${initial.tag} (schema already present from db:push).`);
}

async function run(): Promise<void> {
  loadProjectEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const connection = postgres(url, { max: 1 });
  try {
    await baselinePushCreatedDb(connection);
    const db = drizzle(connection);
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    console.log("Migrations applied.");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }

  process.exit(process.exitCode ?? 0);
}

run();
