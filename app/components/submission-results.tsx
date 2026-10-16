import { BusinessResultRow } from "./business-result-row";
import type { SubmissionSuccessResponse } from "@/lib/submissions/types";
export function SubmissionResults({result}:{result:SubmissionSuccessResponse}) {
 const {item,warnings,recommendations}=result;
 if (!item) return <section className="results-panel" aria-labelledby="results-heading">
   <h2 id="results-heading">We could not match your e-waste.</h2>
   <p>Please review the resource below to find the right option.</p>
   <a className="results-link" href="https://www.aucklandcouncil.govt.nz/en/rubbish-recycling/get-rid-unwanted-items.html" target="_blank" rel="noopener noreferrer">How to get rid of unwanted items ↗</a>
 </section>;
 const seen=new Set<string>();
 const businesses=recommendations.filter(rec=>{if(!rec.business||seen.has(rec.business.id))return false;seen.add(rec.business.id);return true;}).slice(0,3);
 const guidance=recommendations.filter(rec=>!rec.business);
 return <section className="results-panel" aria-labelledby="results-heading"><h2 id="results-heading">{item?"Your top options":"We could not match your item"}</h2>{item?<p className="results-match">Catalogue item: <strong>{item.title}</strong> <span className="results-badge">Please check this fits your item</span></p>:null}{item?.hazardAlert?<p className="results-hazard" role="alert">{item.hazardAlert}</p>:null}{warnings.map(warning=><p className="results-warning" key={warning}>{warning}</p>)}<p className="help">Shortlisted from catalogue acceptance links for your item, excluding known household refusals and closed businesses, then ranked by approximate distance. Distances are straight-line estimates, not driving distances.</p>{businesses.length?<div className="results-table-wrap"><table className="results-table"><caption className="sr-only">Top three matched businesses</caption><thead><tr><th scope="col">Rank</th><th scope="col">Business name</th><th scope="col">Distance from you</th><th scope="col">Telephone</th><th scope="col">Cost</th></tr></thead><tbody>{businesses.map((rec,index)=><BusinessResultRow key={rec.business!.id} recommendation={rec} rank={index+1} />)}</tbody></table></div>:<p className="results-warning">{item?"No linked businesses were found for this item in your search area.":"Try a clearer item description. We have not guessed a category."}</p>}{guidance.map(rec=><article className="results-card" key={rec.id}><h3>{rec.title}</h3><p>{rec.body}</p></article>)}<p className="results-meta">Submission saved · reference {result.submissionId.slice(0, 8)}. Up to three distinct businesses shown. Missing contact or location data is labelled.</p></section>;
}
