"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { items, dataSourceEnum } from "@/lib/db/schema";

type DataSource = (typeof dataSourceEnum.enumValues)[number];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createItem(formData: FormData) {
  if (!db) {
    throw new Error("Database is not configured");
  }

  const title = String(formData.get("title") || "").trim();
  const source = (String(formData.get("source") || "manual")) as DataSource;
  let externalId = String(formData.get("externalId") || "").trim();
  if (!externalId) {
    externalId = `IT-${Date.now().toString().slice(-6)}`;
  }

  const categoryName = String(formData.get("categoryName") || "").trim();
  const hazardAlert = String(formData.get("hazardAlert") || "").trim() || null;
  const disposalGuidance = String(formData.get("disposalGuidance") || "").trim() || null;

  const rawKeywords = String(formData.get("keywords") || "").trim();
  const keywordsSet = new Set<string>();
  if (title) keywordsSet.add(title.toLowerCase());
  if (categoryName) keywordsSet.add(categoryName.toLowerCase());
  for (const kw of rawKeywords.split(/[,;\n]+/)) {
    const clean = kw.trim().toLowerCase();
    if (clean.length > 1) keywordsSet.add(clean);
  }

  if (!title) {
    throw new Error("Item title is required");
  }

  await db.insert(items).values({
    source,
    externalId,
    title,
    keywords: Array.from(keywordsSet),
    hazardAlert,
    disposalGuidance,
    slug: slugify(title),
  });

  revalidatePath("/admin/items");
  redirect("/admin/items");
}

export async function updateItem(id: string, formData: FormData) {
  if (!db) {
    throw new Error("Database is not configured");
  }

  const title = String(formData.get("title") || "").trim();
  const source = (String(formData.get("source") || "manual")) as DataSource;
  const externalId = String(formData.get("externalId") || "").trim();
  const categoryName = String(formData.get("categoryName") || "").trim();
  const hazardAlert = String(formData.get("hazardAlert") || "").trim() || null;
  const disposalGuidance = String(formData.get("disposalGuidance") || "").trim() || null;

  const rawKeywords = String(formData.get("keywords") || "").trim();
  const keywordsSet = new Set<string>();
  if (title) keywordsSet.add(title.toLowerCase());
  if (categoryName) keywordsSet.add(categoryName.toLowerCase());
  for (const kw of rawKeywords.split(/[,;\n]+/)) {
    const clean = kw.trim().toLowerCase();
    if (clean.length > 1) keywordsSet.add(clean);
  }

  if (!title) {
    throw new Error("Item title is required");
  }

  await db
    .update(items)
    .set({
      title,
      source,
      ...(externalId ? { externalId } : {}),
      keywords: Array.from(keywordsSet),
      hazardAlert,
      disposalGuidance,
      slug: slugify(title),
      updatedAt: new Date(),
    })
    .where(eq(items.id, id));

  revalidatePath("/admin/items");
  revalidatePath(`/admin/items/${id}`);
  redirect("/admin/items");
}

export async function deleteItem(id: string) {
  if (!db) {
    throw new Error("Database is not configured");
  }

  await db.delete(items).where(eq(items.id, id));

  revalidatePath("/admin/items");
  redirect("/admin/items");
}
