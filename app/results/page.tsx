"use client";

import { PublicResultsShell } from "@/app/components/public-results-shell";
import { SubmissionResults } from "@/app/components/submission-results";
import { useStoredSubmissionResults } from "@/lib/results-storage";

export default function ResultsPage() {
  const { result, hydrated: loaded } = useStoredSubmissionResults();

  return (
    <PublicResultsShell>
      {result ? (
        <SubmissionResults result={result} />
      ) : loaded ? (
        <section className="form-card">
          <h2>Find options for your item</h2>
          <p>
            No submission is selected. Describe an item and enter your postcode to search the
            database, or open a saved submission link (<code>/results/your-submission-id</code>).
          </p>
          <a href="/" className="results-link">
            Start a search →
          </a>
        </section>
      ) : (
        <p role="status">Loading your options…</p>
      )}
    </PublicResultsShell>
  );
}
