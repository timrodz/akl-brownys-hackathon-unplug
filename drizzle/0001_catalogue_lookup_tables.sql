CREATE TABLE "business_types" (
	"business_type_id" text PRIMARY KEY NOT NULL,
	"business_type_name" text NOT NULL,
	"next_life_level" smallint,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "data_dictionary" (
	"entity" text NOT NULL,
	"column_name" text NOT NULL,
	"description" text,
	"example" text
);
--> statement-breakpoint
CREATE TABLE "item_types" (
	"item_type_id" text PRIMARY KEY NOT NULL,
	"item_type_name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX "data_dictionary_entity_column_uidx" ON "data_dictionary" USING btree ("entity","column_name");