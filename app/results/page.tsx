"use client";
import { useEffect, useState } from "react";
import { SubmissionResults } from "@/app/components/submission-results";
import type { SubmissionSuccessResponse } from "@/lib/submissions/types";
export default function ResultsPage() {
 const [result,setResult]=useState<SubmissionSuccessResponse|null>(null);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const stored=sessionStorage.getItem("unplug-results");if(stored)setResult(JSON.parse(stored));}catch{}finally{setLoaded(true);}},[]);
 return <div className="site-shell"><header className="site-header"><a className="wordmark" href="/">Unplug</a></header><main id="main" className="results-page"><a href="/" className="results-link">← Change your item</a><h1 className="results-title">A next life starts here.</h1><p className="card-description">Your top options for reuse, repair and recycling.</p>{result?<SubmissionResults result={result}/>:loaded?<section className="form-card"><span className="pill">Draft layout · illustrative rows</span><h2>Your options</h2><p className="help">These are placeholders, not business recommendations. Submit an item to see catalogue matches.</p><div className="results-table-wrap"><table className="results-table"><thead><tr><th>Rank</th><th>Business name</th><th>Distance from you</th><th>Telephone</th></tr></thead><tbody>{[1,2,3].map(rank=><tr key={rank}><td><span className="rank-number">{rank}</span></td><td>Business {rank} — placeholder</td><td>Not calculated</td><td>Not supplied</td></tr>)}</tbody></table></div><a href="/" className="results-link">Find options for your item →</a></section>:<p role="status">Loading your options…</p>}</main></div>;
}
