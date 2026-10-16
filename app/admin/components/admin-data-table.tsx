import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminListResult } from "@/lib/admin/entities";
import { formatAdminCell } from "@/lib/admin/format";
import { adminLinkForColumn } from "@/lib/admin/fk-links";
import { cn } from "@/lib/utils";

type Props = {
  result: AdminListResult;
  rowActionHref?: (row: Record<string, unknown>) => string;
};

export function AdminDataTable({ result, rowActionHref }: Props) {
  const { rows, columns, filterId } = result;

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {filterId ? "No rows match this id filter." : "No rows yet."}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {rowActionHref && <TableHead className="font-mono text-xs w-[80px]">Actions</TableHead>}
          {columns.map((column) => (
            <TableHead key={column} className="font-mono text-xs">
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => {
          const rowId = row.id != null ? String(row.id) : String(index);
          const highlighted = filterId && row.id === filterId;
          return (
            <TableRow key={rowId} data-state={highlighted ? "selected" : undefined}>
              {rowActionHref && (
                <TableCell className="align-top py-2">
                  <Link
                    href={rowActionHref(row)}
                    className="inline-flex items-center justify-center rounded px-2 py-1 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Edit
                  </Link>
                </TableCell>
              )}
              {columns.map((column) => {
                const value = row[column];
                const href = adminLinkForColumn(column, value);
                const { display, full } = formatAdminCell(value);
                return (
                  <TableCell
                    key={column}
                    title={full}
                    className="max-w-[280px] whitespace-normal break-all align-top font-mono text-xs"
                  >
                    {href ? (
                      <Link
                        href={href}
                        className={cn(
                          buttonVariants({ variant: "link", size: "sm" }),
                          "h-auto p-0 font-mono text-xs",
                        )}
                      >
                        {display}
                      </Link>
                    ) : (
                      display
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
