import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { businesses, businessItems, items } from "@/lib/db/schema";
import { loadBusinessTypes } from "@/lib/admin/business-ref-data";
import { DbUnavailable } from "../../components/db-unavailable";
import { BusinessForm } from "../business-form";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Edit Business ${id.slice(0, 8)} | Admin`,
  };
}

export default async function EditBusinessPage({ params }: PageProps) {
  if (!isDatabaseConfigured() || !db) {
    return <DbUnavailable />;
  }

  const { id } = await params;

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, id))
    .limit(1);

  if (!business) {
    notFound();
  }

  const businessTypes = await loadBusinessTypes();

  // Load associated items for this business
  const acceptedItems = await db
    .select({
      linkId: businessItems.id,
      role: businessItems.role,
      itemTitle: items.title,
      itemSlug: items.slug,
      hazardAlert: items.hazardAlert,
    })
    .from(businessItems)
    .innerJoin(items, eq(businessItems.itemId, items.id))
    .where(eq(businessItems.businessId, business.id));

  return (
    <div className="py-2 space-y-6">
      <BusinessForm
        businessTypes={businessTypes}
        initialData={{
          id: business.id,
          source: business.source,
          externalId: business.externalId,
          name: business.name,
          description: business.description,
          businessType: business.businessType,
          acceptsHousehold: business.acceptsHousehold,
          acceptsCommercial: business.acceptsCommercial,
          streetAddress: business.streetAddress,
          suburb: business.suburb,
          latitude: business.latitude,
          longitude: business.longitude,
          phone: business.phone,
          email: business.email,
          website: business.website,
          dropOff: business.dropOff,
          dropOffNotes: business.dropOffNotes,
          chargesForDropOff: business.chargesForDropOff,
          offersCollection: business.offersCollection,
          openingHours: business.openingHours,
        }}
      />

      {/* Associated Accepted Items */}
      <div className="mx-auto max-w-4xl bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground">
              Accepted Items ({acceptedItems.length})
            </h4>
            <p className="text-xs text-muted-foreground">
              Waste and repair items mapped to this business location.
            </p>
          </div>
          <Link
            href={`/admin/business-items?businessId=${business.id}`}
            className="text-xs text-primary hover:underline font-medium"
          >
            Manage in Business Items →
          </Link>
        </div>

        {acceptedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No items currently mapped to this business.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {acceptedItems.map((item) => (
              <span
                key={item.linkId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border"
              >
                <span>{item.itemTitle}</span>
                {item.role && (
                  <Badge variant="outline" className="text-[10px] uppercase font-mono px-1 py-0">
                    {item.role}
                  </Badge>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
