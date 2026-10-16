import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DbUnavailable() {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle>Database not configured</CardTitle>
        <CardDescription>
          Set <code className="text-foreground">DATABASE_URL</code>, start Postgres with{" "}
          <code className="text-foreground">bun db:up</code>, then run{" "}
          <code className="text-foreground">bun db:setup</code>.
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
