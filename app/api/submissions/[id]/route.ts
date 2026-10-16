import { isDatabaseConfigured } from "@/lib/db";
import { getSubmissionResults, isSubmissionId } from "@/lib/submissions/get-submission-results";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!isSubmissionId(id)) {
    return Response.json({ error: "Invalid submission id." }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return Response.json({ error: "Database is not configured yet." }, { status: 503 });
  }

  const result = await getSubmissionResults(id);
  if (!result) {
    return Response.json({ error: "Submission not found." }, { status: 404 });
  }

  return Response.json(result);
}
