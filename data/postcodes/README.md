# New Zealand postcode data

Source: [Matthew Proctor, New Zealand Postcodes](https://www.matthewproctor.com/newzealand_postcodes).
The publisher describes the community-maintained dataset as public domain and
disclaims accuracy. The source page advertises an update date of 23 January 2025.
This is a locality-based approximation, not authoritative NZ Post boundary data.

- `newzealand-postcodes.source.json`: original downloaded JSON, 2,699 locality rows.
- `nz-postcode-centroids.json`: provenance plus 1,722 grouped postcode centroids.
  Each centroid includes `postcode` (four-character text), `latitude`, `longitude`,
  `localityCount`, `localities`, and `regions`.

The source bytes are identified by SHA-256 in the grouped JSON. Coordinates are
arithmetic means of valid locality coordinates for each postcode. Empty, non-finite,
out-of-range and zero coordinates are rejected. This particular source download
has 2,699 valid rows and zero rejected rows. Numeric source postcodes are padded
to four digits before grouping; supplied leading zeroes are preserved.

Generate/validate the local JSON without database access:

```sh
bun run db:import-postcodes
```

Refresh from the publisher's GitHub repository:

```sh
bun run db:import-postcodes --download
```

Import into the existing application Postgres database:

```sh
bun run db:import-postcodes --apply
```

Set `DATABASE_URL_UNPOOLED` or `DATABASE_URL` in the environment or ignored
`.env.local` first. The command creates only `postcode_centroids` if absent and
upserts rows in a transaction; it does not recreate or seed business/submission
tables. A Drizzle migration is also included for normal schema management.

Runtime postcode lookup tries this table first, then the checked-in source-derived
JSON if the table/connection is unavailable or lacks a postcode. No Maps key or
external request is needed. Unknown postcodes remain unknown. Results use Haversine
straight-line distances labelled "Approx."; no driving-distance multiplier is used.
Businesses are ranked by available distance, with missing coordinates last.

For real business records missing coordinates, an optional one-time utility uses
Google Geocoding, scoped to `recyclemap` by default:

```sh
bun run db:geocode-businesses --source=recyclemap --limit=50
bun run db:geocode-businesses --source=recyclemap --limit=50 --apply
```

The first command only previews the eligible count. `--apply` requires
`GOOGLE_MAPS_API_KEY`, makes billable provider requests, and stores only a single,
non-partial NZ street-address match. Existing valid coordinates and demo records
are skipped. Verify the source scope and operator account's storage terms before
running this optional utility; locality/postcode centroids are not substituted for
individual business addresses.

Database import and business geocoding have not been executed here because this
workspace has no database/Maps credentials. JSON preparation and lookup tests
have been executed against the genuine downloaded source.
