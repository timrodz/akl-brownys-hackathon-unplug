import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Reuse, repair & recycling finder",
    template: "%s · Auckland waste finder",
  },
  description:
    "Prototype for Aucklanders to identify reuse, repair, recycling and disposal paths for household items.",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en">
    <body>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-md focus:bg-white focus:p-3 focus:shadow"
      >
        Skip to content
      </a>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 px-5 py-4">
          <p className="text-sm text-muted">Auckland CivicTech Hackathon · Team 5</p>
          <h1 className="text-xl font-semibold tracking-tight">
            Reuse, repair & recycling finder
          </h1>
        </div>
      </header>
      <main id="main">{children}</main>
    </body>
  </html>
);

export default RootLayout;
