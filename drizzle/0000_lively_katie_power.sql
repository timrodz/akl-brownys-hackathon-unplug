CREATE TYPE "public"."business_item_role" AS ENUM('drop_off', 'collection', 'repair', 'reuse');--> statement-breakpoint
CREATE TYPE "public"."data_source" AS ENUM('council_directory', 'recyclemap', 'repair_cafe', 'techcollect', 'wasteminz', 'osm', 'manual');--> statement-breakpoint
CREATE TYPE "public"."location_source" AS ENUM('postcode', 'geolocation');--> statement-breakpoint
CREATE TYPE "public"."match_method" AS ENUM('keyword', 'ai', 'manual');--> statement-breakpoint
CREATE TYPE "public"."pathway" AS ENUM('reduce', 'reuse', 'repair', 'recycle', 'dispose');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('received', 'matched', 'results_ready', 'failed');--> statement-breakpoint
CREATE TABLE "business_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"role" "business_item_role",
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "data_source" NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"business_type" text,
	"accepts_household" boolean,
	"accepts_commercial" boolean,
	"street_address" text,
	"suburb" text,
	"latitude" double precision,
	"longitude" double precision,
	"phone" text,
	"email" text,
	"website" text,
	"drop_off" boolean,
	"drop_off_notes" text,
	"charges_for_drop_off" text,
	"payment_methods" text,
	"pays_for_material" text,
	"offers_collection" boolean,
	"collection_charge" text,
	"opening_hours" text,
	"status" text,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "data_source" NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"keywords" text[],
	"hazard_alert" text,
	"disposal_guidance" text,
	"slug" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"pathway" "pathway" NOT NULL,
	"sort_order" smallint NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"business_id" uuid,
	"distance_km" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"item_id" uuid,
	"description_snapshot" text NOT NULL,
	"match_confidence" real,
	"match_method" "match_method",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"postcode" text,
	"latitude" double precision,
	"longitude" double precision,
	"location_source" "location_source",
	"photo_data" "bytea",
	"photo_mime" text,
	"photo_size_bytes" integer,
	"status" "submission_status" DEFAULT 'received' NOT NULL,
	"error_message" text
);
--> statement-breakpoint
ALTER TABLE "business_items" ADD CONSTRAINT "business_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_items" ADD CONSTRAINT "business_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_items" ADD CONSTRAINT "submission_items_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_items" ADD CONSTRAINT "submission_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "business_items_business_item_role_uidx" ON "business_items" USING btree ("business_id","item_id","role");--> statement-breakpoint
CREATE INDEX "business_items_item_id_idx" ON "business_items" USING btree ("item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "businesses_source_external_id_uidx" ON "businesses" USING btree ("source","external_id");--> statement-breakpoint
CREATE INDEX "businesses_name_idx" ON "businesses" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "items_source_external_id_uidx" ON "items" USING btree ("source","external_id");--> statement-breakpoint
CREATE INDEX "items_title_idx" ON "items" USING btree ("title");--> statement-breakpoint
CREATE INDEX "recommendations_submission_id_idx" ON "recommendations" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "recommendations_submission_sort_idx" ON "recommendations" USING btree ("submission_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "submission_items_submission_id_uidx" ON "submission_items" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");