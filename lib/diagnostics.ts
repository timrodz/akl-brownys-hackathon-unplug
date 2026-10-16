/** Fixed classifications only. Never return raw exceptions, bodies, URLs or SQL. */
export function safeFailure(error: unknown) {
  let status: number | null = null;
  let errorType = "UnknownError", providerCode: string | null = null, reason = "unknown", databaseCode: string | null = null;
  const names = new Set(["AI_APICallError", "AI_NoOutputGeneratedError", "AI_NoContentGeneratedError", "AI_TypeValidationError", "AI_InvalidArgumentError", "AI_InvalidPromptError", "AI_UnsupportedFunctionalityError", "AI_RetryError", "AbortError", "TimeoutError", "TypeError", "PostgresError", "DrizzleQueryError"]);
  const providerCodes = new Set(["NOT_FOUND", "INVALID_ARGUMENT", "PERMISSION_DENIED", "UNAUTHENTICATED", "RESOURCE_EXHAUSTED", "UNAVAILABLE", "INTERNAL", "DEADLINE_EXCEEDED"]);
  const databaseCodes: Record<string, string> = { "42P01": "missing_table", "42703": "missing_column", "28P01": "database_authentication", "28000": "database_authentication", "3D000": "missing_database", "42501": "database_permissions", "23502": "not_null_constraint", "23503": "foreign_key_constraint", "23505": "unique_constraint", "22P02": "invalid_database_value", "53300": "database_connection_limit", "57P03": "database_not_ready", "57014": "database_timeout", "08001": "database_connection", "08006": "database_connection", ECONNREFUSED: "connection_refused", ECONNRESET: "connection_reset", ENOTFOUND: "dns_failure", ETIMEDOUT: "connection_timeout", CONNECT_TIMEOUT: "connection_timeout", CONNECTION_CLOSED: "connection_closed", CERT_HAS_EXPIRED: "tls_certificate", UNABLE_TO_VERIFY_LEAF_SIGNATURE: "tls_certificate" };
  let current = error;
  for (let depth = 0; depth < 8 && current && typeof current === "object"; depth++) {
    const row = current as { name?: unknown; code?: unknown; statusCode?: unknown; responseBody?: unknown; cause?: unknown; lastError?: unknown; errors?: unknown[] };
    if (typeof row.name === "string" && names.has(row.name)) errorType = row.name;
    if (typeof row.statusCode === "number" && Number.isInteger(row.statusCode) && row.statusCode >= 100 && row.statusCode <= 599) status = row.statusCode;
    if (typeof row.code === "string" && Object.hasOwn(databaseCodes, row.code)) { databaseCode = row.code; reason = databaseCodes[row.code]; }
    if (typeof row.responseBody === "string" && row.responseBody.length <= 16000) {
      try {
        const body = JSON.parse(row.responseBody)?.error;
        if (providerCodes.has(body?.status)) providerCode = body.status;
        // Inspect message only to map it to a fixed label; never retain its contents.
        const message = typeof body?.message === "string" ? body.message : "";
        if (/overload|high demand|capacity/i.test(message)) reason = "provider_capacity";
        else if (/api.key.*not.valid|invalid.api.key/i.test(message)) reason = "invalid_api_key";
        else if (/quota|rate.limit/i.test(message)) reason = "provider_quota";
        else if (/model.*not.found|not.supported.*model/i.test(message)) reason = "model_unavailable";
        else if (body?.status === "UNAVAILABLE") reason = "provider_unavailable";
      } catch { /* Never log unparseable bodies. */ }
    }
    current = row.cause ?? row.lastError ?? row.errors?.[row.errors.length - 1];
  }
  return { status, errorType, providerCode, reason, databaseCode };
}

/** Per-request wrapper captures every provider attempt, including SDK retries. */
export function diagnosticFetch(reference: string, model: string, nativeFetch: typeof fetch = globalThis.fetch): typeof fetch {
  let attempt = 0;
  const safeModel = /^[a-z0-9.-]{1,80}$/i.test(model) ? model : "custom";
  return async (input, init) => {
    const currentAttempt = ++attempt, started = Date.now();
    console.info("[analyse]", { event: "provider_attempt", reference, model: safeModel, attempt: currentAttempt });
    try {
      const response = await nativeFetch(input, init);
      let details = safeFailure(null);
      if (!response.ok) {
        try { details = safeFailure({ statusCode: response.status, responseBody: await response.clone().text() }); } catch { /* Keep the original response usable by the SDK. */ }
      }
      console.info("[analyse]", { event: "provider_response", reference, model: safeModel, attempt: currentAttempt, elapsedMs: Date.now() - started, status: response.status, providerCode: details.providerCode, reason: details.reason });
      return response;
    } catch (error) {
      console.error("[analyse]", { event: "provider_network_failure", reference, model: safeModel, attempt: currentAttempt, elapsedMs: Date.now() - started, ...safeFailure(error) });
      throw error;
    }
  };
}
