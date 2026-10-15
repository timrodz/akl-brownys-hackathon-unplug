import type {
  RecommendationSummary,
  SubmissionItemSummary,
  SubmissionSuccessResponse,
} from "@/lib/submissions/types";

const PATHWAY_LABEL: Record<string, string> = {
  reduce: "Reduce",
  reuse: "Reuse",
  repair: "Repair",
  recycle: "Recycle",
  dispose: "Dispose",
};

type Props = {
  result: SubmissionSuccessResponse;
};

export function SubmissionResults({ result }: Props) {
  const { item, recommendations, warnings, submissionId, status } = result;

  if (status === "failed" || !item) {
    return (
      <section className="results-panel" aria-labelledby="results-heading">
        <h3 id="results-heading">We could not match your item</h3>
        {warnings.map((warning) => (
          <p key={warning} className="results-warning" role="status">
            {warning}
          </p>
        ))}
        <p className="results-meta">
          Submission saved (demo id: {submissionId.slice(0, 8)}…).
        </p>
      </section>
    );
  }

  return (
    <section className="results-panel" aria-labelledby="results-heading">
      <h3 id="results-heading">Your options</h3>
      <p className="results-match">
        Matched: <strong>{item.title}</strong>
        {item.lowConfidence ? (
          <span className="results-badge">Inferred match — please check</span>
        ) : null}
      </p>
      {item.hazardAlert ? (
        <p className="results-hazard" role="alert">{item.hazardAlert}</p>
      ) : null}
      {warnings.map((warning) => (
        <p key={warning} className="results-warning" role="status">
          {warning}
        </p>
      ))}
      <ol className="results-list">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </ol>
      <p className="results-meta">
        Demo catalogue · submission {submissionId.slice(0, 8)}… · sample
        listings labelled in copy.
      </p>
    </section>
  );
}

function RecommendationCard({ rec }: { rec: RecommendationSummary }) {
  const label = PATHWAY_LABEL[rec.pathway] ?? rec.pathway;
  return (
    <li className="results-card">
      <div className="results-card-top">
        <span className="results-pathway">{label}</span>
        {rec.distanceKm != null ? (
          <span className="results-distance">
            {rec.distanceKm.toFixed(1)} km
          </span>
        ) : null}
      </div>
      <h4>{rec.title}</h4>
      <p>{rec.body}</p>
      {rec.business?.website ? (
        <a
          className="results-link"
          href={rec.business.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit website ↗
        </a>
      ) : rec.business?.sourceUrl ? (
        <a
          className="results-link"
          href={rec.business.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Source ↗
        </a>
      ) : null}
    </li>
  );
}
