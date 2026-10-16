/** One-time Google address lookup for database businesses missing coordinates. */
import { and, eq, isNull, or } from "drizzle-orm";
import { businesses, dataSourceEnum } from "../lib/db/schema";
import { createScriptDb } from "../lib/db/create-client";
import { loadProjectEnv } from "./load-env";

async function run() {
  loadProjectEnv();
  const source = process.argv.find(arg => arg.startsWith("--source="))?.split("=")[1] ?? "recyclemap";
  if (!dataSourceEnum.enumValues.some(value => value === source)) throw new Error("Invalid source.");
  const limit = Number(process.argv.find(arg => arg.startsWith("--limit="))?.split("=")[1] ?? 50);
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error("Limit must be between 1 and 500.");
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("Database connection is unavailable.");
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const apply = process.argv.includes("--apply");
  if (apply && !key) throw new Error("Google Maps configuration is unavailable.");
  const { db, close } = createScriptDb(url);
  const missing = or(isNull(businesses.latitude), isNull(businesses.longitude), and(eq(businesses.latitude, 0), eq(businesses.longitude, 0)));
  let updated = 0, skipped = 0, failed = 0;
  try {
    const rows = await db.select().from(businesses).where(and(eq(businesses.source, source as typeof dataSourceEnum.enumValues[number]), missing)).orderBy(businesses.id).limit(limit);
    const candidates = rows.filter(row => row.status !== "demo" && !row.externalId.startsWith("demo-") && row.streetAddress?.trim());
    console.log(`${candidates.length} eligible businesses missing coordinates (limit ${limit}).`);
    if (!apply) { console.log("Dry run: no Google calls or writes. Add --apply to geocode and store accepted address matches."); return; }
    for (const row of candidates) {
      try {
        const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
        endpoint.searchParams.set("address", [row.streetAddress, row.suburb].filter(Boolean).join(", "));
        endpoint.searchParams.set("components", "country:NZ");
        endpoint.searchParams.set("key", key!);
        const response = await fetch(endpoint, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) { failed++; continue; }
        const body = await response.json();
        if (["REQUEST_DENIED", "OVER_QUERY_LIMIT", "OVER_DAILY_LIMIT"].includes(body.status)) { console.error("Geocoding stopped: permission or quota failure."); break; }
        const matches = Array.isArray(body.results) ? body.results : [];
        if (body.status !== "OK" || matches.length !== 1) { skipped++; continue; }
        const result = matches[0];
        const point = result.geometry?.location;
        const isNZ = result.address_components?.some((component: {short_name: string; types: string[]}) => component.short_name === "NZ" && component.types.includes("country"));
        if (!isNZ || result.partial_match || !["ROOFTOP", "RANGE_INTERPOLATED"].includes(result.geometry?.location_type) || !Number.isFinite(point?.lat) || !Number.isFinite(point?.lng) || Math.abs(point.lat)>90 || Math.abs(point.lng)>180 || (point.lat===0 && point.lng===0)) { skipped++; continue; }
        const saved = await db.update(businesses).set({latitude:point.lat,longitude:point.lng,updatedAt:new Date()}).where(and(eq(businesses.id,row.id),missing)).returning({id:businesses.id});
        updated += saved.length;
      } catch { failed++; }
    }
    console.log(JSON.stringify({updated,skipped,failed}));
  } finally { await close(); }
}
run().catch(() => { console.error("Business geocoding could not run. Check database/Maps configuration and arguments. No credentials were logged."); process.exitCode=1; });
