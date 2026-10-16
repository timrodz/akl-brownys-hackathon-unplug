import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ADMIN_ENTITIES } from "@/lib/admin/entities";
import { isDatabaseConfigured } from "@/lib/db";

import { DbUnavailable } from "./components/db-unavailable";

export default function AdminHomePage() {
  const dbReady = isDatabaseConfigured();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Database tables</h1>
        <p className="max-w-2xl text-muted-foreground">
          Inspect persisted submissions, catalogue items, businesses, and pipeline
          rows after testing the resident flow.
        </p>
      </div>

      {!dbReady ? <DbUnavailable /> : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_ENTITIES.map((entity) => (
          <li key={entity.slug}>
            <Link href={entity.path} className="block h-full">
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle className="text-base">
                    {entity.glossaryLabel}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="font-mono">
                      {entity.title}
                    </Badge>
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
