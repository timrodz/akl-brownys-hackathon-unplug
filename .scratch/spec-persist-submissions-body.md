## Problem Statement

Auckland residents often do not know where to take household items for reuse, repair, recycling, or responsible disposal. Council and community directories exist but are hard to search, especially when someone only has a photo or a vague description and a rough location.

The EasyRe prototype already lets a resident describe an item (with optional photo identification), provide a New Zealand postcode or device location, and submit the form. Today that submission is validated but **not persisted**, no catalogue **item** is matched, no **business** options are found, and no ordered **pathway** guidance (reduce, reuse, repair, recycle, dispose) is returned. The team has agreed on a relational persistence model on Neon Postgres, but the behaviour is not yet wired end-to-end.

## Solution

When a resident completes the submission flow, the app **persists** the **submission** (including the photo bytes when provided), matches exactly **one catalogue item** to that submission, uses seeded **items**, **businesses**, and **business items** from real Auckland open data to find relevant nearby options, writes ordered **recommendations** (the 4R answer), and shows those recommendations in the UI. Residents see honest, source-attributed guidance for getting rid of their item without landfill where possible.

## User Stories

1. As an Auckland resident, I want to describe what I am trying to get rid of in plain language, so that I do not need to know council category names upfront.
2. As an Auckland resident, I want to take or upload a photo of my item, so that I can start the flow without typing.
3. As an Auckland resident, I want the app to suggest a short description from my photo when identification is available, so that I can confirm or edit before submitting.
4. As an Auckland resident, I want to enter my four-digit New Zealand postcode, so that I can find options near where I live without sharing precise GPS.
5. As an Auckland resident, I want to use my current location instead of a postcode, so that I can get nearby results when I am not at home.
6. As an Auckland resident, I want clear validation when my description, location, or photo is missing or invalid, so that I know what to fix before pressing Go.
7. As an Auckland resident, I want to know that my photo is only used when I submit, so that I feel in control of location and image sharing.
8. As an Auckland resident, I want my submission saved when I press Go, so that the app can compute guidance rather than pretending to search.
9. As an Auckland resident, I want exactly one catalogue item matched to my submission, so that guidance stays focused and understandable.
10. As an Auckland resident, I want to see when no confident catalogue match exists, so that I am not misled by a wrong category.
11. As an Auckland resident, I want to see reduce guidance first where it applies, so that I consider keeping or using less before disposal routes.
12. As an Auckland resident, I want to see reuse options (donation, giveaway, community reuse), so that my item can get a second life locally.
13. As an Auckland resident, I want to see repair options (including repair cafés where relevant), so that I can fix rather than replace.
14. As an Auckland resident, I want to see recycling and responsible disposal options, so that I can comply with hazards and local rules.
15. As an Auckland resident, I want recommendations ordered consistently (pathway and sort order), so that the 4R hierarchy is easy to scan.
16. As an Auckland resident, I want each recommendation to include a short title and explanatory body, so that I understand why it is suggested.
17. As an Auckland resident, I want recommendations linked to a specific business when one applies, so that I know who to contact or visit.
18. As an Auckland resident, I want approximate distance shown when a business has coordinates, so that I can choose the closest practical option.
19. As an Auckland resident, I want hazard alerts from the catalogue surfaced when my matched item has them, so that I handle dangerous materials safely.
20. As an Auckland resident, I want council disposal guidance text for my matched item available to the UI, so that official wording complements local business options.
21. As an Auckland resident, I want opening hours and charge information when the source provides it, so that I am not surprised at the drop-off point.
22. As an Auckland resident, I want to see which data source a business came from, so that I can trust and verify the listing.
23. As an Auckland resident, I want the interface to state when results are incomplete or inferred, so that the demo stays honest per hackathon rules.
24. As a demo judge, I want the README to explain how to run the app with real data and database, so that I can reproduce the prototype.
25. As a demo judge, I want submissions to be retrievable after submit, so that persistence is demonstrable in a live demo.
26. As a council expert, I want catalogue data loaded from Auckland open sources (not pasted CSVs in the repo), so that the prototype uses real civic data.
27. As a developer, I want catalogue rows keyed by source and external id, so that re-seeding does not duplicate businesses or items.
28. As a developer, I want submission status to progress through received, matched, results ready, or failed, so that failures are observable and debuggable.
29. As a developer, I want photo size and MIME type stored with the image bytes, so that storage stays within agreed limits and types.
30. As a developer, I want the submission API to remain the single integration point for the web form, so that the UI does not sprawl with parallel persistence paths.
31. As a developer, I want matching logic separated from HTTP handling, so that item matching can be tested without standing up the whole Next.js UI.
32. As a developer, I want recommendation generation separated from persistence, so that pathway ordering rules can evolve without rewriting storage.
33. As a developer, I want geospatial filtering to use submission latitude/longitude or geocoded postcode, so that distance on recommendations is meaningful.
34. As a resident on a slow connection, I want the submit action to show progress states, so that I know the app is working on match and recommendations.
35. As a privacy-conscious resident, I want demos to avoid showing other people's submissions, so that hackathon ground rules on personal information are respected.
36. As an Auckland resident with only text (no photo), I want to submit successfully, so that photo is optional not mandatory.
37. As an Auckland resident who edits the AI-suggested description, I want my edited text stored, so that the submission reflects my intent.
38. As an Auckland resident, I want recommendations to omit businesses outside a sensible Auckland search radius when location is known, so that results are locally relevant.
39. As an Auckland resident, I want kerbside or council general guidance in recommendations when no business applies, so that I still get a next step.
40. As a developer seeding data, I want Auckland Council "where does it go" items and organisation joins imported, so that business items reflect the incumbent directory.
41. As a developer seeding data, I want supplementary sources (e.g. RecycleMap markers, repair cafés, scheme drop-offs) mergeable into the same business and item model, so that repair and material-specific layers augment council data.
42. As a developer, I want seed jobs idempotent, so that repeated runs during the hackathon do not corrupt the database.
43. As a resident, I want error messages in New Zealand English, so that the product tone matches the audience.
44. As a resident submitting near the edge of Auckland, I want postcodes outside the region handled gracefully, so that I see a clear limitation rather than nonsense distances.
45. As a developer, I want the analyse-photo endpoint to remain independent of persistence, so that identification can fail without blocking a text-only submission.
46. As a resident, I want to retry after a transient failure, so that a single error does not lose my form input unnecessarily (client-side state).
47. As a developer, I want database migrations or push workflow documented, so that teammates can align Neon schema with the agreed model.
48. As a council stakeholder, I want household focus (not packaging kerbside), so that the prototype aligns with the problem statement scope.
49. As a resident with an item that maps to repair, I want repair pathway recommendations prioritized in the ordered list when businesses with repair roles exist, so that repair is visible before generic disposal.
50. As a developer, I want recommendation rows to reference businesses optionally, so that purely educational reduce/reuse tips do not require a fake business record.

