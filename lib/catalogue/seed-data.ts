/**
 * Synthetic Auckland catalogue for demos. Labelled in the UI/README as sample data,
 * shaped like council directory + community sources (not pasted live scrapes).
 */

export type SeedItem = {
  externalId: string;
  title: string;
  keywords: string[];
  hazardAlert?: string;
  disposalGuidance: string;
  slug: string;
};

export type SeedBusiness = {
  externalId: string;
  name: string;
  description: string;
  businessType: string;
  streetAddress: string;
  suburb: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  dropOff: boolean;
  dropOffNotes?: string;
  chargesForDropOff?: string;
  openingHours?: string;
  sourceUrl: string;
};

export type SeedBusinessItem = {
  itemExternalId: string;
  businessExternalId: string;
  role: "drop_off" | "collection" | "repair" | "reuse";
  notes?: string;
};

export const SEED_ITEMS: SeedItem[] = [
  {
    externalId: "demo-lithium-batteries",
    title: "Lithium batteries (household)",
    keywords: ["battery", "batteries", "lithium", "rechargeable", "aa", "aaa", "power bank"],
    hazardAlert:
      "Do not put lithium batteries in kerbside rubbish or recycling. Tape terminals on loose cells.",
    disposalGuidance:
      "Take to a battery collection point. Many supermarkets and hardware stores accept household batteries during the Auckland pilot.",
    slug: "lithium-batteries-household",
  },
  {
    externalId: "demo-small-appliances",
    title: "Small electrical appliances",
    keywords: ["toaster", "kettle", "iron", "appliance", "electrical", "e-waste", "broken"],
    disposalGuidance:
      "If it still works, offer it for reuse first. Otherwise use an e-waste drop-off — many items contain recoverable metals.",
    slug: "small-electrical-appliances",
  },
  {
    externalId: "demo-clothing-textiles",
    title: "Clothing and textiles",
    keywords: ["clothes", "clothing", "textile", "fabric", "shirt", "jeans", "towel", "linen"],
    disposalGuidance:
      "Good condition: donate or swap. Worn out: textile take-back or charity bags where accepted — not kerbside.",
    slug: "clothing-textiles",
  },
  {
    externalId: "demo-furniture",
    title: "Household furniture",
    keywords: ["furniture", "chair", "table", "desk", "sofa", "couch", "wood"],
    disposalGuidance:
      "List for reuse or contact a community recycling centre. Large items may need inorganic booking through Council.",
    slug: "household-furniture",
  },
  {
    externalId: "demo-mobile-phones",
    title: "Mobile phones and tablets",
    keywords: ["phone", "mobile", "cellphone", "iphone", "android", "tablet", "ipad"],
    disposalGuidance:
      "Wipe your data, then drop off at an e-waste collection point or trade-in programme.",
    slug: "mobile-phones-tablets",
  },
];

export const SEED_BUSINESSES: SeedBusiness[] = [
  {
    externalId: "demo-repair-cafe-central",
    name: "Repair Café Auckland Central (demo)",
    description:
      "Community repair sessions for small electrical items and textiles — sample listing for EasyRe.",
    businessType: "Repair café",
    streetAddress: "22 Wellesley Street West",
    suburb: "Auckland CBD",
    latitude: -36.8509,
    longitude: 174.7645,
    website: "https://www.repairnetworkaotearoa.org.nz/local-repair-cafes",
    dropOff: false,
    openingHours: "Monthly pop-up — check Repair Network Aotearoa for dates.",
    sourceUrl: "https://www.repairnetworkaotearoa.org.nz/local-repair-cafes",
  },
  {
    externalId: "demo-constellation-rrc",
    name: "Constellation Drive Resource Recovery Centre (demo)",
    description:
      "Public resource recovery centre accepting household items and materials — sample operator listing.",
    businessType: "Resource recovery centre",
    streetAddress: "20 Constellation Drive",
    suburb: "Rosedale",
    latitude: -36.7512,
    longitude: 174.7018,
    phone: "09 426 3344",
    website: "https://environz.co.nz/facilities/constellation-drive-resource-recovery-centre",
    dropOff: true,
    dropOffNotes: "Fees may apply by material type.",
    chargesForDropOff: "See operator price list",
    openingHours: "Mon–Sun 7:00am–5:00pm (check operator for public holidays)",
    sourceUrl: "https://environz.co.nz/facilities/constellation-drive-resource-recovery-centre",
  },
  {
    externalId: "demo-techcollect-auckland",
    name: "TechCollect e-waste drop-off (demo)",
    description:
      "Scheme collection point for televisions, computers and related e-waste — sample listing.",
    businessType: "E-waste scheme",
    streetAddress: "Participating retailers — Auckland region",
    suburb: "Auckland",
    latitude: -36.8485,
    longitude: 174.7633,
    website: "https://www.techcollect.nz/recycle",
    dropOff: true,
    dropOffNotes: "Free for eligible scheme products at participating sites.",
    sourceUrl: "https://www.techcollect.nz/recycle",
  },
];

export const SEED_BUSINESS_ITEMS: SeedBusinessItem[] = [
  {
    itemExternalId: "demo-small-appliances",
    businessExternalId: "demo-repair-cafe-central",
    role: "repair",
    notes: "Bring power cord and describe the fault.",
  },
  {
    itemExternalId: "demo-clothing-textiles",
    businessExternalId: "demo-repair-cafe-central",
    role: "repair",
    notes: "Simple mending and alterations when volunteers are available.",
  },
  {
    itemExternalId: "demo-furniture",
    businessExternalId: "demo-constellation-rrc",
    role: "drop_off",
  },
  {
    itemExternalId: "demo-small-appliances",
    businessExternalId: "demo-constellation-rrc",
    role: "drop_off",
  },
  {
    itemExternalId: "demo-lithium-batteries",
    businessExternalId: "demo-constellation-rrc",
    role: "drop_off",
    notes: "Ask staff where household batteries are accepted on site.",
  },
  {
    itemExternalId: "demo-mobile-phones",
    businessExternalId: "demo-techcollect-auckland",
    role: "drop_off",
  },
  {
    itemExternalId: "demo-small-appliances",
    businessExternalId: "demo-techcollect-auckland",
    role: "drop_off",
  },
];
