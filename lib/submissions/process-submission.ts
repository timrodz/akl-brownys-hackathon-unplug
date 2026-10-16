import "server-only";
import { safeFailure } from "@/lib/diagnostics";

import { eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  businessItems,
  businesses,
  items,
  recommendations,
  submissionItems,
  submissions,
} from "@/lib/db/schema";
import {
  geocodePostcode,
  pointFromCoordinates,
} from "@/lib/location/geocode";
import { buildRecommendations } from "./build-recommendations";
import { matchItemByKeywords } from "./match-item";
import type {
  RecommendationSummary,
  SubmissionItemSummary,
  SubmissionSuccessResponse,
} from "./types";

export type ProcessSubmissionInput = {
  reference?: string;
  onStage?: (stage: string, metadata?: Record<string, number | boolean>) => void;
  description: string;
  postcode?: string;
  coordinates?: { latitude: number; longitude: number };
  photo?: { bytes: Buffer; mime: string; sizeBytes: number };
};

export async function processSubmission(
  input: ProcessSubmissionInput,
): Promise<SubmissionSuccessResponse> {
  if (!db) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  input.onStage?.("resolve_location");
  const locationSource = input.coordinates ? "geolocation" : "postcode";
  let latitude = input.coordinates?.latitude ?? null;
  let longitude = input.coordinates?.longitude ?? null;
  const warnings: string[] = [];

  if (input.coordinates) {
    const point = pointFromCoordinates(
      input.coordinates.latitude,
      input.coordinates.longitude,
    );
    if (point.inAucklandRegion === false) {
      warnings.push(
        "Your location looks outside the Auckland region — distances may be less relevant.",
      );
    }
    latitude = point.latitude;
    longitude = point.longitude;
  } else if (input.postcode) {
    const point = await geocodePostcode(input.postcode);
    if (!point) {
      warnings.push(
        "We could not map that postcode to a search point — showing options without distance.",
      );
    } else {
      latitude = point.latitude;
      longitude = point.longitude;
    }
  }

  input.onStage?.("save_submission",{hasPhoto:Boolean(input.photo),locationResolved:latitude!==null&&longitude!==null});
  const [submission] = await db
    .insert(submissions)
    .values({
      description: input.description,
      postcode: input.postcode ?? null,
      latitude,
      longitude,
      locationSource,
      photoData: input.photo?.bytes ?? null,
      photoMime: input.photo?.mime ?? null,
      photoSizeBytes: input.photo?.sizeBytes ?? null,
      status: "received",
    })
    .returning();

  input.onStage?.("submission_saved");
  try {
  input.onStage?.("load_catalogue");
  const catalogue = (await db.select().from(items)).filter(item => !item.externalId.startsWith("demo-"));
  const match = matchItemByKeywords(input.description, catalogue);
  input.onStage?.("item_matched",{catalogueCount:catalogue.length,matched:Boolean(match.item)});

  if (!match.item) {
    await db
      .update(submissions)
      .set({
        status: "failed",
        errorMessage: "No confident catalogue match for this description.",
      })
      .where(eq(submissions.id, submission.id));

    await db.insert(submissionItems).values({
      submissionId: submission.id,
      itemId: null,
      descriptionSnapshot: input.description,
      matchConfidence: null,
      matchMethod: null,
    });

    return {
      submissionId: submission.id,
      status: "failed",
      item: null,
      recommendations: [],
      warnings: [
        ...warnings,
        "We could not match your description to the catalogue — try adding material or product words (for example battery, toaster, clothing).",
      ],
    };
  }

  const lowConfidence = match.confidence < 0.55;

  await db.insert(submissionItems).values({
    submissionId: submission.id,
    itemId: match.item.id,
    descriptionSnapshot: input.description,
    matchConfidence: match.confidence,
    matchMethod: match.method,
  });

  await db
    .update(submissions)
    .set({ status: "matched" })
    .where(eq(submissions.id, submission.id));

  input.onStage?.("load_linked_businesses");
  const links = await db
    .select({
      business: businesses,
      role: businessItems.role,
      notes: businessItems.notes,
    })
    .from(businessItems)
    .innerJoin(businesses, eq(businessItems.businessId, businesses.id))
    .where(eq(businessItems.itemId, match.item.id));

  const drafts = buildRecommendations(
    match.item,
    links.filter(row => row.business.status !== "demo" && !row.business.externalId.startsWith("demo-")),
    latitude,
    longitude,
  );

  input.onStage?.("save_recommendations",{businessLinks:links.length,recommendations:drafts.length});
  const insertedRecs = await db
    .insert(recommendations)
    .values(
      drafts.map((d) => ({
        submissionId: submission.id,
        pathway: d.pathway,
        sortOrder: d.sortOrder,
        title: d.title,
        body: d.body,
        businessId: d.businessId,
        distanceKm: d.distanceKm,
      })),
    )
    .returning();

  await db
    .update(submissions)
    .set({ status: "results_ready" })
    .where(eq(submissions.id, submission.id));

  const itemSummary: SubmissionItemSummary = {
    id: match.item.id,
    title: match.item.title,
    hazardAlert: match.item.hazardAlert,
    disposalGuidance: match.item.disposalGuidance,
    matchConfidence: match.confidence,
    matchMethod: match.method,
    lowConfidence,
  };

  if (lowConfidence) {
    warnings.push(
      "This catalogue match is inferred from keywords — please check it fits your item.",
    );
  }

  const businessIds = new Set(
    insertedRecs
      .map((r) => r.businessId)
      .filter((id): id is string => Boolean(id)),
  );
  const businessRows =
    businessIds.size > 0
      ? await db
          .select()
          .from(businesses)
          .where(inArray(businesses.id, [...businessIds]))
      : [];

  const businessById = new Map(businessRows.map((b) => [b.id, b]));

  const recommendationSummaries: RecommendationSummary[] = insertedRecs
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((rec) => {
      const business = rec.businessId
        ? businessById.get(rec.businessId)
        : undefined;
      const acceptanceNotes = business ? [...new Set(links
        .filter(link => link.business.id === business.id)
        .map(link => link.notes).filter(Boolean))].join(" ") : "";
      return {
        id: rec.id,
        pathway: rec.pathway,
        sortOrder: rec.sortOrder,
        title: rec.title,
        body: rec.body,
        distanceKm: rec.distanceKm,
        acceptanceNote: business ? [
          `Catalogue lists this business for ${match.item.title}.`,
          business.acceptsHousehold === true ? "Household items accepted according to the catalogue." : "Household acceptance is not confirmed; check before travelling.",
          acceptanceNotes, business.dropOffNotes,
        ].filter(Boolean).join(" ") : undefined,
        business: business
          ? {
              id: business.id,
              name: business.name,
              suburb: business.suburb,
              phone: business.phone,
              website: business.website,
              sourceUrl: business.sourceUrl,
            }
          : null,
      };
    });

  return {
    submissionId: submission.id,
    status: "results_ready",
    item: itemSummary,
    recommendations: recommendationSummaries,
    warnings,
  };
  } catch (error) {
    // Submission is saved even if the catalogue or recommendations cannot load.
    try { await db.update(submissions).set({status: "failed", errorMessage: "Catalogue processing failed."}).where(eq(submissions.id, submission.id)); } catch { /* Keep the saved ID if updating status also fails. */ }
    console.error("[submission]", {event:"processing_failed_after_save",reference:input.reference,submissionId:submission.id,...safeFailure(error)});
    return {submissionId: submission.id, status: "failed", item: null, recommendations: [], warnings: [...warnings, "Your submission was saved, but we couldn't load local options. Please try again shortly."]};
  }
}
