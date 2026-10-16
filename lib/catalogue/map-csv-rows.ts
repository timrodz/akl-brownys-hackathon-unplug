import type { InferInsertModel } from "drizzle-orm";

import {
  businessItemRoleEnum,
  businessItems,
  businessTypes,
  businesses,
  dataDictionary,
  itemTypes,
  items,
} from "@/lib/db/schema";
import type { CatalogueDataSource } from "./catalogue-types";

/** Trim; blank CSV cells become SQL null. */
export function emptyToNull(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function parseOptionalFloat(raw: string | undefined): number | null {
  const text = emptyToNull(raw);
  if (text === null) return null;
  const n = Number.parseFloat(text);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalBoolean(raw: string | undefined): boolean | null {
  const value = emptyToNull(raw)?.toLowerCase();
  if (["true", "yes", "1"].includes(value ?? "")) return true;
  if (["false", "no", "0"].includes(value ?? "")) return false;
  return null;
}

function parseOptionalSmallInt(raw: string | undefined): number | null {
  const text = emptyToNull(raw);
  if (text === null) return null;
  const n = Number.parseInt(text, 10);
  return Number.isFinite(n) ? n : null;
}

type BusinessTypeInsert = InferInsertModel<typeof businessTypes>;
type ItemTypeInsert = InferInsertModel<typeof itemTypes>;
type DataDictionaryInsert = InferInsertModel<typeof dataDictionary>;

type ItemInsert = Pick<
  InferInsertModel<typeof items>,
  | "source"
  | "externalId"
  | "title"
  | "keywords"
  | "hazardAlert"
  | "disposalGuidance"
  | "slug"
  | "approxCost"
  | "costType"
>;

type BusinessInsert = Pick<
  InferInsertModel<typeof businesses>,
  | "source"
  | "externalId"
  | "name"
  | "description"
  | "businessType"
  | "acceptsHousehold"
  | "acceptsCommercial"
  | "streetAddress"
  | "suburb"
  | "latitude"
  | "longitude"
  | "phone"
  | "email"
  | "website"
  | "dropOff"
  | "dropOffNotes"
  | "chargesForDropOff"
  | "paymentMethods"
  | "paysForMaterial"
  | "offersCollection"
  | "collectionCharge"
  | "openingHours"
  | "status"
  | "sourceUrl"
>;

type BusinessItemInsert = Pick<
  InferInsertModel<typeof businessItems>,
  "businessId" | "itemId" | "role" | "notes"
>;

/** `data/business_types.csv` */
export function mapBusinessTypeCsvRow(row: Record<string, string>): BusinessTypeInsert | null {
  const businessTypeId = emptyToNull(row.business_type_id);
  const businessTypeName = emptyToNull(row.business_type_name);
  if (!businessTypeId || !businessTypeName) return null;

  return {
    businessTypeId,
    businessTypeName,
    nextLifeLevel: parseOptionalSmallInt(row.next_life_level),
    description: emptyToNull(row.description),
  };
}

/** `data/item_types.csv` */
export function mapItemTypeCsvRow(row: Record<string, string>): ItemTypeInsert | null {
  const itemTypeId = emptyToNull(row.item_type_id);
  const itemTypeName = emptyToNull(row.item_type_name);
  if (!itemTypeId || !itemTypeName) return null;

  return {
    itemTypeId,
    itemTypeName,
    description: emptyToNull(row.description),
  };
}

/** `data/data_dictionary.csv` */
export function mapDataDictionaryCsvRow(row: Record<string, string>): DataDictionaryInsert | null {
  const entity = emptyToNull(row.entity);
  const columnName = emptyToNull(row.column_name);
  if (!entity || !columnName) return null;

  return {
    entity,
    columnName,
    description: emptyToNull(row.description),
    example: emptyToNull(row.example),
  };
}

/**
 * Map one `data/items.csv` row to `items` columns.
 * CSV: item_id, item_name, hazard, disposal_guidance, slug
 */
export function mapItemCsvRow(
  row: Record<string, string>,
  source: CatalogueDataSource,
): ItemInsert | null {
  const externalId = emptyToNull(row.item_id ?? row.externalId);
  const title = emptyToNull(row.item_name ?? row.title);
  if (!externalId || !title) return null;

  const keywordsRaw = emptyToNull(row.keywords);
  const keywords =
    keywordsRaw === null
      ? null
      : keywordsRaw
          .split("|")
          .map((k) => k.trim())
          .filter(Boolean);

  return {
    source,
    externalId,
    title,
    keywords: keywords && keywords.length > 0 ? keywords : null,
    hazardAlert: emptyToNull(row.hazard ?? row.hazardAlert),
    disposalGuidance: emptyToNull(row.disposal_guidance ?? row.disposalGuidance),
    slug: emptyToNull(row.slug),
    approxCost: emptyToNull(row.approx_cost ?? row.approxCost ?? row.cost),
    costType: emptyToNull(row.cost_type ?? row.costType),
  };
}

/**
 * Map one `data/businesses.csv` row to `businesses` columns.
 * CSV: business_id, business_name, business_type, address, suburb,
 * latitude, longitude, opening_hours, cost, website, phone
 */
export function mapBusinessCsvRow(
  row: Record<string, string>,
  source: CatalogueDataSource,
): BusinessInsert | null {
  const externalId = emptyToNull(row.business_id ?? row.externalId);
  const name = emptyToNull(row.business_name ?? row.name);
  if (!externalId || !name) return null;

  return {
    source,
    externalId,
    name,
    description: emptyToNull(row.description),
    businessType: emptyToNull(row.business_type ?? row.businessType),
    acceptsHousehold: parseOptionalBoolean(row.accepts_household ?? row.acceptsHousehold),
    acceptsCommercial: parseOptionalBoolean(row.accepts_commercial ?? row.acceptsCommercial),
    streetAddress: emptyToNull(row.address ?? row.streetAddress),
    suburb: emptyToNull(row.suburb),
    latitude: parseOptionalFloat(row.latitude),
    longitude: parseOptionalFloat(row.longitude),
    phone: emptyToNull(row.phone),
    email: emptyToNull(row.email),
    website: emptyToNull(row.website),
    dropOff: null,
    dropOffNotes: emptyToNull(row.drop_off_notes ?? row.dropOffNotes),
    chargesForDropOff: emptyToNull(row.cost ?? row.chargesForDropOff),
    paymentMethods: emptyToNull(row.payment_methods ?? row.paymentMethods),
    paysForMaterial: emptyToNull(row.pays_for_material ?? row.paysForMaterial),
    offersCollection: null,
    collectionCharge: emptyToNull(row.collection_charge ?? row.collectionCharge),
    openingHours: emptyToNull(row.opening_hours ?? row.openingHours),
    status: emptyToNull(row.status),
    sourceUrl: emptyToNull(row.source_url ?? row.sourceUrl),
  };
}

/** Resolve CSV external ids to UUID FKs for `business_items`. */
export function mapBusinessItemCsvRow(
  row: Record<string, string>,
  itemIdByExternal: Map<string, string>,
  businessIdByExternal: Map<string, string>,
): { row: BusinessItemInsert } | { missing: "business" | "item" | "both" } {
  const businessExternalId = emptyToNull(
    row.business_id ?? row.businessExternalId ?? row.businessId,
  );
  const itemExternalId = emptyToNull(row.item_id ?? row.itemExternalId ?? row.itemId);
  if (!businessExternalId || !itemExternalId) {
    return { missing: "both" };
  }

  const businessId = businessIdByExternal.get(businessExternalId);
  const itemId = itemIdByExternal.get(itemExternalId);
  if (!businessId && !itemId) return { missing: "both" };
  if (!businessId) return { missing: "business" };
  if (!itemId) return { missing: "item" };

  const roleRaw = emptyToNull(row.role);
  const role: BusinessItemInsert["role"] =
    roleRaw === null
      ? null
      : businessItemRoleEnum.enumValues.includes(
            roleRaw as (typeof businessItemRoleEnum.enumValues)[number],
          )
        ? (roleRaw as (typeof businessItemRoleEnum.enumValues)[number])
        : null;

  return {
    row: {
      businessId,
      itemId,
      role,
      notes: emptyToNull(row.notes),
    },
  };
}
