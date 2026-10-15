import { photoError, submissionSchema } from "@/lib/forms/validation";
export async function POST(request: Request) {
    if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024)
        return Response.json({ error: "Choose an image under 5 MB." }, { status: 413 });
    try {
        const form = await request.formData();
        const photo = form.get("photo");
        if (photo) {
            const error = photoError(photo);
            if (error)
                return Response.json({ error }, { status: 400 });
        }
        let coordinates;
        const raw = form.get("coordinates");
        if (raw) {
            try {
                coordinates = JSON.parse(String(raw));
            }
            catch {
                return Response.json({ error: "Please select your location again." }, { status: 400 });
            }
        }
        const parsed = submissionSchema.safeParse({ description: form.get("description"), postcode: form.get("postcode") || undefined, coordinates });
        if (!parsed.success)
            return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
        // Integration seam: reverse-geocode coordinates or geocode postcode with Google Maps,
        // then query the real service directory. Results deliberately deferred in this phase.
        // No photos, location or item details are persisted or logged by this scaffold.
        return Response.json({ status: "scaffold", searchPerformed: false, persisted: false }, { status: 202 });
    }
    catch {
        return Response.json({ error: "Couldn't read your form. Please try again." }, { status: 400 });
    }
}
