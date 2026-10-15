export type SubmissionItemSummary = {
  id: string;
  title: string;
  hazardAlert: string | null;
  disposalGuidance: string | null;
  matchConfidence: number | null;
  matchMethod: string | null;
  lowConfidence: boolean;
};

export type BusinessSummary = {
  id: string;
  name: string;
  suburb: string | null;
  website: string | null;
  sourceUrl: string | null;
};

export type RecommendationSummary = {
  id: string;
  pathway: string;
  sortOrder: number;
  title: string;
  body: string;
  distanceKm: number | null;
  business: BusinessSummary | null;
};

export type SubmissionSuccessResponse = {
  submissionId: string;
  status: "results_ready" | "matched" | "failed";
  item: SubmissionItemSummary | null;
  recommendations: RecommendationSummary[];
  warnings: string[];
};
