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
  cost?: string | null;
  id: string;
  name: string;
  suburb: string | null;
  phone: string | null;
  website: string | null;
  sourceUrl: string | null;
  streetAddress: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type RecommendationSummary = {
  acceptanceNote?: string;
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
