"use client";
import { useEffect, useState } from "react";
import { SubmissionResults } from "@/app/components/submission-results";
import type { SubmissionSuccessResponse } from "@/lib/submissions/types";
export default function ResultsPage() {
 const [result,setResult]=useState<SubmissionSuccessResponse|null>(null);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const stored=sessionStorage.getItem("unplug-live-results");if(stored){const parsed=JSON.parse(stored);if(parsed&&typeof parsed.submissionId==="string"&&Array.isArray(parsed.recommendations))setResult(parsed);}}catch{}finally{setLoaded(true);}},[]);
 return <div className="site-shell"><header className="site-header"><a className="wordmark" href="/">Unplug</a></header><main id="main" className="results-page"><a href="/" className="results-link">← Change your item</a><h1 className="results-title">A next life starts here.</h1><p className="card-description">Your options for reuse, repair and recycling.</p>{result?<SubmissionResults result={result}/>:loaded?<section className="form-card"><h2>Find options for your item</h2><p>No submission is selected. Describe an item and enter your postcode to search the database.</p><a href="/" className="results-link">Start a search →</a></section>:<p role="status">Loading your options…</p>}</main></div>;
}
