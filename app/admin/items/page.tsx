import Link from "next/link";
import { asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { items, itemTypes } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DbUnavailable } from "../components/db-unavailable";
import { loadItemTypes } from "@/lib/admin/item-ref-data";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE = 15;

export const metadata = {
  title: "Items Catalogue | EasyRe Admin",
};

export default async function AdminItemsPage({ searchParams }: PageProps) {
  if (!isDatabaseConfigured() || !db) {
    return <DbUnavailable />;
  }

  const sParams = await searchParams;
  const page = Math.max(1, Number.parseInt(String(sParams.page || "1"), 10) || 1);
  const q = String(sParams.q || "").trim();

  // Load master reference categories
  const masterCategories = await loadItemTypes();
  const categoryMap = new Map(masterCategories.map((c) => [c.name.toLowerCase(), c.name]));

  // Build query filter
  const filter = q
    ? or(
        ilike(items.title, `%${q}%`),
        ilike(items.disposalGuidance, `%${q}%`),
        sql`array_to_string(${items.keywords}, ' ') ILIKE ${`%${q}%`}`,
      )
    : undefined;

  // Count total rows
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(items)
    .where(filter);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;

  // Fetch paginated rows
  const rows = await db
    .select()
    .from(items)
    .where(filter)
    .orderBy(asc(items.title))
    .limit(PAGE_SIZE)
    .offset(offset);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Items Catalogue
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  {count} {count === 1 ? "item" : "items"}
                </Badge>
              </div>
              <CardDescription>
                Manage recyclable, repairable, and hazardous materials catalogued for Auckland residents.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Button size="default" className="font-medium" render={<Link href="/admin/items/new" />}>
                + Add New Item
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <form method="get" className="mt-4 flex gap-2 max-w-md">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search items by name, category or keyword..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
            {q && (
              <Link
                href="/admin/items"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-accent"
              >
                Clear
              </Link>
            )}
          </form>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4 w-[240px]">Item Title</th>
                  <th className="py-3 px-4 w-[180px]">Master Category</th>
                  <th className="py-3 px-4 w-[220px]">Hazard Warning</th>
                  <th className="py-3 px-4">Disposal & Circular Guidance</th>
                  <th className="py-3 px-4 w-[160px]">Search Keywords</th>
                  <th className="py-3 px-4 w-[100px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      {q ? `No items found matching "${q}".` : "No items catalogued yet."}
                    </td>
                  </tr>
                ) : (
                  rows.map((item) => {
                    // Match category from master table
                    const matchedCategory =
                      masterCategories.find((cat) =>
                        item.keywords?.some((k) => k.toLowerCase() === cat.name.toLowerCase()),
                      )?.name || null;

                    return (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        {/* Item Title */}
                        <td className="py-3.5 px-4 align-top">
                          <Link
                            href={`/admin/items/${item.id}`}
                            className="font-semibold text-sm text-foreground hover:text-primary transition-colors hover:underline"
                          >
                            {item.title}
                          </Link>
                          {item.externalId && (
                            <span className="block text-[11px] font-mono text-muted-foreground mt-0.5">
                              Code: {item.externalId}
                            </span>
                          )}
                        </td>

                        {/* Master Category (from master item_types table) */}
                        <td className="py-3.5 px-4 align-top">
                          {matchedCategory ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                              {matchedCategory}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">General</span>
                          )}
                        </td>

                        {/* Hazard Warning */}
                        <td className="py-3.5 px-4 align-top">
                          {item.hazardAlert ? (
                            <div className="inline-flex items-start gap-1.5 p-1.5 rounded-md text-xs bg-amber-500/10 text-amber-900 border border-amber-500/30">
                              <span className="font-bold text-amber-700">⚠️</span>
                              <span className="leading-tight text-[11px] font-medium">
                                {item.hazardAlert}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
                              <span>✓</span> Safe / Standard
                            </span>
                          )}
                        </td>

                        {/* Disposal & Circular Guidance */}
                        <td className="py-3.5 px-4 align-top text-xs leading-relaxed text-foreground/90 max-w-[340px]">
                          {item.disposalGuidance || (
                            <span className="text-muted-foreground italic">No specific guidance</span>
                          )}
                        </td>

                        {/* Keywords (Pills) */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {item.keywords?.slice(0, 3).map((kw, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-accent/60 text-accent-foreground font-mono"
                              >
                                {kw}
                              </span>
                            ))}
                            {(item.keywords?.length || 0) > 3 && (
                              <span className="text-[10px] text-muted-foreground font-mono self-center">
                                +{(item.keywords?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions: Edit & Delete */}
                        <td className="py-3.5 px-4 align-top text-right">
                          <Link
                            href={`/admin/items/${item.id}`}
                            className="inline-flex items-center justify-center rounded px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t py-3 px-4 bg-muted/10">
            <span className="text-xs text-muted-foreground">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/items?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent"
                >
                  ← Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/items?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent"
                >
                  Next →
                </Link>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
