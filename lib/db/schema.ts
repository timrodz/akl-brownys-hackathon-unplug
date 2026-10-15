import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Placeholder Drizzle schema — replace with your tables.
 * Run `pnpm db:push` after editing when `DATABASE_URL` is set.
 */
export const appMeta = pgTable("app_meta", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
