import { notFound } from "next/navigation";

import { SubmissionResults } from "@/app/components/submission-results";
import { PublicResultsShell } from "@/app/components/public-results-shell";
import { isDatabaseConfigured } from "@/lib/db";
import {
  getSubmissionResults,
  isSubmissionId,
} from "@/lib/submissions/get-submission-results";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Results ${id.slice(0, 8)} | Unplug`,
  };
}

export default async function ResultsByIdPage({ params }: PageProps) {
  const { id } = await params;

  if (!isSubmissionId(id)) {
    notFound();
  }

  if (!isDatabaseConfigured()) {
    return (
      <PublicResultsShell>
        <section className="form-card">
          <h2>Results unavailable</h2>
          <p>
            The database is not configured, so saved submissions cannot be
            loaded by link yet.
          </p>
          <a href="/" className="results-link">Start a search →</a>
        </section>
      </PublicResultsShell>
    );
  }

  const result = await getSubmissionResults(id);
  if (!result) {
    notFound();
  }

  return (
    <PublicResultsShell>
      <SubmissionResults result={result} />
    </PublicResultsShell>
  );
}
