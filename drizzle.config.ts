import { defineConfig } from "drizzle-kit";

import { loadProjectEnv } from "./scripts/load-env";

loadProjectEnv();

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
