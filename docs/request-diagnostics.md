# Diagnosing classification and submission failures

After deploying, retry one request and open its Vercel **Function Logs**. The
HTTP request summary does not include the application diagnostic entries.

Both routes emit `event: request_started` with `diagnosticsVersion: 2` and a
reference. If this entry is absent, verify the deployed commit; an error before
handler execution can also prevent it. Error responses include the same reference.

## Photo identification

Look for `[analyse]` entries:

- `request_started`: configured model and whether a key exists (never its value).
- `photo_validated`: image MIME type and byte count, never filename or contents.
- `provider_attempt` / `provider_response`: each actual SDK attempt, status and
  elapsed time. Response failures include a bounded provider code and fixed reason.
- `provider_network_failure`: connection/DNS/timeout classification before a response.
- `identification_completed`: time and character count, never identified text.
- `catalogue_checked`: matched/warning booleans.
- `request_failed`: final stage and classified cause.

`status: 503`, `providerCode: UNAVAILABLE`, `reason: provider_capacity` indicates
an overload/capacity response. `reason: provider_unavailable` is a more general
service-unavailable response. Retries have separate attempt numbers. These labels
come from provider codes and message patterns; raw provider text is not logged.

## Text form submission

Look for `[submission]` entries. Stages include `resolve_location`,
`save_submission`, `submission_saved`, `load_catalogue`, `item_matched`,
`load_linked_businesses`, and `save_recommendations`.

`request_failed` at `save_submission` means the insert did not complete and the
user must not be told it was saved. `processing_failed_after_save` means the
original submission exists but subsequent processing failed.

Fixed database classifications include:

| Code                            | Meaning            | Check                                                          |
| ------------------------------- | ------------------ | -------------------------------------------------------------- |
| `42P01`                         | Missing table      | Apply the schema to the database this deployment actually uses |
| `42703`                         | Missing column     | Align migrations and deployed code                             |
| `28P01` / `28000`               | Authentication     | Repair the database connection configuration                   |
| `42501`                         | Permissions        | Ensure the app role can read/insert/update the required tables |
| `ENOTFOUND`                     | DNS failure        | Check the database connection/hostname configuration           |
| `ECONNREFUSED`                  | Connection refused | Check database availability/connectivity                       |
| `ETIMEDOUT` / `CONNECT_TIMEOUT` | Connection timeout | Check database networking and availability                     |

Unknown errors remain `unknown`; we do not print raw exceptions, SQL, parameters,
connection strings, provider URLs/headers/bodies, images, user descriptions,
postcodes or coordinates. Inspecting sensitive raw logs is not required.

The source postcode dataset does not contain `1020`. That is not a reason for a
500: a well-formed unknown postcode is saved, with a warning and no distances.

Regression checks: `node scripts/check-request-diagnostics.cjs`,
`node scripts/check-submission-flow.cjs`, and `node scripts/check-photo-diagnostics.cjs`.
These simulate provider/database failures, including nested SQL errors, and verify
reference correlation and exclusion of sensitive fixture strings. They cannot prove
the live database or Gemini account is configured correctly.
