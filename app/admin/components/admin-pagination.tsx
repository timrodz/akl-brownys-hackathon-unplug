import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { AdminListResult } from "@/lib/admin/entities";

type Props = {
  result: AdminListResult;
  basePath: string;
};

function pageHref(basePath: string, page: number, filterId?: string): string {
  const params = new URLSearchParams();
  if (page > 1) {
    params.set("page", String(page));
  }
  if (filterId) {
    params.set("id", filterId);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function AdminPagination({ result, basePath }: Props) {
  const { page, totalPages, totalRows, showingFrom, showingTo, filterId } = result;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {showingFrom}–{showingTo} of {totalRows}
        {filterId ? (
          <>
            {" "}
            · filtered by id{" "}
            <Link href={basePath} className="text-primary underline-offset-4 hover:underline">
              clear filter
            </Link>
          </>
        ) : null}
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-2">
        {page > 1 ? (
          <Button
            variant="outline"
            size="sm"
            render={<Link href={pageHref(basePath, page - 1, filterId)} />}
          >
            Previous
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
        <span className="px-2 text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Button
            variant="outline"
            size="sm"
            render={<Link href={pageHref(basePath, page + 1, filterId)} />}
          >
            Next
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </nav>
    </div>
  );
}
