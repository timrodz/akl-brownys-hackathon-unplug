import { and, eq, or } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "@/lib/db/schema";
import { businessItems } from "@/lib/db/schema";

type Db = PostgresJsDatabase<typeof schema>;

/** Remove existing links for the same (business_id, item_id) pairs before re-insert. */
export async function clearBusinessItemPairs(
  database: Db,
  pairs: Array<{ businessId: string; itemId: string }>,
): Promise<void> {
  if (pairs.length === 0) return;

  const batchSize = 50;
  for (let i = 0; i < pairs.length; i += batchSize) {
    const chunk = pairs.slice(i, i + batchSize);
    await database.delete(businessItems).where(
      or(
        ...chunk.map((p) =>
          and(
            eq(businessItems.businessId, p.businessId),
            eq(businessItems.itemId, p.itemId),
          ),
        ),
      ),
    );
  }
}
