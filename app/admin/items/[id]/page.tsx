import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { items, businessItems, businesses } from "@/lib/db/schema";
import { loadItemTypes } from "@/lib/admin/item-ref-data";
import { DbUnavailable } from "../../components/db-unavailable";
import { ItemForm } from "../item-form";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Edit Item ${id.slice(0, 8)} | Admin`,
  };
}

export default async function EditItemPage({ params }: PageProps) {
  if (!isDatabaseConfigured() || !db) {
    return <DbUnavailable />;
  }

  const { id } = await params;

  const [item] = await db
    .select()
    .from(items)
    .where(eq(items.id, id))
    .limit(1);

  if (!item) {
    notFound();
  }

  const itemTypes = await loadItemTypes();

  // Find businesses accepting this item
  const acceptingBusinesses = await db
    .select({
      linkId: businessItems.id,
      role: businessItems.role,
      businessName: businesses.name,
      businessId: businesses.id,
      suburb: businesses.suburb,
    })
    .from(businessItems)
    .innerJoin(businesses, eq(businessItems.businessId, businesses.id))
    .where(eq(businessItems.itemId, item.id));

  return (
    <div className="py-2 space-y-6">
      <ItemForm
        itemTypes={itemTypes}
        initialData={{
          id: item.id,
          source: item.source,
          externalId: item.externalId,
          title: item.title,
          keywords: item.keywords,
          hazardAlert: item.hazardAlert,
          disposalGuidance: item.disposalGuidance,
          slug: item.slug,
        }}
      />

      {/* Facilities that accept this item */}
      <div className="mx-auto max-w-3xl bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground">
              Drop-off & Repair Locations ({acceptingBusinesses.length})
            </h4>
            <p className="text-xs text-muted-foreground">
              Facilities across Auckland configured to accept or service this item.
            </p>
          </div>
          <Link
            href={`/admin/business-items?itemId=${item.id}`}
            className="text-xs text-primary hover:underline font-medium"
          >
            Manage in Business Items →
          </Link>
        </div>

        {acceptingBusinesses.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No drop-off locations currently mapped to this item.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {acceptingBusinesses.slice(0, 10).map((b) => (
              <div
                key={b.linkId}
                className="flex items-center justify-between p-2.5 rounded-md border bg-secondary/50 text-xs"
              >
                <div className="truncate mr-2">
                  <Link
                    href={`/admin/businesses/${b.businessId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {b.businessName}
                  </Link>
                  {b.suburb && <span className="text-muted-foreground ml-1">({b.suburb})</span>}
                </div>
                {b.role && (
                  <Badge variant="outline" className="text-[10px] uppercase font-mono shrink-0">
                    {b.role}
                  </Badge>
                )}
              </div>
            ))}
            {acceptingBusinesses.length > 10 && (
              <div className="col-span-full text-center text-xs text-muted-foreground pt-1">
                + {acceptingBusinesses.length - 10} more locations
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
