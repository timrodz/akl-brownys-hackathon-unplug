import "server-only";

import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessTypes, dataSourceEnum } from "@/lib/db/schema";

export type BusinessTypeOption = {
  id: string;
  name: string;
  description: string | null;
};

export const DATA_SOURCE_OPTIONS = [
  { value: "manual", label: "Manual (Community / Local Entry)" },
  { value: "council_directory", label: "Auckland Council Directory" },
  { value: "recyclemap", label: "RecycleMap NZ" },
  { value: "repair_cafe", label: "Repair Network Aotearoa" },
  { value: "techcollect", label: "TechCollect NZ" },
  { value: "wasteminz", label: "WasteMINZ" },
  { value: "osm", label: "OpenStreetMap" },
] as const;

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