## Implementation Decisions

### Domain and persistence (prototype schema)

The following Drizzle/Postgres model is **accepted** (ADR 0001: photo bytes in `submissions.photo_data` on Neon). Glossary terms: **submission**, **item**, **submission item**, **business**, **business item**, **recommendation**, **pathway**.

**Enums (prototype):**

- `submission_status`: `received` | `matched` | `results_ready` | `failed`
- `location_source`: `postcode` | `geolocation`
- `data_source`: `council_directory` | `recyclemap` | `repair_cafe` | `techcollect` | `wasteminz` | `osm` | `manual`
- `match_method`: `keyword` | `ai` | `manual`
- `business_item_role`: `drop_off` | `collection` | `repair` | `reuse`
- `pathway`: `reduce` | `reuse` | `repair` | `recycle` | `dispose`

**Tables:**

- **submissions**: description; optional postcode; optional lat/lng; location source; photo bytea + mime + size; status; optional error message; timestamps.
- **items**: source + external_id (unique); title; keywords; hazard alert; disposal guidance; slug; timestamps.
- **submission_items**: **one row per submission** (unique on submission_id); optional item_id; description snapshot; match confidence; match method.
- **businesses**: source + external_id (unique); name; contact and address fields aligned with council directory org shape; geo; drop-off/collection/charges/hours; source URL; timestamps.
- **business_items**: business + item + optional role + notes; uniqueness on business, item, role.
- **recommendations**: submission + pathway + sort_order + title + body + optional business_id + optional distance_km.

### Submission pipeline

1. Validate multipart input with existing Zod rules (description required; postcode or coordinates required; photo optional with type/size limits).
2. Insert **submission** with status `received`, persisting photo bytes when present.
3. Resolve search point: use geolocation coordinates when provided; otherwise geocode postcode (integration seam for geocoding provider).
4. Match **one item** (keyword and/or AI against catalogue titles/keywords); insert **submission item**; set status `matched` or `failed` if matching fails explicitly.
5. Query **business items** for matched item; rank businesses by distance when coordinates exist; generate ordered **recommendations** incorporating item disposal guidance and business facts; set status `results_ready`.
6. Return API response including submission id, status, matched item summary, and recommendations for the UI.

