import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link href="/" className="wordmark">
          Unplug
        </Link>
      </header>
      <main id="main" className="landing">
        <section className="form-card" aria-labelledby="not-found-heading">
          <h2 id="not-found-heading">Page not found</h2>
          <p className="card-description">
            We couldn&rsquo;t find that page. Check the address or start a new search from the home
            page.
          </p>
          <Link href="/" className="results-link">
            ← Back to home
          </Link>
        </section>
      </main>
    </div>
  );
}
