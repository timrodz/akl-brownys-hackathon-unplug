import "server-only";

import { asc, count, desc, eq, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  businessItems,
  businesses,
  items,
  recommendations,
  submissionItems,
  submissions,
} from "@/lib/db/schema";

import { ADMIN_PAGE_SIZE, adminPageRange, parseAdminPage, parseOptionalUuid } from "./pagination";

export type AdminEntitySlug =
  | "submissions"
  | "items"
  | "submission-items"
  | "businesses"
  | "business-items"
  | "recommendations";

export type AdminEntityMeta = {
  slug: AdminEntitySlug;
  path: string;
  title: string;
  glossaryLabel: string;
};

export const ADMIN_ENTITIES: AdminEntityMeta[] = [
  {
    slug: "submissions",
    path: "/admin/submissions",
    title: "submissions",
    glossaryLabel: "Submissions",
  },
  {
    slug: "items",
    path: "/admin/items",
    title: "items",
    glossaryLabel: "Items",
  },
  {
    slug: "submission-items",
    path: "/admin/submission-items",
    title: "submission_items",
    glossaryLabel: "Submission items",
  },
  {
    slug: "businesses",
    path: "/admin/businesses",
    title: "businesses",
    glossaryLabel: "Businesses",
  },
  {
    slug: "business-items",
    path: "/admin/business-items",
    title: "business_items",
    glossaryLabel: "Business items",
  },
  {
    slug: "recommendations",
    path: "/admin/recommendations",
    title: "recommendations",
    glossaryLabel: "Recommendations",
  },
];

export type AdminListResult = {
  rows: Record<string, unknown>[];
  columns: string[];
  totalRows: number;
  page: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
  filterId?: string;
};

type ListParams = {
  page: number;
  filterId?: string;
};

async function countWhere(
  table:
    | typeof submissions
    | typeof items
    | typeof submissionItems
    | typeof businesses
    | typeof businessItems
    | typeof recommendations,
  where?: SQL,
): Promise<number> {
  if (!db) {
    return 0;
  }
  const query = db.select({ value: count() }).from(table);
  const [row] = where ? await query.where(where) : await query;
  return Number(row?.value ?? 0);
}