### Catalogue seeding

- Load **items** and **businesses** and **business items** from civic catalogue clients (`akl_data` / documented dataset ids for `waste-reuse-repair`), prioritising Auckland Council directory item–organisation joins, with optional augmentation from RecycleMap, repair cafés, TechCollect, WasteMINZ, etc.
- Map publisher fields into the unified columns; store provenance via `data_source` and `external_id`.
- RecycleMap material layers map to **items**; markers map to **businesses**; category membership maps to **business items**.

### API contracts

- **POST submission** (existing route): extend success response from scaffold to include `submissionId`, `status`, `item` (nullable), `recommendations` (ordered array with pathway, title, body, business summary, distanceKm). Preserve existing error shapes for validation failures. When database is not configured, return a clear 503 consistent with other routes.
- **POST analyse photo** (existing): unchanged contract; no requirement to persist until full submit.
- **GET submission by id** (new, if needed for demo): returns the same recommendation payload without re-running match (read persisted rows). Optional if POST returns full payload synchronously.

### UI

- Replace placeholder success copy with rendered **recommendations** list grouped or ordered by pathway.
- Show loading states while submission is processing.
- Surface hazard alert and disposal guidance from matched **item** when present.
- Label synthetic or low-confidence matches in the UI per README honesty requirements.

### Modules (behavioural, not paths)

- Form validation module (existing Zod schema and photo checks).
- Submission orchestration module: validate → persist → match → recommend → respond.
- Item matching module: catalogue search / AI classification into one item id.
- Recommendation module: pathway ordering rules + business selection + copy generation (may use templated strings from catalogue fields before optional LLM polish).
- Catalogue seed module: fetch/transform/load from open data.
- Database access via Drizzle against Neon.

### Architectural decisions

- Single unified **business** and **item** tables across publishers (not per-source tables).
- Exactly **one submission item** per submission (product decision from grilling).
- **Recommendations** persisted at write time, not recomputed on every read.
- Photos stored in Postgres bytea (ADR 0001), 5 MB cap enforced at API layer.

## Testing Decisions

### Proposed test seam (confirm with team)

**One primary seam: HTTP `POST` to the submissions API** with `multipart/form-data` (description, postcode or coordinates, optional photo), asserting on the **JSON response** and optionally verifying database state through a test database URL.

Rationale: this is the highest existing seam the resident-facing flow already uses; the UI should not gain a second persistence path. Photo analyse stays out of scope for this seam unless a separate contract test is added later.

Inject dependencies at the orchestration boundary (database, geocoder, matcher, recommendation builder) so tests can use fixtures without calling Gemini or live civic APIs in CI.

### What makes a good test

- Assert **external behaviour**: status codes, error messages, response JSON shape, recommendation ordering, and persistence side effects (submission status transitions, exactly one submission item, recommendation count > 0 when fixtures match).
- Do **not** assert internal function names, Drizzle query structure, or private module layout.
- Use deterministic catalogue fixtures in the test database for match and distance behaviour.

### Modules under test

- Submissions API route (integration).
- Orchestration and recommendation behaviour via the API seam (preferred) or orchestration module with injected stores if the route is too heavy for fast tests.

### Prior art

- No automated tests exist in the repository yet; this spec establishes the first integration tests around the submissions API.

## Out of Scope

- Multiple catalogue items per submission.
- Object storage (S3/R2) for photos.
- User accounts, login, or submission history UI for residents.
- Admin UI to edit businesses or items.
- Barcode scanning and Open Food Facts as the primary identification path.
- Nationwide non-Auckland-first experience (may show data but UX targets Auckland household focus).
- Continuous automated scraping / live verification of every directory page during the hackathon.
- Packaging-heavy kerbside recycling education as the main content.
- Polling real-time Overpass or fragile endpoints without caching in the seed job.
- Storing Gemini prompts or full model transcripts in the database.
- Legal/compliance review of third-party data licensing beyond attribution in README.

## Further Notes

- Run `pnpm db:push` (or migrate) when `DATABASE_URL` points at Neon; schema already defined in prototype.
- `GEMINI_API_KEY` remains optional for photo analyse; matching may use keywords first to stay demo-stable without AI.
- Hackathon ground rules: no personal information in repo; demos should use synthetic submissions; label inferred matches.
- Issue tracker agent docs were not present under `docs/agents/`; this issue uses GitHub Issues directly. Run `/setup-matt-pocock-skills` to codify tracker docs and triage labels for future skills.
- After this spec is accepted, `/to-tickets` should split seeding, orchestration, API, and UI into tracer bullets with blocking edges.
