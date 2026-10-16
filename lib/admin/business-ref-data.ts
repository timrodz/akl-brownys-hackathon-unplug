import "server-only";

import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessTypes } from "@/lib/db/schema";

export type BusinessTypeOption = {
  id: string;
  name: string;
  description: string | null;
};

export async function loadBusinessTypes(): Promise<BusinessTypeOption[]> {
  if (!db) return [];
  try {
    const rows = await db
      .select({
        id: businessTypes.businessTypeId,
        name: businessTypes.businessTypeName,
        description: businessTypes.description,
      })
      .from(businessTypes)
      .orderBy(asc(businessTypes.businessTypeName));
    return rows;
  } catch {
    return [];
  }
}
