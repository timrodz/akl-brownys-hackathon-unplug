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
};

export function AdminEntityPage({
  glossaryLabel,
  tableName,
  basePath,
  result,
}: Props) {
  return (
    <Card className="mx-auto max-w-[1400px]">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {glossaryLabel}
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {tableName}
          </Badge>
          <span>Read-only</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AdminDataTable result={result} />
      </CardContent>
      <CardFooter className="border-t">
        <AdminPagination result={result} basePath={basePath} />
      </CardFooter>
    </Card>
  );
}
