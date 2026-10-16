import { safeFailure } from "@/lib/diagnostics";
import { isDatabaseConfigured } from "@/lib/db";
import { photoError, submissionSchema } from "@/lib/forms/validation";
import { processSubmission } from "@/lib/submissions/process-submission";

export async function POST(request: Request) {
  const reference = globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36);
  const started = Date.now();
  let stage = "validate_request";
  console.info("[submission]", {
    event: "request_started",
    diagnosticsVersion: 2,
    reference,
    databaseConfigured: isDatabaseConfigured(),
  });
  if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024) {
    return Response.json({ error: "Choose an image under 5 MB." }, { status: 413 });
  }

  if (!isDatabaseConfigured()) {
    console.error("[submission]", {
      event: "request_failed",
      reference,
      stage: "configuration",
      reason: "database_not_configured",
    });
    return Response.json(
      {
        error: "Database is not configured yet. Set DATABASE_URL and run bun db:push.",
      },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const photo = form.get("photo");
    if (photo) {
      const error = photoError(photo);
      if (error) {
        return Response.json({ error }, { status: 400 });
      }
    }

    let coordinates;
    const raw = form.get("coordinates");
    if (raw) {
      try {
        coordinates = JSON.parse(String(raw));
      } catch {
        return Response.json({ error: "Please select your location again." }, { status: 400 });
      }
    }

    const parsed = submissionSchema.safeParse({
      description: form.get("description"),
      postcode: form.get("postcode") || undefined,
      coordinates,
    });
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    let photoPayload;
    if (photo instanceof File && photo.size > 0) {
      photoPayload = {
        bytes: Buffer.from(await photo.arrayBuffer()),
        mime: photo.type,
        sizeBytes: photo.size,
      };
    }

    const result = await processSubmission({
      reference,
      onStage: (nextStage, metadata = {}) => {
        stage = nextStage;
        console.info("[submission]", {
          event: "stage",
          reference,
          stage,
          elapsedMs: Date.now() - started,
          ...metadata,
        });
      },
      description: parsed.data.description,
      postcode: parsed.data.postcode,
      coordinates: parsed.data.coordinates,
      photo: photoPayload,
    });

    console.info("[submission]", {
      event: "request_completed",
      reference,
      status: result.status,
      recommendations: result.recommendations.length,
      elapsedMs: Date.now() - started,
    });
    return Response.json(result, {
      // An unmatched item is a saved submission outcome, not an invalid request.
      status: 200,
    });
  } catch (error) {
    console.error("[submission]", {
      event: "request_failed",
      reference,
      stage,
      elapsedMs: Date.now() - started,
      ...safeFailure(error),
    });
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ error: "Database is not configured yet." }, { status: 503 });
    }
    return Response.json(
      {
        error: "Couldn't save your submission. Please try again. Reference: " + reference,
        reference,
      },
      { status: 500 },
    );
  }
}
