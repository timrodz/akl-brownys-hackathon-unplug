"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DATA_SOURCE_OPTIONS } from "@/lib/admin/data-source-options";
import type { ItemTypeOption } from "@/lib/admin/item-ref-data";
import { createItem, updateItem, deleteItem } from "./actions";

type ItemFormProps = {
  itemTypes: ItemTypeOption[];
  initialData?: {
    id: string;
    source: string;
    externalId: string;
    title: string;
    keywords?: string[] | null;
    hazardAlert?: string | null;
    disposalGuidance?: string | null;
    slug?: string | null;
  };
};

export function ItemForm({ itemTypes, initialData }: ItemFormProps) {
  const isEdit = Boolean(initialData?.id);
  const [isDeleting, setIsDeleting] = useState(false);

  const inputStyle =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  // Try to detect matching category from keywords or guidance
  const defaultCategory = itemTypes.find((it) =>
    initialData?.keywords?.some((k) => k.toLowerCase() === it.name.toLowerCase()),
  )?.name;

  return (
    <Card className="mx-auto max-w-3xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isEdit ? `Edit Item: ${initialData?.title}` : "Add New Item"}
            </CardTitle>
            <CardDescription className="mt-1">
              {isEdit
                ? "Update material classification, hazards, and circular disposal advice."
                : "Add a new recyclable, reusable, or repairable material to the catalogue."}
            </CardDescription>
          </div>
          <Link
            href="/admin/items"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            ← Back to Items
          </Link>
        </div>
      </CardHeader>

      <form action={isEdit ? updateItem.bind(null, initialData!.id) : createItem}>
        <CardContent className="space-y-6">
          {/* Section 1: Item Identification */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 pb-1 border-b">
              1. Item Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Item Title <span className="text-destructive">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Laptop, Mobile phone, Lithium batteries"
                  defaultValue={initialData?.title || ""}
                  className={inputStyle}
                />
              </div>

              {/* Master Reference Dropdown: Item Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Category (Master Reference Dropdown)
                </label>
                <select
                  name="categoryName"
                  defaultValue={defaultCategory || ""}
                  className={inputStyle}
                >
                  <option value="">-- Select Master Category --</option>
                  {itemTypes.map((it) => (
                    <option key={it.id} value={it.name}>
                      {it.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Dropdown: Data Source */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Data Source <span className="text-destructive">*</span>
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Item Code / External ID
                </label>
                <input
                  name="externalId"
                  type="text"
                  placeholder="e.g. IT01 (auto-generated if empty)"
                  defaultValue={initialData?.externalId || ""}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Safety & Circular Guidance */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 pb-1 border-b">
              2. Circular Advice & Safety
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Hazard Alert / Safety Warning (Optional)
                </label>
                <input
                  name="hazardAlert"
                  type="text"
                  placeholder="e.g. Lithium-ion battery: fire risk if damaged. Do not put in kerbside recycling."
                  defaultValue={initialData?.hazardAlert || ""}
                  className={inputStyle}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  If set, this will be highlighted with a safety warning badge in resident
                  recommendations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Disposal, Reuse & Preparation Guidance
                </label>
                <textarea
                  name="disposalGuidance"
                  rows={3}
                  placeholder="e.g. Best next life: Replace battery or upgrade RAM. Preparation: Back up data and factory reset."
                  defaultValue={initialData?.disposalGuidance || ""}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Search Keywords & Synonyms
                </label>
                <input
                  name="keywords"
                  type="text"
                  placeholder="e.g. laptop, macbook, thinkpad, notebook, computer, screen"
                  defaultValue={initialData?.keywords?.join(", ") || ""}
                  className={inputStyle}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Comma-separated terms used by the resident search to match user inquiries.
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <Button type="submit" size="default">
              {isEdit ? "Save Changes" : "Create Item"}
            </Button>
            <Link
              href="/admin/items"
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
                      await deleteItem(initialData!.id);
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
                  Delete Item
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
