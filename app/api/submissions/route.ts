import { isDatabaseConfigured } from "@/lib/db";
import { photoError, submissionSchema } from "@/lib/forms/validation";
import { processSubmission } from "@/lib/submissions/process-submission";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024) {
    return Response.json(
      { error: "Choose an image under 5 MB." },
      { status: 413 },
    );
  }

  if (!isDatabaseConfigured()) {
    return Response.json(
      {
        error:
          "Database is not configured yet. Set DATABASE_URL and run bun db:push.",
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
        return Response.json(
          { error: "Please select your location again." },
          { status: 400 },
        );
      }
    }

    const parsed = submissionSchema.safeParse({
      description: form.get("description"),
      postcode: form.get("postcode") || undefined,
      coordinates,
    });
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
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
      description: parsed.data.description,
      postcode: parsed.data.postcode,
      coordinates: parsed.data.coordinates,
      photo: photoPayload,
    });

    return Response.json(result, {
      status: result.status === "failed" ? 422 : 200,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json(
        { error: "Database is not configured yet." },
        { status: 503 },
      );
    }
    return Response.json(
      { error: "Couldn't process your submission. Please try again." },
      { status: 500 },
    );
  }
}
