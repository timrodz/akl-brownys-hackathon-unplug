import { z } from "zod";
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export function photoError(photo: FormDataEntryValue | null): string | null {
    if (!(photo instanceof File) || photo.size === 0)
        return "Choose a photo first.";
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type))
        return "Choose a JPG, PNG or WebP image.";
    if (photo.size > MAX_PHOTO_BYTES)
        return "Choose an image under 5 MB.";
    return null;
}
export const submissionSchema = z.object({
    description: z.string().trim().min(1, "Describe your item first.").max(1000),
    postcode: z.string().regex(/^\d{4}$/, "Enter a four-digit NZ postcode.").optional(),
    coordinates: z.object({ latitude: z.number().finite().min(-90).max(90), longitude: z.number().finite().min(-180).max(180) }).optional(),
}).refine(value => Boolean(value.postcode || value.coordinates), { message: "Enter a postcode or use your location." });
