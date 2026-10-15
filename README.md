# Auckland CivicTech Hackathon · Waste B: Reuse, repair and recycling finder

**Browny's Hackathon, hosted by Mayor Wayne Brown · Auckland Council · facilitated by Creative HQ · closing Auckland Startup Week**
Friday 16 October 2026 · The Annex, 10 Madden Street, Wynyard Quarter, and Media Design School

> Private event repository. Replace this README with your own as you build;
> keep the submission checklist at the end until you have ticked it off.

---

## Team 5 · Waste B · Reuse, repair and recycling finder

*Waste · Creative HQ team 5 · Council expert on the day: TBC (Council to confirm)*

### Problem statement (as provided by Auckland Council)

> Word for word from Creative HQ's "All problem statements 13.10" document (13 October 2026). Typos are Council's own. Email addresses and phone numbers are replaced with "(contact via Creative HQ)"; where the document gave only an address, the name in front of it is read from the address. An embedded presentation is replaced with a link to it, minus its contact slide.

<!-- verbatim:start -->
#### Waste Problem Statement 2

**Contact**

- Nadine Wakim: (contact via Creative HQ)

**Description**

Directory for reuse, repair, recycling, and responsible disposal options

People in Auckland often do not know where to take items at the end of their life for repair, reuse, recycling, or responsible disposal. Existing information sources, including council’s ‘where does it go?’ directory, can be incomplete, inaccessible, or quickly become outdated. How might we provide Aucklanders with accurate, accessible, and up-to-date guidance the helps materials keep circulating and minimising landfill.  Emerging tools such as this example from an industry organisation, Techcollect, or proprietary tools,such as Recyclemate, indicate the potential for scanning barcodes or using photos of items to source information required.

**Example solution directions**

- AI-powered waste and recycling assistants that help residents identify reuse/repair/recycling options through image upload or text queries
- Automated systems that continuously scan, verify and update reuse, repair and recycling service information for digital education/info platforms.

**Additional info**

Scope: What specific area/corridor should they focus on? What 2-3 things should they not build given the 7-hour time limit?

- Give focus to household products; rather than household packaging items as most packaging is typically covered by council’s kerbside collection system. Suggestion to focus on electronic/electrical equipment (laptops, phones, loose batteries rechargeable or single-use, small/medium sized appliances with removable or embedded batteries); home diy construction/building materials; or clothing/textiles and furniture.

The User: Who is this for (resident, contractor, Council team)? What apps, systems, or outputs do they currently use or need?

Resident

Current State & Impact: How is this handled now (including manual workarounds)? What is the quantifiable cost (hours, dollars, volume)?

- Manual directory on council website. https://www.aucklandcouncil.govt.nz/en/rubbish-recycling/get-rid-unwanted-items.html
- Minimal cost to set up / happened several years ago, with periodic updates undertaken – not quantified.

Past Attempts: What has Council, AT, or other cities tried before, and why did it stop?

