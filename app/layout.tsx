import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "EasyRe — Reuse, Recycle, Repair", description: "Take a photo to find how to Reuse, Recycle, Repair, in 1 minute. EasyRe, easy as." };
export default function RootLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) { return <html lang="en-NZ"><body><a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-white focus:p-3">Skip to content</a>{children}</body></html>; }
