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
      title: `Item guidance: ${item.title}`,
      body: item.disposalGuidance,
      businessId: null,
      distanceKm: null,
    });
  }

  // Callers supply exact item links, not businesses guessed from broad categories.
  // Missing household eligibility is unknown; explicit refusals/closed listings are excluded.
  const eligible = linkedBusinesses.filter(row => row.business.acceptsHousehold !== false
    && !["closed", "permanently closed", "temporarily closed", "inactive", "archived", "removed", "demo"].includes(row.business.status?.trim().toLowerCase() ?? "")
    && !row.business.externalId?.startsWith("demo-"));
  const distinct = new Map<string, BusinessWithRole>();
  for (const row of eligible) {
    const previous = distinct.get(row.business.id);
    if (!previous) { distinct.set(row.business.id, { ...row }); continue; }
    const notes = [...new Set([previous.notes, row.notes].filter(Boolean))].join(" ") || null;
    const best = pathwayRank((row.role && ROLE_TO_PATHWAY[row.role]) ?? "recycle") < pathwayRank((previous.role && ROLE_TO_PATHWAY[previous.role]) ?? "recycle") ? row : previous;
    distinct.set(row.business.id, { ...best, notes });
  }
  const withDistance = [...distinct.values()]
    .map((row) => {
      const lat = row.business.latitude;
      const lng = row.business.longitude;
      let distanceKm: number | null = null;
      if (
        searchLat != null &&
        searchLng != null &&
        lat != null &&
        lng != null &&
        Number.isFinite(lat) && Number.isFinite(lng) &&
        Math.abs(lat) <= 90 && Math.abs(lng) <= 180 &&
        !(lat === 0 && lng === 0)
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
      const distance = (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
      if (!Number.isNaN(distance) && distance !== 0) return distance;
      if (rankA !== rankB) return rankA - rankB;
      return a.business.name.localeCompare(b.business.name);
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
        row.business.sourceUrl ? `Source: ${row.business.sourceUrl}` : "",
      ]
        .filter(Boolean)
        .join(" ")
        .trim(),
      businessId: row.business.id,
      distanceKm: row.distanceKm,
    });
  }

  drafts.sort((a, b) => {
    if (Boolean(a.businessId) !== Boolean(b.businessId)) return a.businessId ? 1 : -1;
    if (a.businessId && b.businessId) {
      const distance = (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
      if (!Number.isNaN(distance) && distance !== 0) return distance;
    }
    const p = pathwayRank(a.pathway) - pathwayRank(b.pathway);
    if (p !== 0) return p;
    return a.sortOrder - b.sortOrder;
  });

  return drafts.map((d, index) => ({ ...d, sortOrder: index }));
}
