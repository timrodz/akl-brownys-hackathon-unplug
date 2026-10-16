import type { ReactNode } from "react";

export function PublicResultsShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="/">Unplug</a>
      </header>
      <main id="main" className="results-page">
        <a href="/" className="results-link">← Change your item</a>
        <h1 className="results-title">A next life starts here.</h1>
        <p className="card-description">
          Your options for reuse, repair and recycling.
        </p>
        {children}
      </main>
    </div>
  );
}
