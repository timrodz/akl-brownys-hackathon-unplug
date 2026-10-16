import postcodeData from "@/data/postcodes/nz-postcode-centroids.json";
/** Source-derived postcode lookup. No per-request Google Maps calls. */
export type SearchPoint = { latitude: number; longitude: number; inAucklandRegion: boolean | null };
export async function geocodePostcode(postcode: string): Promise<SearchPoint | null> {
  if (!/^\d{4}$/.test(postcode)) return null;
  try {
    const [{ db }, { postcodeCentroids }, { eq }] = await Promise.all([
      import("@/lib/db"),
      import("@/lib/db/schema"),
      import("drizzle-orm"),
    ]);
    if (db) {
      const [row] = await db
        .select()
        .from(postcodeCentroids)
        .where(eq(postcodeCentroids.postcode, postcode))
        .limit(1);
      if (
        row &&
        Number.isFinite(row.latitude) &&
        Number.isFinite(row.longitude) &&
        row.latitude !== 0 &&
        row.longitude !== 0 &&
        Math.abs(row.latitude) <= 90 &&
        Math.abs(row.longitude) <= 180
      )
        return {
          latitude: row.latitude,
          longitude: row.longitude,
          inAucklandRegion: row.regions.includes("Auckland"),
        };
    }
  } catch {
    /* Genuine downloaded data supports rollout before the postcode table is imported. */
  }
  const row = postcodeData.centroids.find((row) => row.postcode === postcode);
  return row
    ? {
        latitude: row.latitude,
        longitude: row.longitude,
        inAucklandRegion: row.regions.includes("Auckland"),
      }
    : null;
}
export function pointFromCoordinates(latitude: number, longitude: number): SearchPoint {
  // Region membership is unknown for device coordinates without reverse geocoding.
  return { latitude, longitude, inAucklandRegion: null };
}
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}
