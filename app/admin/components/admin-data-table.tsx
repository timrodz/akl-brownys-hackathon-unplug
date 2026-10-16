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
};

export function AdminDataTable({ result }: Props) {
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
            <TableRow
              key={rowId}
              data-state={highlighted ? "selected" : undefined}
            >
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
