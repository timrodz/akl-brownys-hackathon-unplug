// Test-only business fixtures: never imported into the application database.
const assert = require("assert/strict");
(async () => {
  const { buildRecommendations } = await import("../../lib/submissions/build-recommendations.ts");
  const business = (id, latitude, longitude) => ({
    id,
    name: id,
    latitude,
    longitude,
    description: null,
    dropOffNotes: null,
    openingHours: null,
    chargesForDropOff: null,
    sourceUrl: null,
  });
  const rows = [
    { business: business("far-reuse-fixture", -36.9, 174.8), role: "reuse" },
    { business: business("near-recycle-fixture", -36.85, 174.76), role: "drop_off" },
    { business: business("unknown-fixture", 0, 0), role: "repair" },
  ];
  const result = buildRecommendations(
    { title: "Test item", disposalGuidance: null },
    rows,
    -36.85,
    174.76,
  ).filter((row) => row.businessId);
  assert.deepEqual(
    result.map((row) => row.businessId),
    ["near-recycle-fixture", "far-reuse-fixture", "unknown-fixture"],
  );
  assert.equal(result[2].distanceKm, null);
  assert.equal(result[0].distanceKm, 0);
  console.log(
    "PASS: actual Haversine ranks nearer recycling before farther reuse; zero/zero business coordinates are unknown and ranked last.",
  );
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
