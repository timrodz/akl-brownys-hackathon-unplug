import "server-only";

import { eq, inArray } from "drizzle-orm";

import { seedCatalogue } from "@/lib/catalogue/seed";
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

  await seedCatalogue();

  const locationSource = input.coordinates ? "geolocation" : "postcode";
  let latitude = input.coordinates?.latitude ?? null;
  let longitude = input.coordinates?.longitude ?? null;
  const warnings: string[] = [];

  if (input.coordinates) {
    const point = pointFromCoordinates(
      input.coordinates.latitude,
      input.coordinates.longitude,
    );
    if (!point.inAucklandRegion) {
      warnings.push(
        "Your location looks outside the Auckland region — distances may be less relevant.",
      );
    }
    latitude = point.latitude;
    longitude = point.longitude;
  } else if (input.postcode) {
    const point = geocodePostcode(input.postcode);
    if (!point) {
      warnings.push(
        "We could not map that postcode to a search point — showing options without distance.",
      );
    } else {
      latitude = point.latitude;
      longitude = point.longitude;
    }
  }

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

  const catalogue = await db.select().from(items);
  const match = matchItemByKeywords(input.description, catalogue);

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
    links,
    latitude,
    longitude,
  );

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
      return {
        id: rec.id,
        pathway: rec.pathway,
        sortOrder: rec.sortOrder,
        title: rec.title,
        body: rec.body,
        distanceKm: rec.distanceKm,
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
}
