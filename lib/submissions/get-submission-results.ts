import "server-only";

import { asc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  businesses,
  items,
  recommendations,
  submissionItems,
  submissions,
} from "@/lib/db/schema";

import type {
  RecommendationSummary,
  SubmissionItemSummary,
  SubmissionSuccessResponse,
} from "./types";

const SUBMISSION_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isSubmissionId(id: string): boolean {
  return SUBMISSION_ID_RE.test(id);
}

function mapStatus(
  status: (typeof submissions.$inferSelect)["status"],
): SubmissionSuccessResponse["status"] {
  if (status === "failed") return "failed";
  if (status === "matched") return "matched";
  return "results_ready";
}

function buildWarnings(
  submission: (typeof submissions.$inferSelect),
  item: SubmissionItemSummary | null,
): string[] {
  const warnings: string[] = [];

  if (
    item?.matchConfidence != null &&
    item.matchConfidence < 0.55
  ) {
    warnings.push(
      "This catalogue match is inferred from keywords — please check it fits your item.",
    );
  }

  if (submission.status === "failed" && !item) {
    warnings.push(
      submission.errorMessage ??
        "We could not match your description to the catalogue — try adding material or product words (for example battery, toaster, clothing).",
    );
  } else if (submission.status === "failed" && submission.errorMessage) {
    warnings.push(submission.errorMessage);
  }

  if (submission.status === "received") {
    warnings.push(
      "This submission is still being processed — refresh in a moment if options are missing.",
    );
  }

  return warnings;
}

export async function getSubmissionResults(
  id: string,
): Promise<SubmissionSuccessResponse | null> {
  if (!db || !isSubmissionId(id)) {
    return null;
  }

  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);

  if (!submission) {
    return null;
  }

  const [submissionItemRow] = await db
    .select({
      submissionItem: submissionItems,
      item: items,
    })
    .from(submissionItems)
    .leftJoin(items, eq(submissionItems.itemId, items.id))
    .where(eq(submissionItems.submissionId, id))
    .limit(1);

  const recRows = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.submissionId, id))
    .orderBy(asc(recommendations.sortOrder));

  const businessIds = [
    ...new Set(
      recRows
        .map((rec) => rec.businessId)
        .filter((businessId): businessId is string => Boolean(businessId)),
    ),
  ];

  const businessRows =
    businessIds.length > 0
      ? await db
          .select()
          .from(businesses)
          .where(inArray(businesses.id, businessIds))
      : [];

  const businessById = new Map(businessRows.map((business) => [business.id, business]));

  let itemSummary: SubmissionItemSummary | null = null;
  if (submissionItemRow?.item) {
    const matchConfidence = submissionItemRow.submissionItem.matchConfidence;
    itemSummary = {
      id: submissionItemRow.item.id,
      title: submissionItemRow.item.title,
      hazardAlert: submissionItemRow.item.hazardAlert,
      disposalGuidance: submissionItemRow.item.disposalGuidance,
      matchConfidence,
      matchMethod: submissionItemRow.submissionItem.matchMethod,
      lowConfidence:
        matchConfidence != null ? matchConfidence < 0.55 : false,
    };
  }

  const recommendationSummaries: RecommendationSummary[] = recRows.map((rec) => {
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
      acceptanceNote: business ? [
        `Saved catalogue recommendation for ${itemSummary?.title ?? "your item"}.`,
        business.acceptsHousehold === true ? "Household items accepted according to the catalogue." : "Household acceptance is not confirmed; check before travelling.",
        // The saved body retains the item-link restrictions used for this recommendation.
        rec.body,
      ].filter(Boolean).join(" ") : undefined,
      business: business
        ? {
            id: business.id,
            name: business.name,
            suburb: business.suburb,
            phone: business.phone,
            website: business.website,
            sourceUrl: business.sourceUrl,
            streetAddress: business.streetAddress,
            latitude: business.latitude,
            longitude: business.longitude,
          }
        : null,
    };
  });

  return {
    submissionId: submission.id,
    status: mapStatus(submission.status),
    item: itemSummary,
    recommendations: recommendationSummaries,
    warnings: buildWarnings(submission, itemSummary),
  };
}
