import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { sql } from "drizzle-orm";
import { createScriptDb } from "../lib/db/create-client";
import { postcodeCentroids } from "../lib/db/schema";
import { buildPostcodeCentroids, type LocalityRow } from "../lib/location/postcode-centroids";
import { loadProjectEnv } from "./load-env";

const sourceUrl = "https://raw.githubusercontent.com/matthewproctor/australianpostcodes/master/newzealand_postcodes.json";
const directory = new URL("../data/postcodes/", import.meta.url);

async function run() {
  loadProjectEnv();
  await mkdir(directory, { recursive: true });
  const sourcePath = new URL("newzealand-postcodes.source.json", directory);
  if (process.argv.includes("--download")) {
    const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Postcode download failed (HTTP ${response.status}).`);
    const raw = await response.text();
    if (!Array.isArray(JSON.parse(raw))) throw new Error("Unexpected postcode source format.");
    await writeFile(sourcePath, raw);
  }
  const raw = await readFile(sourcePath, "utf8");
  const rows: unknown = JSON.parse(raw);
  if (!Array.isArray(rows) || !rows.every(row => row && typeof row === "object" && "postcode" in row && "lat" in row && "long" in row)) throw new Error("Unexpected postcode source fields.");
  const result = buildPostcodeCentroids(rows as LocalityRow[]);
  if (!result.centroids.length) throw new Error("No valid postcode coordinates found; database was not changed.");
  const sourceSha256 = createHash("sha256").update(raw).digest("hex");
  const dataset = { sourceUrl, attribution: "Matthew Proctor — community-maintained NZ postcodes, public domain", sourceSha256, generatedAt: new Date().toISOString(), sourceRows: result.sourceRows, validRows: result.validRows, rejectedRows: result.rejectedRows, centroids: result.centroids };
  await writeFile(new URL("nz-postcode-centroids.json", directory), JSON.stringify(dataset, null, 2) + "\n");
  await writeFile(new URL("valid-postcodes.json", directory), JSON.stringify(result.centroids.map(row => row.postcode)) + "\n");
  console.log(JSON.stringify({ sourceRows: result.sourceRows, validRows: result.validRows, rejectedRows: result.rejectedRows, postcodes: result.centroids.length, sourceSha256 }));
  if (!process.argv.includes("--apply")) { console.log("Validated and generated sourced JSON. Add --apply to import into DATABASE_URL."); return; }
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not available here. JSON is ready; database import has not run.");
  const { db, close } = createScriptDb(url);
  try {
    await db.transaction(async tx => {
      // Dedicated, non-destructive table setup: no changes to submission/business tables.
      await tx.execute(sql`CREATE TABLE IF NOT EXISTS postcode_centroids (
        postcode text PRIMARY KEY CHECK (postcode ~ '^[0-9]{4}$'),
        latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90 AND latitude <> 0),
        longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180 AND longitude <> 0),
        locality_count integer NOT NULL CHECK (locality_count > 0), localities text[] NOT NULL, regions text[] NOT NULL,
        source_url text NOT NULL, source_sha256 text NOT NULL, imported_at timestamptz NOT NULL DEFAULT now()
      )`);
      for (let start = 0; start < result.centroids.length; start += 200) {
        await tx.insert(postcodeCentroids).values(result.centroids.slice(start, start + 200).map(row => ({ ...row, sourceUrl, sourceSha256 }))).onConflictDoUpdate({ target: postcodeCentroids.postcode, set: {
          latitude: sql`excluded.latitude`, longitude: sql`excluded.longitude`, localityCount: sql`excluded.locality_count`, localities: sql`excluded.localities`, regions: sql`excluded.regions`, sourceUrl: sql`excluded.source_url`, sourceSha256: sql`excluded.source_sha256`, importedAt: sql`now()`,
        } });
      }
    });
    console.log(`Imported ${result.centroids.length} postcode centroids into postcode_centroids.`);
  } finally { await close(); }
}

run().catch(() => { console.error("Postcode import failed. Check dataset, database connectivity and table permissions; no credentials were logged."); process.exitCode = 1; });
