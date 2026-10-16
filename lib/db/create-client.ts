import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export type AppDb = PostgresJsDatabase<typeof schema>;

type PostgresSql = postgres.Sql;

const globalForDb = globalThis as {
  __easyreSql?: PostgresSql;
};

export function createDb(databaseUrl: string): AppDb {
  const sql =
    globalForDb.__easyreSql ??
    postgres(databaseUrl, {
      prepare: false,
      max: process.env.NODE_ENV === "production" ? 1 : 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__easyreSql = sql;
  }

  return drizzle(sql, { schema });
}

/** End the shared pool so CLI scripts (seed, migrate) can exit cleanly. */
export async function endDbConnection(): Promise<void> {
  const sql = globalForDb.__easyreSql;
  if (!sql) {
    return;
  }
  await sql.end({ timeout: 5 });
  globalForDb.__easyreSql = undefined;
}

/** One-shot client for CLI scripts; always call `close()` so the process can exit. */
export function createScriptDb(databaseUrl: string): {
  db: AppDb;
  close: () => Promise<void>;
} {
  const sql = postgres(databaseUrl, {
    prepare: false,
    max: 1,
    idle_timeout: 2,
  });

  return {
    db: drizzle(sql, { schema }),
    close: async () => {
      await sql.end({ timeout: 2 });
    },
  };
}
