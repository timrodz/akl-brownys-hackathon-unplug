import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: string }>({
  dataType() {
    return "bytea";
  },
  fromDriver(value) {
    if (typeof value === "string") {
      return Buffer.from(value, "hex");
    }
    return value as Buffer;
  },
});

export const submissionStatusEnum = pgEnum("submission_status", [
  "received",
  "matched",
  "results_ready",
  "failed",
]);

export const locationSourceEnum = pgEnum("location_source", [
  "postcode",
  "geolocation",
]);

export const dataSourceEnum = pgEnum("data_source", [
  "council_directory",
  "recyclemap",
  "repair_cafe",
  "techcollect",
  "wasteminz",
  "osm",
  "manual",
]);

export const matchMethodEnum = pgEnum("match_method", [
  "keyword",
  "ai",
  "manual",
]);

export const businessItemRoleEnum = pgEnum("business_item_role", [
  "drop_off",
  "collection",
  "repair",
  "reuse",
]);

export const pathwayEnum = pgEnum("pathway", [
  "reduce",
  "reuse",
  "repair",
  "recycle",
  "dispose",
]);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    description: text("description").notNull(),
    postcode: text("postcode"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    locationSource: locationSourceEnum("location_source"),
    photoData: bytea("photo_data"),
    photoMime: text("photo_mime"),
    photoSizeBytes: integer("photo_size_bytes"),
    status: submissionStatusEnum("status").default("received").notNull(),
    errorMessage: text("error_message"),
  },
  (table) => [
    index("submissions_created_at_idx").on(table.createdAt),
    index("submissions_status_idx").on(table.status),
  ],
);

/** Public-domain locality means; postcode is text to preserve leading zeroes. */
export const postcodeCentroids = pgTable("postcode_centroids", {
  postcode: text("postcode").primaryKey(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  localityCount: integer("locality_count").notNull(),
  localities: text("localities").array().notNull(),
  regions: text("regions").array().notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceSha256: text("source_sha256").notNull(),
  importedAt: timestamp("imported_at", { withTimezone: true }).defaultNow().notNull(),
});

export const items = pgTable(
  "items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: dataSourceEnum("source").notNull(),
    externalId: text("external_id").notNull(),
    title: text("title").notNull(),
    keywords: text("keywords").array(),
    hazardAlert: text("hazard_alert"),
    disposalGuidance: text("disposal_guidance"),
    slug: text("slug"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("items_source_external_id_uidx").on(
      table.source,
      table.externalId,
    ),
    index("items_title_idx").on(table.title),
  ],
);

/** One catalogue match per submission (user decision). */
export const submissionItems = pgTable(
  "submission_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    itemId: uuid("item_id").references(() => items.id, {
      onDelete: "set null",
    }),
    descriptionSnapshot: text("description_snapshot").notNull(),
    matchConfidence: real("match_confidence"),
    matchMethod: matchMethodEnum("match_method"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("submission_items_submission_id_uidx").on(table.submissionId),
  ],
);

export const businesses = pgTable(
  "businesses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: dataSourceEnum("source").notNull(),
    externalId: text("external_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    businessType: text("business_type"),
    acceptsHousehold: boolean("accepts_household"),
    acceptsCommercial: boolean("accepts_commercial"),
    streetAddress: text("street_address"),
    suburb: text("suburb"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    dropOff: boolean("drop_off"),
    dropOffNotes: text("drop_off_notes"),
    chargesForDropOff: text("charges_for_drop_off"),
    paymentMethods: text("payment_methods"),
    paysForMaterial: text("pays_for_material"),
    offersCollection: boolean("offers_collection"),
    collectionCharge: text("collection_charge"),
    openingHours: text("opening_hours"),
    status: text("status"),
    sourceUrl: text("source_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("businesses_source_external_id_uidx").on(
      table.source,
      table.externalId,
    ),
    index("businesses_name_idx").on(table.name),
  ],
);

export const businessItems = pgTable(
  "business_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    role: businessItemRoleEnum("role"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("business_items_business_item_role_uidx").on(
      table.businessId,
      table.itemId,
      table.role,
    ),
    index("business_items_item_id_idx").on(table.itemId),
  ],
);

/** Persisted 4R guidance shown to the resident for a submission. */
export const recommendations = pgTable(
  "recommendations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    pathway: pathwayEnum("pathway").notNull(),
    sortOrder: smallint("sort_order").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    businessId: uuid("business_id").references(() => businesses.id, {
      onDelete: "set null",
    }),
    distanceKm: real("distance_km"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("recommendations_submission_id_idx").on(table.submissionId),
    index("recommendations_submission_sort_idx").on(
      table.submissionId,
      table.sortOrder,
    ),
  ],
);

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  submissionItem: one(submissionItems, {
    fields: [submissions.id],
    references: [submissionItems.submissionId],
  }),
  recommendations: many(recommendations),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  submissionItems: many(submissionItems),
  businessItems: many(businessItems),
}));

export const submissionItemsRelations = relations(
  submissionItems,
  ({ one }) => ({
    submission: one(submissions, {
      fields: [submissionItems.submissionId],
      references: [submissions.id],
    }),
    item: one(items, {
      fields: [submissionItems.itemId],
      references: [items.id],
    }),
  }),
);

export const businessesRelations = relations(businesses, ({ many }) => ({
  businessItems: many(businessItems),
  recommendations: many(recommendations),
}));

export const businessItemsRelations = relations(businessItems, ({ one }) => ({
  business: one(businesses, {
    fields: [businessItems.businessId],
    references: [businesses.id],
  }),
  item: one(items, {
    fields: [businessItems.itemId],
    references: [items.id],
  }),
}));

export const recommendationsRelations = relations(
  recommendations,
  ({ one }) => ({
    submission: one(submissions, {
      fields: [recommendations.submissionId],
      references: [submissions.id],
    }),
    business: one(businesses, {
      fields: [recommendations.businessId],
      references: [businesses.id],
    }),
  }),
);
