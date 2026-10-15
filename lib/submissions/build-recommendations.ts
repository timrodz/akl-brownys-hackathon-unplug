import type { InferSelectModel } from "drizzle-orm";

import { haversineKm } from "@/lib/location/geocode";
import type {
  businesses,
  businessItemRoleEnum,
  items,
  pathwayEnum,
} from "@/lib/db/schema";

type Pathway = (typeof pathwayEnum.enumValues)[number];
type Role = (typeof businessItemRoleEnum.enumValues)[number];

export type BusinessWithRole = {
  business: InferSelectModel<typeof businesses>;
  role: Role | null;
  notes: string | null;
};

export type RecommendationDraft = {
  pathway: Pathway;
  sortOrder: number;
  title: string;
  body: string;
  businessId: string | null;
  distanceKm: number | null;
};

const PATHWAY_ORDER: Pathway[] = [
  "reduce",
  "reuse",
  "repair",
  "recycle",
  "dispose",
];

const ROLE_TO_PATHWAY: Partial<Record<Role, Pathway>> = {
  reuse: "reuse",
  repair: "repair",
  drop_off: "recycle",
  collection: "recycle",
};

function pathwayRank(pathway: Pathway): number {
  const index = PATHWAY_ORDER.indexOf(pathway);
  return index === -1 ? 99 : index;
}

export function buildRecommendations(
  item: InferSelectModel<typeof items>,
  linkedBusinesses: BusinessWithRole[],
  searchLat: number | null,
  searchLng: number | null,
  maxDistanceKm = 80,
): RecommendationDraft[] {
  const drafts: RecommendationDraft[] = [];
  let sortOrder = 0;

  drafts.push({
    pathway: "reduce",
    sortOrder: sortOrder++,
    title: "Use less, use longer",
    body:
      "Before disposing, check whether you still need a replacement. Keeping working items in use is often the lowest-impact option.",
    businessId: null,
    distanceKm: null,
  });

  if (item.disposalGuidance) {
    drafts.push({
      pathway: "dispose",
      sortOrder: sortOrder++,
      title: `Council-style guidance: ${item.title}`,
      body: item.disposalGuidance,
      businessId: null,
      distanceKm: null,
    });
  }

  const withDistance = linkedBusinesses
    .map((row) => {
      const lat = row.business.latitude;
      const lng = row.business.longitude;
      let distanceKm: number | null = null;
      if (
        searchLat != null &&
        searchLng != null &&
        lat != null &&
        lng != null
      ) {
        distanceKm = haversineKm(searchLat, searchLng, lat, lng);
      }
      return { ...row, distanceKm };
    })
    .filter(
      (row) =>
        row.distanceKm === null || row.distanceKm <= maxDistanceKm,
    )
    .sort((a, b) => {
      const rankA = pathwayRank(
        (a.role && ROLE_TO_PATHWAY[a.role]) ?? "recycle",
      );
      const rankB = pathwayRank(
        (b.role && ROLE_TO_PATHWAY[b.role]) ?? "recycle",
      );
      if (rankA !== rankB) return rankA - rankB;
      if (a.distanceKm != null && b.distanceKm != null) {
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

  for (const row of withDistance) {
    const pathway =
      (row.role && ROLE_TO_PATHWAY[row.role]) ?? "recycle";
    const distanceText =
      row.distanceKm != null
        ? ` About ${row.distanceKm.toFixed(1)} km from your search area.`
        : "";
    const hours = row.business.openingHours
      ? ` Hours: ${row.business.openingHours}.`
      : "";
    const charges = row.business.chargesForDropOff
      ? ` Charges: ${row.business.chargesForDropOff}.`
      : "";

    drafts.push({
      pathway,
      sortOrder: sortOrder++,
      title: row.business.name,
      body: [
        row.business.description ?? row.business.dropOffNotes ?? "",
        row.notes ?? "",
        hours,
        charges,
        distanceText,
        "Source: demo catalogue (labelled sample data).",
      ]
        .filter(Boolean)
        .join(" ")
        .trim(),
      businessId: row.business.id,
      distanceKm: row.distanceKm,
    });
  }

  drafts.sort((a, b) => {
    const p = pathwayRank(a.pathway) - pathwayRank(b.pathway);
    if (p !== 0) return p;
    return a.sortOrder - b.sortOrder;
  });

  return drafts.map((d, index) => ({ ...d, sortOrder: index }));
}