- In addition to the website directory, council has given support to other external initiatives over the years eg. wastehub, for recycling services for construction materials; https://www.wastehub.co.nz/nz-recycling-services-finder ;
- map-based directories like this one for batteries https://www.wasteminz.org.nz/our-work/battery-recycling-and-collection-facilities;
- packaging forum initiatives for specific types of packaging (https://home.recycling.kiwi.nz/) and

also note council also set up this information portal website (largely limited to info about council services though) https://wastenothing.co.nz/.

Ministry also has a directory - https://environment.govt.nz/what-you-can-do/campaigns/recycle/recycle-item/ and there is a voluntary offering also https://www.recyclemap.co.nz/ and organisations that support repair https://www.repairnetworkaotearoa.org.nz/local-repair-cafes , There are also lots of online trading platforms used as pathways to onsell/give away household items– marketplace, Freecycle, trademe etc. Other examples of tools to assist people finding drop-off locations are mentioned in the problem statement too (Recyclemate, Techcollect, and there many overseas examples of directories/mapping tools – e.g. https://www.recyclenow.com/recycle-an-item; https://recyclingnearyou.com.au/

Available Data: List specific datasets, APIs, and open data sources that teams can access.

- No specific data sets to offer.

<!-- verbatim:end -->

From the statements document's short list:

<!-- verbatim:start -->
| Statement | Contact | SME for day |
|---|---|---|
| Waste #2<br>Creating better tools to help Aucklanders identify reuse, repair, recycling and responsible disposal options. | Nadine Wakim | Exact person TBC but confirmed will provide someone |

<!-- verbatim:end -->

### Organiser summary

Added by the organisers, not part of Council's statement.

**Data to start with**

- [Auckland Council: get rid of unwanted items](https://www.aucklandcouncil.govt.nz/en/rubbish-recycling/get-rid-unwanted-items.html)
- [Ministry for the Environment: recycle an item](https://environment.govt.nz/what-you-can-do/campaigns/recycle/recycle-item/)
- [WasteMINZ: battery recycling and collection facilities](https://www.wasteminz.org.nz/our-work/battery-recycling-and-collection-facilities)
- [Repair Network Aotearoa: local repair cafes](https://www.repairnetworkaotearoa.org.nz/local-repair-cafes)
- [RecycleMap](https://www.recyclemap.co.nz/)
- [WasteHub: NZ recycling services finder](https://www.wastehub.co.nz/nz-recycling-services-finder)
- [Packaging Forum recycling information](https://home.recycling.kiwi.nz/)
- [Waste Nothing](https://wastenothing.co.nz/)
- [Recycle Now: recycle an item (UK example)](https://www.recyclenow.com/recycle-an-item)
- [Recycling Near You (Australian example)](https://recyclingnearyou.com.au/)
- In [akl-civic-data](https://github.com/Auckland-Hackathons/akl-civic-data): `ac-where-does-it-go-directory`, `recyclemap-markers`, `wasteminz-battery-kml`, `repair-network-cafes`, `techcollect-dropoffs`, `osm-overpass-waste-pois`, `ac-waste-service-areas`. Everything catalogued for this problem: `akl_data.ids(problem="waste-reuse-repair")`.

---

## What we're building

One working prototype, built on the day. Code is due at **5:00pm**; the
judges then visit each table for five minutes with a live demo. This
repository is the submission.

It is a proof of concept, not a finished product. Start from the whole problem,
then home in on the area with the most useful data and the highest impact, and
use it to prove the case. A narrow thing that works, with real Auckland data,
beats a broad thing that does not demo.

## Help on the day

- **Your Council expert**: the problem, what Council needs, and the data behind it.
- **Creative HQ facilitators**: working as a team, unpacking the problem, design,
  and preparing your pitch.
- **The technical team**: access to this repository, the data clients, getting
  unstuck, and questions about AI coding tools.

Use any AI coding tool you like, on your own accounts; the organisers do not
provide accounts or credits for the day. Organisers look at repository activity during the
day to see which teams might need a hand, so push early and often.

## What good looks like

- It runs, and someone who did not build it can follow the README to run it.
- It uses real Auckland data where possible, fetched in code, not pasted in.
- Outputs that other tools can use (GeoJSON, CSV, an API) are worth more than
  a closed demo. For spatial problems, keep results geospatial.
- It is honest: what is synthetic, inferred or missing is stated in the README
  and visible in the interface.

## Data

The public data for every problem statement is catalogued, checked and
made queryable in **[akl-civic-data](https://github.com/Auckland-Hackathons/akl-civic-data)**: 133 sources from
Auckland Council, Auckland Transport, NZTA, LINZ, Stats NZ, OpenStreetMap and
others. 121 are tagged with the problem statements they help; the rest are
general reference. Most are open; a few need a free key.

Copy `akl_data.py` (Python, standard library only) or `akl-data.js` (one ES
module) with `catalogue.json` into this repo, side by side.

```python
import akl_data

akl_data.ids(problem="water-overland-flow")                  # what is there for a problem (slug in the repo name)
akl_data.count("ac-overland-flow-paths", bbox=akl_data.MT_ALBERT)
akl_data.geojson("ac-overland-flow-paths", bbox=akl_data.MT_ALBERT)   # WGS84, straight into a map
akl_data.features("at-roadworks", limit=5)                   # rows with lat/lng
```

Things worth knowing before they cost you an hour:

- Most layers are published in **NZTM2000, not lat/lng**. Ask for `outSR=4326`
  (the clients do).
- A single request is **capped at 1,000 or 2,000 rows**. Use `all_features()`
  or check `exceededTransferLimit`.
- Some layers hold **millions of features**. Always pass a bbox; the clients
  have sample areas (`MT_ALBERT`, `DOMINION_RD`, `WESTERN_LINE`, `NEW_LYNN`).
- Keys go in environment variables, never in code. The organisers do not hand
  out shared keys; register for your own free key where a source needs one:
  `AT_API_KEY` ([Auckland Transport developer portal](https://dev-portal.at.govt.nz),
  realtime feeds), `LINZ_API_KEY` ([LINZ Data Service](https://data.linz.govt.nz),
  WFS and downloads), `TOMTOM_KEY` ([TomTom developer portal](https://developer.tomtom.com)).
  Export them in your shell or put them in a `.env` file, which git ignores.

## Sources for this problem

The 25 best-graded sources for this problem from the wider
search, best first. Grades run A to E (fit, usability, access, authority,
freshness, granularity); spot-check before relying on them.

| Grade | Source | Access | What it gives you |
|---|---|---|---|
| A | [South and East Auckland Waste, Recycling and Rehoming Directory](https://viewer.mapme.com/af29690b-4cd0-484f-a211-8f3e12fa51b4) | Open | Adds a community-run, searchable reuse and recycling directory for South and East Auckland that can complement item-specific advice. |
| A | [Council waste service areas (inorganic contract areas, recycling collection weeks, refuse/food-scraps areas, litter areas)](https://services1.arcgis.com/n4yPwebTjJCmXB6W/arcgis/rest/services/CSRFS_ServiceArea_Query/FeatureServer/0) | Open | Which kerbside and inorganic collection service applies at an address. |
| A | [Council 'How to get rid of unwanted items' directory (items + organisations)](https://www.aucklandcouncil.govt.nz/en/rubbish-recycling/get-rid-unwanted-items.html) | Open | The incumbent directory and its item-to-facility join. It is richer than it first looks: most orgs have street address, coordinates, hours and charges. |
| A | [Auckland household battery recycling pilot at Woolworths stores](https://ourauckland.aucklandcouncil.govt.nz/news/2026/09/got-old-batteries-at-home/) | Open | Adds a new Auckland public return option for ordinary household batteries that can be clearly distinguished from solar/home-storage battery returns. |
| B | [Enviro NZ Constellation Drive Resource Recovery Centre – operator hours, fees and accepted materials](https://environz.co.nz/facilities/constellation-drive-resource-recovery-centre?filter=resource-recovery-centre) | Open | Provides primary-operator price and acceptance data for a public Auckland disposal option, useful for checking or refreshing directory entries. |
| B | [Auckland Resource Recovery Network — Find your local CRC](https://www.makingzerowastework.org.nz/find-your-local-crc) | Open | Purpose-built current locator for the Auckland CRC network, with addresses that can anchor local reuse and recycling recommendations. |
| B | [Auckland Library of Tools (ALoT) public inventory](https://aucklandlibraryoftools.myturn.com/library/inventory/browse) | Open | Primary Auckland catalogue for matching item requests to category, availability, pickup location and borrowing cost. |
| B | [HomeImprovement2day Auckland Region upholsterers directory](https://www.homeimprovement2day.co.nz/directory/category/furniture/furniture-upholstery/upholsterers/location/auckland-region/) | Open | Direct Auckland furniture-upholstery category with repair, restoration and recovery descriptions that help distinguish service types. |
| B | [Nurturing Families — Auckland baby-item donation and car-seat eligibility list](https://www.nurturingfamilies.nz/donate) | Open | Auckland family-support reuse intake with a location and unusually specific car-seat safety criteria. |
| B | [RecycleMap NZ - all markers by material map (WP Google Maps REST)](https://www.recyclemap.co.nz/wp-json/wpgmza/v1/markers) | Open | The best ready-made material-to-location dataset found: one call, coordinates included, already split by material. |
| B | [Phoenix Recycling battery drop-off locations](https://www.phoenixrecycling.co.nz/battery-recycling-locations) | Open | Adds a distinct NZ battery collection network with downstream verification and battery acceptance/fee details beyond the existing household battery map. |
| B | [Finda Auckland City Clothing Alterations & Repairs directory](https://www.finda.co.nz/clothing-alterations-repairs/auckland-city/) | Open | Its repair descriptions connect garment types and specific alteration or mending capabilities to Auckland businesses. |
| B | [Little More — Auckland baby-item donation locations and acceptance list](https://littlemore.co.nz/donate-items/things-we-can-accept/) | Open | Potential Auckland reuse route with two public drop-off points; check its current page manually because automated access was blocked. |
| B | [Safe 'n Snug — Pay It Forward child-seat rehoming](https://www.safensnug.co.nz/payitforward) | Open | Local reuse programme publishes concrete safety screening rules and a way to arrange handover. |
| B | [Auckland Council: what you can put in roadside recycling](https://www.aucklandcouncil.govt.nz/en/rubbish-recycling/bin-requests/Pages/what-put-your-recycling.aspx) | Open | Adds Auckland-specific accepted-bin guidance alongside the national standards reference. |
| B | [WasteHub NZ recycling services finder](https://www.wastehub.co.nz/nz-recycling-services-finder) | Open | NZ-wide finder for recycling services, including construction materials: a second directory to compare with and fill gaps in Council's own list. |
| C | [WasteMINZ household battery drop-off locations (Google My Maps KML)](https://www.google.com/maps/d/kml?mid=1ncyWOEWbXMSiycgz48swYqMj4aHJnSE&forcekml=1) | Open | Authoritative battery drop-offs, with chemistries. |
| C | [TechCollect NZ e-waste drop-off locations](https://www.techcollect.nz/recycle) | Open | The e-waste scheme the brief cites. A small list, so hand-copy it. |
| C | [Tāmaki Zero Waste Hub — operator services and reuse distribution](https://localised.nz/our-enterprises/tamaki-zero-waste-hub) | Open | Provides current service-level detail and a useful e-waste exception that can prevent a directory from promising unavailable reuse options. |
| C | [Whangaparāoa Community Recycling Centre — operator service details](https://localised.nz/our-enterprises/whangaparaoa-crc) | Open | Adds material-category and opening-hour data from the operator for matching residents to an appropriate local hub. |
| C | [SeatSmart — Auckland child car-seat recycling locations and acceptance rules](https://seatsmart.co.nz/resources/sites-and-events/auckland/) | Open | Main Auckland end-of-life route, with locations, fees, accepted seat types and rejection conditions. |
| C | [AS Colour and ImpacTex textile take-back collection points](https://www.ascolour.co.nz/textile-recycling/) | Open | Offers multiple Auckland drop-off options for worn or unwanted textiles and clear material acceptance rules. |
| C | [Repair Network Aotearoa - Repair Café directory (Wix dynamic pages)](https://www.repairnetworkaotearoa.org.nz/dynamic-localrepaircafes_p_8500816c_6fb3_4424_8161_90ad1ae5b8b2_0_5000-sitemap.xml) | Open | The repair leg the council directory barely covers. |
| C | [Open Food Facts / Open Products Facts barcode APIs](https://world.openfoodfacts.org/api/v3/product/{barcode}) | Open | Barcode lookups for packaged goods only. Don't build the demo on it: use photo-to-category classification instead. |
| C | [Onehunga Community Recycling Centre — services and drop-off estimator](https://www.onehungacrc.nz/) | Open | Offers a live, operator-run service and pricing reference for household items, with an explicit warning that accepted donations may change when materials pile up. |

The full list is in the
[source sheet](https://github.com/Auckland-Hackathons/akl-civic-data/blob/main/sheet/akl-civic-data-catalogue.xlsx): 3,250 sources, with a
`waste-reuse-repair` column ticked where a source helps this problem and a
"Top picks · Waste B" tab. The same picks are in
[`sheet/top-picks/waste-reuse-repair.csv`](https://github.com/Auckland-Hackathons/akl-civic-data/blob/main/sheet/top-picks/waste-reuse-repair.csv), and the
catalogued sources with a client are listed in
[`docs/by-problem.md`](https://github.com/Auckland-Hackathons/akl-civic-data/blob/main/docs/by-problem.md).

## Schedule

From Creative HQ's run sheet. Two teams work at The Annex and four next door
at Media Design School, two teams to a room; Creative HQ confirms rooms on the
morning. Lunch, the share-back and the showcase are at The Annex.

| Time | What |
|---|---|
| 8:30am | Arrive and register at The Annex: name tags, join the WhatsApp group |
| 9:00am | Welcome: the Mayor's video, shape of the day, code of conduct, how judging works, technical briefing |
| 9:30am | Build. Meet your Council expert and agree your one-line focus in the first hour |
| 11:00am | Morning tea |
| 11:15am | Build |
| 12:30pm | Lunch at The Annex |
| 1:00pm | **Share-back**: two minutes per team on what you have learned and the approach you are taking. Not a pitch |
| 1:30pm | Build. Show your Council expert your build about once an hour |
| 3:00pm | Afternoon tea |
| 3:15pm | Build. "One hour to go" goes out on WhatsApp at 4:00pm |
| 4:15pm | Final build and code upload |
| **5:00pm** | **Code due.** What is on `main` at 5:00pm is what gets judged |
| 5:00pm–5:45pm | **Judges' table visits**, five minutes per team: the problem, your solution, a live demo, then questions. Work on your showcase slides, not code |
| 5:45pm | Judges decide. **Showcase slides due** (Google Slides, sent to Claudia at Creative HQ on WhatsApp) |
| 6:00pm | Showcase with the Mayor at The Annex: a **three-minute pitch** per team. No product demos on stage; not judged |
| About 6:30pm–6:45pm | Winner announced |
| By 7:00pm | Close |

The run sheet and the experts' pack differ slightly on the last two times;
Creative HQ will call it on the night.

## Judging

The judges are Mayor Wayne Brown, Pam Ford and Mat Rowe. Two things count:
the code your team has pushed to this repository by **5:00pm**, and the
judges' five-minute visit to your table with a **live demo**. The evening
pitches are not judged.

Each judge scores four criteria from 1 to 10, for a total out of 40. From
Creative HQ's briefing for the judges:

| Criterion | What to look for |
|---|---|
| Better, faster, cheaper | Would this save Council time or money, or make a service noticeably better for Aucklanders? |
| Solves the real problem | Does it deal with the problem as the Council team described it? |
| Works on real data | A live demo running on real Council or open data |
| Council could use it | Realistic to adopt (cost, existing systems, privacy, who would own it), and the team is clear about what's still missing |

A tie goes to the team with the higher "better, faster, cheaper" score. The
scores guide the panel, which has the final say.

After 5:00pm the panel also gets a short AI-generated technical summary of
each team's repository. It informs the judges; it is not a separate score.

## Submission checklist

Before 5:00pm, when code is due, make sure `main` has:

- [ ] A README that says what the prototype does, who it is for, and how to run it
- [ ] The data sources it uses, with their publishers
- [ ] Anything synthetic, sample, hard-coded or AI-inferred labelled as such
- [ ] A short **Limitations** section
- [ ] No keys, tokens or personal information anywhere in the repo or its history
- [ ] Everything merged to `main`: that is what gets judged
- [ ] Showcase slides (Google Slides) ready to send to Creative HQ by 5:45pm

## Ground rules

- **This repository is private event material.** Do not share it, or screenshots
  of it, outside the event until the organisers say so.
- **The data is not ours.** Each dataset belongs to its publisher and licences
  vary. Check before publishing anything derived from it, and credit the
  publisher.
- **Data supplied for the day stays where you are told it can go.** Imagery
  extracts or samples provided by the organisers may come with conditions.
  Keep them in `private-data/` (ignored by git) unless you are told otherwise.
- **No personal information.** No participant names or contact details, and
  nothing from a sample that identifies a person (names, addresses, faces,
  number plates), in the repo or in a demo.
- **No secrets in git.** Keys live in `.env`, which is ignored. If one is ever
  committed, tell an organiser so it can be revoked.
- **Be gentle with public servers.** Cache what you fetch; do not poll in a
  tight loop.
- **Say what is real.** Label synthetic or inferred results in the interface,
  and never present an unverified report as confirmed fact.

## IP and licence

Creative HQ's briefing pack for Council experts says:

<!-- verbatim:start -->
> Under the IP terms participants agreed to, what is built on the day belongs to Auckland Council and Auckland Startup Week, with a licence back to the participants.
<!-- verbatim:end -->

This is not an open-source project and there is no open-source licence.
Creative HQ is confirming with Auckland Council what these terms mean in
practice, including whether team repositories are made public after the event.
Until then the formal licence text is TBC — ask Creative HQ.
Do not add a LICENSE file. See [NOTICE](NOTICE).

## EasyRe landing page (phase 1)

Run `pnpm install --frozen-lockfile`, then `pnpm dev` and open http://localhost:3000.
Check with `pnpm typecheck` and `pnpm build`.

The responsive landing page accepts a camera/photo upload, editable item description,
and either a four-digit NZ postcode or device coordinates. Geolocation needs HTTPS
(or localhost) and browser permission. Entering a postcode clears device coordinates.
Images are limited to JPG/PNG/WebP, 5 MB. The selected image stays in browser memory
and is uploaded to the server for identification and again with form submission.
`POST /api/analyse` uses Gemini to identify the photo; the user can correct its text.
Set `Gemini_API_Key` in `.env.local` (existing `GEMINI_API_KEY` and
`GOOGLE_GENERATIVE_AI_API_KEY` also work). Never expose keys with NEXT_PUBLIC_.
No key is needed for text-only form submission; missing identification configuration
has a visible manual-description fallback. AI identification can be inaccurate.

`POST /api/submissions` validates multipart form data and returns HTTP 202 with
`{ status: "scaffold", searchPerformed: false, persisted: false }`.
It does not store photos, descriptions or locations, query a database, call Maps,
or create results. `GOOGLE_MAPS_API_KEY` is reserved for the next phase. Before
launch, apply platform body-size limits and rate limiting to the photo route.

Repository analysis: Next.js App Router, React, Tailwind, Gemini via Vercel AI SDK,
and Neon/Drizzle. The current database schema contains only `app_meta`; no searchable
reuse/repair directory or seed data is in this checkout. AGENTS.md links the separate
Auckland civic data catalogue as the data starting point. Results integration is
intentionally deferred. The requested beta.automtax.co.nz reference did not resolve
during development, so the cream/green visual direction is provisional rather than
an asserted match to that style guide. No deployment was created in this phase.

### Unplug update
The app is now named Unplug and uses a centred single-column form. If Gemini is
not configured, photo identification returns an explicit `status: "manual"`
response and the UI keeps the attached photo with a prompt for a description.
This replaces the earlier missing-key HTTP 503; it does not simulate AI analysis.
Configure a non-empty Gemini key in the deployment environment and redeploy to
activate identification. Empty aliases no longer shadow another configured key.
Run `node scripts/check-photo-fallback.cjs` after dependency installation to check
the actual route's missing-key response with the Gemini provider stubbed out.
