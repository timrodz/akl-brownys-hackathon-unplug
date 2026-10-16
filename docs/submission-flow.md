# Live submission flow

The form saves to the existing `submissions` table. Valid text-only input does
not need Gemini. It inserts the submission before reading the catalogue, matches
the current description against database `items`, follows `business_items` to
eligible businesses, calculates straight-line distances when a location is
available, and persists the match and recommendations.

The saved outcome returns HTTP 200 even when unmatched or catalogue processing
fails, so the browser can open `/results` with a saved reference and explanation.
Invalid form input returns 400; database configuration/write failures remain
errors and must not claim the submission was saved.

There is no automatic catalogue seeding in the request flow. Historical seed
records identified by `demo-` external IDs and businesses with `status = demo`
are excluded. A laptop search returns businesses only if the real database has
an appropriate item and business links. No fallback business is invented.
Existing seed utilities remain for historical development use; do not run them
against the live database. The results page no longer contains placeholder rows.

Postcodes are resolved with Google Maps Geocoding using server-only
`GOOGLE_MAPS_API_KEY`. There is no hard-coded postcode coordinate map. If Maps
is unavailable or the postcode cannot be resolved, the submission is still saved
and results explicitly omit distances. Device coordinates can provide distances
without postcode lookup. Postcode distances use an area centre, not a street address.

Photos use Gemini with `GEMINI_API_KEY` and optional `GEMINI_MODEL`. A successful
identification is returned even if catalogue checking subsequently fails, so the
editable description can still populate. Real provider failures return a safe
reference; inspect `[analyse]` in function logs. These changes do not establish
that a particular Google model is accessible to the deployed account.

Checks:

- `node scripts/check-submission-flow.cjs` exercises the actual route, processor,
  matcher and ranking against an in-memory database adapter with test-only fixtures.
- `node scripts/check-photo-file-part.cjs` checks the photo payload and successful
  identification surviving an unavailable catalogue module.
- `node scripts/check-photo-diagnostics.cjs` checks safe provider failure logging.
- `bun run typecheck` and `bun run build` check the full app.

Live Postgres and Gemini verification requires deployment configuration; local
fixture checks do not demonstrate that production contains real item/business data.

Earlier README sections describe the prototype's demo-seeding behaviour. This
document describes the current live request path and supersedes those sections.
