# Store submission photos as Postgres bytea on Neon

Residents may attach a photo when they submit an item. We persist the image bytes in the `submissions.photo_data` column (with MIME type and size) on Neon rather than object storage or discarding after Gemini analysis. That keeps the hackathon stack to one database and makes replay and judging straightforward, at the cost of larger rows and the need to cap upload size (5 MB in the API) and treat the table as sensitive in demos.
