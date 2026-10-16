"use client";

import { useEffect, useState } from "react";

import { PublicResultsShell } from "@/app/components/public-results-shell";
import { SubmissionResults } from "@/app/components/submission-results";
import type { SubmissionSuccessResponse } from "@/lib/submissions/types";
import { RESULTS_STORAGE_KEY } from "@/lib/results-storage";

export default function ResultsPage() {
  const [result, setResult] = useState<SubmissionSuccessResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(RESULTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SubmissionSuccessResponse;
        if (
          parsed &&
          typeof parsed.submissionId === "string" &&
          Array.isArray(parsed.recommendations)
        ) {
          setResult(parsed);
        }
      }
    } catch {
      // Ignore malformed or inaccessible storage.
    } finally {
      setLoaded(true);
    }
  }, []);

  return (
    <PublicResultsShell>
      {result ? (
        <SubmissionResults result={result} />
      ) : loaded ? (
        <section className="form-card">
          <h2>Find options for your item</h2>
          <p>
            No submission is selected. Describe an item and enter your postcode
            to search the database, or open a saved submission link (
            <code>/results/your-submission-id</code>).
          </p>
          <a href="/" className="results-link">Start a search →</a>
        </section>
      ) : (
        <p role="status">Loading your options…</p>
      )}
    </PublicResultsShell>
  );
}
