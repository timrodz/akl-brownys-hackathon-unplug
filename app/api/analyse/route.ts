import { classifyPhoto, hasImageApiKey, IMAGE_MODEL_ID } from "@/lib/ai/classify-photo";
import { photoError } from "@/lib/forms/validation";
import { safeFailure as failureDetails } from "@/lib/diagnostics";
export async function POST(request: Request) {
    let stage = "upload";
    const started = Date.now();
    const reference = globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36);
    console.info("[analyse]", {event:"request_started",diagnosticsVersion:2,reference,model:/^[a-z0-9.-]{1,80}$/i.test(IMAGE_MODEL_ID)?IMAGE_MODEL_ID:"custom",configured:hasImageApiKey()});
    if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024)
        return Response.json({ error: "Choose an image under 5 MB." }, { status: 413 });
    try {
        const form = await request.formData();
        const photo = form.get("photo");
        const error = photoError(photo);
        if (error || !(photo instanceof File))
            return Response.json({ error }, { status: 400 });
        if (!hasImageApiKey())
            return Response.json({ status: "manual", message: "Your photo is attached. Automatic identification is not configured yet. Please describe your item below." });
        console.info("[analyse]", {event:"photo_validated",reference,bytes:photo.size,mediaType:photo.type});
        stage = "openrouter";
        const text = await classifyPhoto(photo, reference);
        console.info("[analyse]", {event:"identification_completed",reference,elapsedMs:Date.now()-started,outputCharacters:text.length});
        if (!text.trim()) throw Object.assign(new Error(), { name: "AI_NoOutputGeneratedError" });
        stage = "catalogue";
        const description = text.trim().slice(0, 1000);
        try {
            const { checkCatalogueDescription } = await import("@/lib/catalogue/check-description");
            const catalogueCheck = await checkCatalogueDescription(description);
            console.info("[analyse]", {event:"catalogue_checked",reference,matched:Boolean(catalogueCheck.catalogueMatch),warning:Boolean(catalogueCheck.catalogueWarning),elapsedMs:Date.now()-started});
            return Response.json({ description, ...catalogueCheck });
        } catch (cause) {
            console.error("[analyse]", {reference, stage, ...failureDetails(cause)});
            // Identification succeeded: do not lose the description if the DB module fails.
            return Response.json({description, catalogueMatch: null, catalogueWarning: "Photo identified. Catalogue checking is temporarily unavailable; please review the description."});
        }
    }
    catch (cause) {
        const details = failureDetails(cause);
        // Only bounded classifications are logged: no credentials, image data, prompts,
        // provider response bodies, URLs, raw errors or submitted descriptions.
        console.error("[analyse]", { event:"request_failed", elapsedMs:Date.now()-started, reference, stage, model: /^[a-z0-9.-]{1,80}$/i.test(IMAGE_MODEL_ID) ? IMAGE_MODEL_ID : "custom", ...details });
        const hint = details.status === 404 ? "The configured image model is unavailable."
            : details.status === 401 || details.status === 403 ? "Image identification is not authorised."
            : details.status === 503 ? "Image identification is temporarily unavailable. Please try again shortly."
            : details.status === 429 ? "Image identification has reached its usage limit. Please try later."
            : details.errorType === "TimeoutError" || details.errorType === "AbortError" ? "Image identification timed out. Please try again."
            : "Couldn't identify the photo.";
        return Response.json({ error: hint + " Please describe your item below. Reference: " + reference, reference }, { status: 502 });
    }
}
