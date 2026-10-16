# Auckland CivicTech Hackathon · Waste B: Reuse, repair and recycling finder

Context for coding assistants working in this repository.

## The event

A one-day build with Auckland Council (Browny's Hackathon, hosted by Mayor
Wayne Brown), facilitated by Creative HQ for Auckland Council to close
Auckland Startup Week, on Friday 16 October 2026. Six teams of about six people, one problem statement each,
across transport, flood resilience and waste. This is Creative HQ team 5. Each team builds one working prototype in about seven hours.
Code is due at 5:00pm; what is on `main` then is judged, with a
five-minute live demo at the table. Judges score four criteria (1 to 10 each):
better, faster, cheaper; solves the real problem as Council described it;
works on real Council or open data; Council could realistically use it.

Council's problem statement below is verbatim. Do not rewrite or "correct" it.

This is a proof of concept, not a finished product. Scope accordingly: start
from the whole problem, then home in on the area with the most useful data and
the highest impact. A narrow thing that works with real Auckland data beats a
broad thing that does not demo.

## This team's problem

### Team 5 · Waste B · Reuse, repair and recycling finder

_Waste · Creative HQ team 5 · Council expert on the day: TBC (Council to confirm)_

#### Problem statement (as provided by Auckland Council)

> Word for word from Creative HQ's "All problem statements 13.10" document (13 October 2026). Typos are Council's own. Email addresses and phone numbers are replaced with "(contact via Creative HQ)"; where the document gave only an address, the name in front of it is read from the address. An embedded presentation is replaced with a link to it, minus its contact slide.

<!-- verbatim:start -->

##### Waste Problem Statement 2

**Contact**

- Nadine Wakim: (contact via Creative HQ)

**Description**

Directory for reuse, repair, recycling, and responsible disposal options

People in Auckland often do not know where to take items at the end of their life for repair, reuse, recycling, or responsible disposal. Existing information sources, including council’s ‘where does it go?’ directory, can be incomplete, inaccessible, or quickly become outdated. How might we provide Aucklanders with accurate, accessible, and up-to-date guidance the helps materials keep circulating and minimising landfill. Emerging tools such as this example from an industry organisation, Techcollect, or proprietary tools,such as Recyclemate, indicate the potential for scanning barcodes or using photos of items to source information required.

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

| Statement                                                                                                                 | Contact      | SME for day                                         |
| ------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------- |
| Waste #2<br>Creating better tools to help Aucklanders identify reuse, repair, recycling and responsible disposal options. | Nadine Wakim | Exact person TBC but confirmed will provide someone |

<!-- verbatim:end -->

#### Organiser summary

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

## What good looks like

- It runs, and someone who did not build it can follow the README to run it.
- It uses real Auckland data where possible, fetched in code, not pasted in.
- Outputs that other tools can use (GeoJSON, CSV, an API) are worth more than
  a closed demo. For spatial problems, keep results geospatial.
- It is honest: what is synthetic, inferred or missing is stated in the README
  and visible in the interface.

## Data

Use the catalogue client from https://github.com/Auckland-Hackathons/akl-civic-data: `akl_data.py` (Python, stdlib only)
or `akl-data.js` (ES module), next to `catalogue.json`. Find sources with
`akl_data.ids(problem="<slug>")` (the slug in this repository's name) or
`akl_data.search("<text>")`; each record's
`why` and `verified.note` explain what it is good for and any quirks. The data
repo also has `skills/akl-data/SKILL.md` with the same rules in skill form.

- Keys are each team's own; the organisers do not issue shared keys.
- Request WGS84 (`outSR=4326`). Raw NZTM2000 coordinates are metres.
- Requests are capped at 1,000 or 2,000 rows. Page with `all_features()`.
- Always pass a bbox for big layers (flow paths, buildings, parcels, LiDAR).
- Cache responses locally while developing. Do not hammer council servers.

## Constraints

- **Private event repository.** Nothing here is for publication yet.
- **No secrets in code, commands or commits.** Keys come from environment
  variables (`AT_API_KEY`, `LINZ_API_KEY`, `TOMTOM_KEY`). Never read, print or
  log their values. Local env files are ignored by git.
- **No personal information.** No participant details, and nothing that
  identifies a person from any supplied sample. Supplied data goes in
  `private-data/`, which is ignored.
- **The data belongs to its publishers.** Credit them in the README.
- **Label what is not real.** Never present synthetic, inferred or unverified
  information as fact.

## Conventions

- Commit and push early and often, with clear messages; organisers look at
  repository activity to see who needs a hand. Merge to `main` well before
  5:00pm.
- Keep the README current: what it does, how to run it, data used, limitations.
- Pin dependencies. Prefer few of them.
- Do not add a licence file. What is built belongs to Auckland Council and
  Auckland Startup Week, with a licence back to the participants; see NOTICE.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
