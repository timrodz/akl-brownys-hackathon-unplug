import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminListResult } from "@/lib/admin/entities";

import { AdminDataTable } from "./admin-data-table";
import { AdminPagination } from "./admin-pagination";

type Props = {
  glossaryLabel: string;
  tableName: string;
  basePath: string;
  result: AdminListResult;
  headerAction?: React.ReactNode;
  rowActionHref?: (row: Record<string, unknown>) => string;
};

export function AdminEntityPage({
  glossaryLabel,
  tableName,
  basePath,
  result,
  headerAction,
  rowActionHref,
}: Props) {
  return (
    <Card className="mx-auto max-w-[1400px]">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {glossaryLabel}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="font-mono">
                {tableName}
              </Badge>
              {headerAction ? (
                <span className="text-xs text-muted-foreground">Manageable</span>
              ) : (
                <span>Read-only</span>
              )}
            </CardDescription>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <AdminDataTable result={result} rowActionHref={rowActionHref} />
      </CardContent>
      <CardFooter className="border-t">
        <AdminPagination result={result} basePath={basePath} />
      </CardFooter>
    </Card>
  );
}
