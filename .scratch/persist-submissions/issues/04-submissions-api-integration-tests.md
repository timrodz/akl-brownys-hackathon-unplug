# 04: Integration tests for POST /api/submissions

**Tracker:** GitHub #3 (sub-issue of #2)

**What to build:** A resident (or CI) can rely on automated checks that submitting the form via `POST /api/submissions` returns the agreed JSON shape, persists status transitions, and orders recommendations — without calling Gemini or live civic APIs.

**Blocked by:** 03: README and run instructions for persistence demo

**Status:** ready-for-agent

- [ ] Test runner wired in `package.json` (e.g. `pnpm test`)
- [ ] HTTP seam: multipart submit with description + postcode returns 200, `submissionId`, `status: results_ready`
- [ ] Assert keyword match (e.g. "toaster" → small electrical appliances) and recommendation ordering by pathway
- [ ] Assert 503 when database is not configured (or injected null store)
- [ ] Tests use deterministic demo catalogue (seed fixtures or auto-seed against test `DATABASE_URL`)
