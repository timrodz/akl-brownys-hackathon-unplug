import dataset from "@/data/postcodes/nz-postcode-centroids.json";

/** Nearby postcode-centre estimate, never an address/boundary lookup. */
export function nearestPostcode(latitude: number, longitude: number): string | null {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  )
    return null;
  const radians = (value: number) => (value * Math.PI) / 180;
  let nearest: string | null = null;
  let bestKm = 5;
  for (const row of dataset.centroids) {
    const a =
      Math.sin(radians(row.latitude - latitude) / 2) ** 2 +
      Math.cos(radians(latitude)) *
        Math.cos(radians(row.latitude)) *
        Math.sin(radians(row.longitude - longitude) / 2) ** 2;
    const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
    if (km < bestKm) {
      bestKm = km;
      nearest = row.postcode;
    }
  }
  return nearest;
}
