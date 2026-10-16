"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmissionResults } from "@/app/components/submission-results";
import type { SubmissionSuccessResponse } from "@/lib/submissions/types";
import { RESULTS_STORAGE_KEY } from "@/lib/results-storage";

export default function ResultsPage() {
  const [result, setResult] = useState<SubmissionSuccessResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RESULTS_STORAGE_KEY);
      if (raw) setResult(JSON.parse(raw) as SubmissionSuccessResponse);
    } catch {
      // Ignore malformed or inaccessible storage; falls through to empty state.
    } finally {
      setLoaded(true);
    }
  }, []);

  return (
    <div className="site-shell">
      <header className="site-header">
        <h1 className="brand-heading">
          <Link href="/" className="wordmark" aria-label="Unplug home">
            Unplug
          </Link>
        </h1>
      </header>
      <main id="main" className="landing">
        <section className="form-card results-standalone" aria-labelledby="results-heading">
          {!loaded ? null : result ? (
            <SubmissionResults result={result} />
          ) : (
            <div className="results-panel">
              <h3 id="results-heading">No results to show</h3>
              <p className="results-warning" role="status">
                We couldn&rsquo;t find a recent submission. Start a new search
                to see reuse, recycle and repair options.
              </p>
              <Link href="/" className="results-link">
                ← Back to search
              </Link>
            </div>
          )}
        </section>
      </main>
      <footer>
        <span>Small actions. Longer lives for our stuff.</span>
        <span>Built in Auckland, for Auckland ↗</span>
      </footer>
    </div>
  );
}
