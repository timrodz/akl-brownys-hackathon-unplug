CREATE TABLE "postcode_centroids" (
	"postcode" text PRIMARY KEY NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"locality_count" integer NOT NULL,
	"localities" text[] NOT NULL,
	"regions" text[] NOT NULL,
	"source_url" text NOT NULL,
	"source_sha256" text NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL
);
