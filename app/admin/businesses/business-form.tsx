"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessTypeOption } from "@/lib/admin/business-ref-data";
import { DATA_SOURCE_OPTIONS } from "@/lib/admin/business-ref-data";
import { createBusiness, updateBusiness, deleteBusiness } from "./actions";

type BusinessFormProps = {
  businessTypes: BusinessTypeOption[];
  initialData?: {
    id: string;
    source: string;
    externalId: string;
    name: string;
    description?: string | null;
    businessType?: string | null;
    acceptsHousehold?: boolean | null;
    acceptsCommercial?: boolean | null;
    streetAddress?: string | null;
    suburb?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    dropOff?: boolean | null;
    dropOffNotes?: string | null;
    chargesForDropOff?: string | null;
    offersCollection?: boolean | null;
    openingHours?: string | null;
  };
};

export function BusinessForm({ businessTypes, initialData }: BusinessFormProps) {
  const isEdit = Boolean(initialData?.id);
  const [isDeleting, setIsDeleting] = useState(false);

  const inputStyle =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Card className="mx-auto max-w-4xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isEdit ? `Edit Business: ${initialData?.name}` : "Add New Business"}
            </CardTitle>
            <CardDescription className="mt-1">
              {isEdit
                ? "Update business information and accepted service options."
                : "Add a new reuse centre, transfer station, repair cafe, or drop-off location."}
            </CardDescription>
          </div>
          <Link
            href="/admin/businesses"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            ← Back to List
          </Link>
        </div>
      </CardHeader>

      <form action={isEdit ? updateBusiness.bind(null, initialData!.id) : createBusiness}>
        <CardContent className="space-y-6">
          {/* Section 1: Core Details */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 pb-1 border-b">
              1. Business Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Business Name <span className="text-destructive">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Tāmaki Zero Waste Hub"
                  defaultValue={initialData?.name || ""}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  External ID / Code
                </label>
                <input
                  name="externalId"
                  type="text"
                  placeholder="e.g. B0350 (auto-generated if empty)"
                  defaultValue={initialData?.externalId || ""}
                  className={inputStyle}
                />
              </div>

              {/* Reference Dropdown: Business Type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Business Type (Reference Dropdown) <span className="text-destructive">*</span>
                </label>
                <select
                  name="businessType"
                  required
                  defaultValue={initialData?.businessType || ""}
                  className={inputStyle}
                >
                  <option value="">-- Select Business Type --</option>
                  {businessTypes.map((bt) => (
                    <option key={bt.id} value={bt.name}>
                      {bt.name} {bt.description ? `— ${bt.description.slice(0, 45)}...` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Dropdown: Data Source */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Data Source (Reference Dropdown) <span className="text-destructive">*</span>
                </label>
                <select
                  name="source"
                  required
                  defaultValue={initialData?.source || "manual"}
                  className={inputStyle}
                >
                  {DATA_SOURCE_OPTIONS.map((src) => (
                    <option key={src.value} value={src.value}>
                      {src.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Location & Contact */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 pb-1 border-b">
              2. Location & Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Street Address
                </label>
                <input
                  name="streetAddress"
                  type="text"
                  placeholder="e.g. 153 Pilkington Road"
                  defaultValue={initialData?.streetAddress || ""}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Suburb
                </label>
                <input
                  name="suburb"
                  type="text"
                  placeholder="e.g. Point England"
                  defaultValue={initialData?.suburb || ""}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="text"
                  placeholder="e.g. 09 421 9111"
                  defaultValue={initialData?.phone || ""}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="e.g. contact@hub.nz"
                  defaultValue={initialData?.email || ""}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Website URL
                </label>
                <input
                  name="website"
                  type="url"
                  placeholder="e.g. https://tamakizerowastehub.nz"
                  defaultValue={initialData?.website || ""}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Latitude (WGS84)
                </label>
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g. -36.8880836"
                  defaultValue={initialData?.latitude ?? ""}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Longitude (WGS84)
                </label>
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 174.8570329"
                  defaultValue={initialData?.longitude ?? ""}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operations & Acceptance */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 pb-1 border-b">
              3. Service & Acceptance Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Accepts Drop-Off?
                </label>
                <select
                  name="dropOff"
                  defaultValue={initialData?.dropOff === false ? "false" : "true"}
                  className={inputStyle}
                >
                  <option value="true">Yes — Drop-off accepted</option>
                  <option value="false">No — No public drop-off</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Offers Collection?
                </label>
                <select
                  name="offersCollection"
                  defaultValue={initialData?.offersCollection ? "true" : "false"}
                  className={inputStyle}
                >
                  <option value="false">No — Drop-off only</option>
                  <option value="true">Yes — Pick-up / collection available</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Accepts Household Items?
                </label>
                <select
                  name="acceptsHousehold"
                  defaultValue={initialData?.acceptsHousehold === false ? "false" : "true"}
                  className={inputStyle}
                >
                  <option value="true">Yes — Accepts household items</option>
                  <option value="false">No — Commercial only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Accepts Commercial / Trade?
                </label>
                <select
                  name="acceptsCommercial"
                  defaultValue={initialData?.acceptsCommercial ? "true" : "false"}
                  className={inputStyle}
                >
                  <option value="false">No — Household only</option>
                  <option value="true">Yes — Accepts commercial items</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Drop-Off Fees / Cost
                </label>
                <input
                  name="chargesForDropOff"
                  type="text"
                  placeholder="e.g. Free, Koha, $5 per item"
                  defaultValue={initialData?.chargesForDropOff || ""}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Opening Hours
                </label>
                <input
                  name="openingHours"
                  type="text"
                  placeholder="e.g. Thursday to Saturday: 9am to 3pm"
                  defaultValue={initialData?.openingHours || ""}
                  className={inputStyle}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Description / Service Details
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="e.g. Community zero-waste hub with reuse shop and electronic drop-off."
                  defaultValue={initialData?.description || ""}
                  className={inputStyle}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Drop-Off Notes / Specific Guidance
                </label>
                <textarea
                  name="dropOffNotes"
                  rows={2}
                  placeholder="e.g. Check in at weighbridge. Tape battery terminals."
                  defaultValue={initialData?.dropOffNotes || ""}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <Button type="submit" size="default">
              {isEdit ? "Save Changes" : "Create Business"}
            </Button>
            <Link
              href="/admin/businesses"
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Link>
          </div>

          {isEdit && (
            <div>
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive font-medium">Are you sure?</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      await deleteBusiness(initialData!.id);
                    }}
                  >
                    Yes, Delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleting(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleting(true)}
                >
                  Delete Business
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
