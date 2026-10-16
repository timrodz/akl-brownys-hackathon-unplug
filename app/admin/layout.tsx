import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ADMIN_ENTITIES } from "@/lib/admin/entities";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <div className="site-shell">
        <header className="border-b border-border py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <Link href="/admin" className="text-xl font-bold tracking-tight">
                EasyRe admin
              </Link>
              <p className="text-sm text-muted-foreground">
                Read-only database inspection
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/admin" />}
              >
                ← All tables
              </Button>
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/" />}
              >
                Resident app
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
          <nav aria-label="Database tables">
            <ul className="flex flex-wrap gap-2">
              {ADMIN_ENTITIES.map((entity) => (
                <li key={entity.slug}>
                  <Button
                    variant="secondary"
                    size="sm"
                    render={<Link href={entity.path} />}
                  >
                    {entity.glossaryLabel}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main id="main" className="py-8">{children}</main>
      </div>
    </div>
  );
}
