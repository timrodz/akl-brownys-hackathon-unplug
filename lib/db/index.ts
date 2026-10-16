import "server-only";

import { createDb } from "./create-client";

const databaseUrl = process.env.DATABASE_URL;

export const db = databaseUrl ? createDb(databaseUrl) : null;

export const isDatabaseConfigured = (): boolean => Boolean(databaseUrl);
