"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businesses, dataSourceEnum } from "@/lib/db/schema";

type DataSource = (typeof dataSourceEnum.enumValues)[number];

export async function createBusiness(formData: FormData) {
  if (!db) {
    throw new Error("Database is not configured");
  }

  const name = String(formData.get("name") || "").trim();
  const source = String(formData.get("source") || "manual") as DataSource;
  let externalId = String(formData.get("externalId") || "").trim();
  if (!externalId) {
    externalId = `B-${Date.now().toString().slice(-6)}`;
  }

  const businessType = String(formData.get("businessType") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const streetAddress = String(formData.get("streetAddress") || "").trim() || null;
  const suburb = String(formData.get("suburb") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const website = String(formData.get("website") || "").trim() || null;
  const openingHours = String(formData.get("openingHours") || "").trim() || null;
  const chargesForDropOff = String(formData.get("chargesForDropOff") || "").trim() || null;
  const dropOffNotes = String(formData.get("dropOffNotes") || "").trim() || null;

  const latRaw = formData.get("latitude");
  const lngRaw = formData.get("longitude");
  const latitude = latRaw ? Number.parseFloat(String(latRaw)) : null;
  const longitude = lngRaw ? Number.parseFloat(String(lngRaw)) : null;

  const acceptsHousehold = formData.get("acceptsHousehold") === "true";
  const acceptsCommercial = formData.get("acceptsCommercial") === "true";
  const dropOff = formData.get("dropOff") === "true";
  const offersCollection = formData.get("offersCollection") === "true";

  if (!name) {
    throw new Error("Business name is required");
  }

  await db.insert(businesses).values({
    source,
    externalId,
    name,
    description,
    businessType,
    streetAddress,
    suburb,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    phone,
    email,
    website,
    dropOff,
    dropOffNotes,
    chargesForDropOff,
    acceptsHousehold,
    acceptsCommercial,
    offersCollection,
    openingHours,
    sourceUrl: website || "https://auckland-unplugged.nz",
  });

  revalidatePath("/admin/businesses");
  redirect("/admin/businesses");
}

export async function updateBusiness(id: string, formData: FormData) {
  if (!db) {
    throw new Error("Database is not configured");
  }

  const name = String(formData.get("name") || "").trim();
  const source = String(formData.get("source") || "manual") as DataSource;
  const externalId = String(formData.get("externalId") || "").trim();
  const businessType = String(formData.get("businessType") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const streetAddress = String(formData.get("streetAddress") || "").trim() || null;
  const suburb = String(formData.get("suburb") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const website = String(formData.get("website") || "").trim() || null;
  const openingHours = String(formData.get("openingHours") || "").trim() || null;
  const chargesForDropOff = String(formData.get("chargesForDropOff") || "").trim() || null;
  const dropOffNotes = String(formData.get("dropOffNotes") || "").trim() || null;

  const latRaw = formData.get("latitude");
  const lngRaw = formData.get("longitude");
  const latitude = latRaw ? Number.parseFloat(String(latRaw)) : null;
  const longitude = lngRaw ? Number.parseFloat(String(lngRaw)) : null;

  const acceptsHousehold = formData.get("acceptsHousehold") === "true";
  const acceptsCommercial = formData.get("acceptsCommercial") === "true";
  const dropOff = formData.get("dropOff") === "true";
  const offersCollection = formData.get("offersCollection") === "true";

  if (!name) {
    throw new Error("Business name is required");
  }

  await db
    .update(businesses)
    .set({
      name,
      source,
      ...(externalId ? { externalId } : {}),
      description,
      businessType,
      streetAddress,
      suburb,
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      phone,
      email,
      website,
      dropOff,
      dropOffNotes,
      chargesForDropOff,
      acceptsHousehold,
      acceptsCommercial,
      offersCollection,
      openingHours,
      sourceUrl: website || undefined,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, id));

  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${id}`);
  redirect("/admin/businesses");
}

export async function deleteBusiness(id: string) {
  if (!db) {
    throw new Error("Database is not configured");
  }

  await db.delete(businesses).where(eq(businesses.id, id));

  revalidatePath("/admin/businesses");
  redirect("/admin/businesses");
}
