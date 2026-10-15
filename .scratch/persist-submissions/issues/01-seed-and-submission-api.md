# 01: Demo catalogue seed and submission API

**What to build:** Resident submits the form; the API persists the submission, auto-seeds 5 items and 3 businesses, matches one item, writes recommendations, and returns JSON.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Drizzle schema for submissions, items, businesses, recommendations
- [x] Idempotent demo seed (5 items, 3 businesses, business-item links)
- [x] Keyword matcher, recommendation builder, orchestration
- [x] POST /api/submissions returns submissionId, item, recommendations
