export type LocalityRow = {
  postcode: string | number;
  locality?: string;
  region?: string;
  lat: string | number;
  long: string | number;
};
export type PostcodeCentroid = {
  postcode: string;
  latitude: number;
  longitude: number;
  localityCount: number;
  localities: string[];
  regions: string[];
};

/** Derive approximate area centres from valid source localities, never invented points. */
export function buildPostcodeCentroids(rows: LocalityRow[]) {
  const groups = new Map<
    string,
    { lat: number; lng: number; count: number; localities: Set<string>; regions: Set<string> }
  >();
  let rejected = 0;
  for (const row of rows) {
    const raw = String(row.postcode ?? "").trim();
    const latitude = String(row.lat ?? "").trim() ? Number(row.lat) : NaN;
    const longitude = String(row.long ?? "").trim() ? Number(row.long) : NaN;
    if (
      !/^\d{1,4}$/.test(raw) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude === 0 ||
      longitude === 0 ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      rejected++;
      continue;
    }
    const postcode = raw.padStart(4, "0");
    const group = groups.get(postcode) ?? {
      lat: 0,
      lng: 0,
      count: 0,
      localities: new Set<string>(),
      regions: new Set<string>(),
    };
    group.lat += latitude;
    group.lng += longitude;
    group.count++;
    if (row.locality?.trim()) group.localities.add(row.locality.trim());
    if (row.region?.trim()) group.regions.add(row.region.trim());
    groups.set(postcode, group);
  }
  const centroids: PostcodeCentroid[] = [...groups]
    .map(([postcode, group]) => ({
      postcode,
      latitude: group.lat / group.count,
      longitude: group.lng / group.count,
      localityCount: group.count,
      localities: [...group.localities].sort(),
      regions: [...group.regions].sort(),
    }))
    .sort((a, b) => a.postcode.localeCompare(b.postcode));
  return {
    centroids,
    sourceRows: rows.length,
    validRows: rows.length - rejected,
    rejectedRows: rejected,
  };
}