export async function loadSubmissionsList(params: ListParams): Promise<AdminListResult> {
  if (!db) {
    throw new Error("Database not configured");
  }

  const where = params.filterId ? eq(submissions.id, params.filterId) : undefined;
  const totalRows = await countWhere(submissions, where);
  const { offset, totalPages, showingFrom, showingTo } = adminPageRange(params.page, totalRows);

  const rows = await db
    .select({
      id: submissions.id,
      created_at: submissions.createdAt,
      description: submissions.description,
      postcode: submissions.postcode,
      latitude: submissions.latitude,
      longitude: submissions.longitude,
      location_source: submissions.locationSource,
      photo_attached: sql<boolean>`(${submissions.photoData} IS NOT NULL)`,
      photo_mime: submissions.photoMime,
      photo_size_bytes: submissions.photoSizeBytes,
      status: submissions.status,
      error_message: submissions.errorMessage,
    })
    .from(submissions)
    .where(where)
    .orderBy(desc(submissions.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset(offset);

  const mapped = rows.map((row) => ({
    ...row,
    photo_attached: row.photo_attached != null,
    created_at: row.created_at,
  }));

  const columns = mapped[0]
    ? Object.keys(mapped[0])
    : [
        "id",
        "created_at",
        "description",
        "postcode",
        "latitude",
        "longitude",
        "location_source",
        "photo_attached",
        "photo_mime",
        "photo_size_bytes",
        "status",
        "error_message",
      ];

  return {
    rows: mapped,
    columns,
    totalRows,
    page: Math.min(params.page, totalPages),
    totalPages,
    showingFrom,
    showingTo,
    filterId: params.filterId,
  };
}

export async function loadItemsList(params: ListParams): Promise<AdminListResult> {
  if (!db) {
    throw new Error("Database not configured");
  }

  const where = params.filterId ? eq(items.id, params.filterId) : undefined;
  const totalRows = await countWhere(items, where);
  const { offset, totalPages, showingFrom, showingTo } = adminPageRange(params.page, totalRows);

  const rows = await db
    .select()
    .from(items)
    .where(where)
    .orderBy(desc(items.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset(offset);

  const mapped = rows.map((row) => ({
    id: row.id,
    source: row.source,
    external_id: row.externalId,
    title: row.title,
    keywords: row.keywords,
    hazard_alert: row.hazardAlert,
    disposal_guidance: row.disposalGuidance,
    slug: row.slug,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }));

  const columns = mapped[0]
    ? Object.keys(mapped[0])
    : [
        "id",
        "source",
        "external_id",
        "title",
        "keywords",
        "hazard_alert",
        "disposal_guidance",
        "slug",
        "created_at",
        "updated_at",
      ];

  return {
    rows: mapped,
    columns,
    totalRows,
    page: Math.min(params.page, totalPages),
    totalPages,
    showingFrom,
    showingTo,
    filterId: params.filterId,
  };
}

export async function loadSubmissionItemsList(params: ListParams): Promise<AdminListResult> {
  if (!db) {
    throw new Error("Database not configured");
  }

  const where = params.filterId ? eq(submissionItems.id, params.filterId) : undefined;
  const totalRows = await countWhere(submissionItems, where);
  const { offset, totalPages, showingFrom, showingTo } = adminPageRange(params.page, totalRows);

  const rows = await db
    .select()
    .from(submissionItems)
    .where(where)
    .orderBy(desc(submissionItems.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset(offset);

  const mapped = rows.map((row) => ({
    id: row.id,
    submission_id: row.submissionId,
    item_id: row.itemId,
    description_snapshot: row.descriptionSnapshot,
    match_confidence: row.matchConfidence,
    match_method: row.matchMethod,
    created_at: row.createdAt,
  }));

  const columns = mapped[0]
    ? Object.keys(mapped[0])
    : [
        "id",
        "submission_id",
        "item_id",
        "description_snapshot",
        "match_confidence",
        "match_method",
        "created_at",
      ];

  return {
    rows: mapped,
    columns,
    totalRows,
    page: Math.min(params.page, totalPages),
    totalPages,
    showingFrom,
    showingTo,
    filterId: params.filterId,
  };
}

export async function loadBusinessesList(params: ListParams): Promise<AdminListResult> {
  if (!db) {
    throw new Error("Database not configured");
  }

  const where = params.filterId ? eq(businesses.id, params.filterId) : undefined;
  const totalRows = await countWhere(businesses, where);
  const { offset, totalPages, showingFrom, showingTo } = adminPageRange(params.page, totalRows);

  const rows = await db
    .select()
    .from(businesses)
    .where(where)
    .orderBy(desc(businesses.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset(offset);

  const mapped = rows.map((row) => ({
    id: row.id,
    source: row.source,
    external_id: row.externalId,
    name: row.name,
    description: row.description,
    business_type: row.businessType,
    accepts_household: row.acceptsHousehold,
    accepts_commercial: row.acceptsCommercial,
    street_address: row.streetAddress,
    suburb: row.suburb,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    email: row.email,
    website: row.website,
    drop_off: row.dropOff,
    drop_off_notes: row.dropOffNotes,
    charges_for_drop_off: row.chargesForDropOff,
    payment_methods: row.paymentMethods,
    pays_for_material: row.paysForMaterial,
    offers_collection: row.offersCollection,
    collection_charge: row.collectionCharge,
    opening_hours: row.openingHours,
    status: row.status,
    source_url: row.sourceUrl,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }));

  const columns = mapped[0] ? Object.keys(mapped[0]) : ["id", "name", "source"];

  return {
    rows: mapped,
    columns,
    totalRows,
    page: Math.min(params.page, totalPages),
    totalPages,
    showingFrom,
    showingTo,
    filterId: params.filterId,
  };
}

export async function loadBusinessItemsList(params: ListParams): Promise<AdminListResult> {
  if (!db) {
    throw new Error("Database not configured");
  }

  const where = params.filterId ? eq(businessItems.id, params.filterId) : undefined;
  const totalRows = await countWhere(businessItems, where);
  const { offset, totalPages, showingFrom, showingTo } = adminPageRange(params.page, totalRows);

  const rows = await db
    .select()
    .from(businessItems)
    .where(where)
    .orderBy(desc(businessItems.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset(offset);

  const mapped = rows.map((row) => ({
    id: row.id,
    business_id: row.businessId,
    item_id: row.itemId,
    role: row.role,
    notes: row.notes,
    created_at: row.createdAt,
  }));

  const columns = mapped[0]
    ? Object.keys(mapped[0])
    : ["id", "business_id", "item_id", "role", "notes", "created_at"];

  return {
    rows: mapped,
    columns,
    totalRows,
    page: Math.min(params.page, totalPages),
    totalPages,
    showingFrom,
    showingTo,
    filterId: params.filterId,
  };
}

export async function loadRecommendationsList(params: ListParams): Promise<AdminListResult> {
  if (!db) {
    throw new Error("Database not configured");
  }

  const where = params.filterId ? eq(recommendations.id, params.filterId) : undefined;
  const totalRows = await countWhere(recommendations, where);
  const { offset, totalPages, showingFrom, showingTo } = adminPageRange(params.page, totalRows);

  const rows = await db
    .select()
    .from(recommendations)
    .where(where)
    .orderBy(desc(recommendations.createdAt), asc(recommendations.sortOrder))
    .limit(ADMIN_PAGE_SIZE)
    .offset(offset);

  const mapped = rows.map((row) => ({
    id: row.id,
    submission_id: row.submissionId,
    pathway: row.pathway,
    sort_order: row.sortOrder,
    title: row.title,
    body: row.body,
    business_id: row.businessId,
    distance_km: row.distanceKm,
    created_at: row.createdAt,
  }));

  const columns = mapped[0]
    ? Object.keys(mapped[0])
    : [
        "id",
        "submission_id",
        "pathway",
        "sort_order",
        "title",
        "body",
        "business_id",
        "distance_km",
        "created_at",
      ];

  return {
    rows: mapped,
    columns,
    totalRows,
    page: Math.min(params.page, totalPages),
    totalPages,
    showingFrom,
    showingTo,
    filterId: params.filterId,
  };
}

export function listParamsFromSearch(
  searchParams: Record<string, string | string[] | undefined>,
): ListParams {
  return {
    page: parseAdminPage(searchParams.page),
    filterId: parseOptionalUuid(searchParams.id),
  };
}
