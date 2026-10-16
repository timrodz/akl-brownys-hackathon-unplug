"use client";

import { useId, useState } from "react";
import type { RecommendationSummary } from "@/lib/submissions/types";

export function BusinessResultRow({ recommendation, rank }: {
  recommendation: RecommendationSummary;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const business = recommendation.business;
  if (!business) return null;
  const { latitude, longitude } = business;
  const hasPoint = typeof latitude === "number" && typeof longitude === "number"
    && Number.isFinite(latitude) && Number.isFinite(longitude)
    && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
    && !(latitude === 0 && longitude === 0);
  const mapParams = hasPoint ? new URLSearchParams({
    bbox: [Math.max(-180, longitude - 0.01), Math.max(-90, latitude - 0.006), Math.min(180, longitude + 0.01), Math.min(90, latitude + 0.006)].join(","),
    layer: "mapnik",
    marker: `${latitude},${longitude}`,
  }) : null;

  return <>
    <tr className={`business-result-row${expanded ? " is-expanded" : ""}`} onClick={event => {
      // Links retain their own actions; the disclosure button handles keyboard use.
      if ((event.target as HTMLElement).closest("a,button")) return;
      setExpanded(value => !value);
    }}>
      <td><span className="rank-number">{rank}</span></td>
      <td>
        <button type="button" className="business-map-toggle" aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpanded(value => !value)}>
          <strong>{business.name}</strong>
          <span>{expanded ? "Hide location −" : "View location +"}</span>
        </button>
        <small>{recommendation.pathway} · {business.suburb ?? "Area not supplied"}</small>
        {business.website ? <a className="results-link" href={business.website} target="_blank" rel="noopener noreferrer">Website ↗</a> : null}
      </td>
      <td>{recommendation.distanceKm == null ? "Not available" : `Approx. ${recommendation.distanceKm.toFixed(1)} km`}</td>
      <td>{business.phone ? <a className="results-link" href={`tel:${business.phone.replace(/[^+0-9]/g, "")}`}>{business.phone}</a> : "Not supplied"}</td>
    </tr>
    <tr hidden={!expanded} className="business-location-row">
      <td colSpan={4}>
        <div id={panelId} className="business-location" role="region" aria-label={`${business.name} location`}>
          {expanded ? <>
            <p><strong>Address:</strong> {business.streetAddress || "Address not supplied"}</p>
            {mapParams ? <>
              <iframe title={`Map showing ${business.name}`} src={`https://www.openstreetmap.org/export/embed.html?${mapParams}`} loading="lazy" referrerPolicy="no-referrer" />
              <a className="results-link" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}`} target="_blank" rel="noopener noreferrer">Open directions ↗</a>
              <p className="help">Pin uses catalogue coordinates; please check the address before travelling. Map © OpenStreetMap contributors. If the map does not load, use Open directions.</p>
            </> : <p className="results-warning">Map unavailable: coordinates have not been supplied or are invalid. Check the business website for location details.</p>}
          </> : null}
        </div>
      </td>
    </tr>
  </>;
}
