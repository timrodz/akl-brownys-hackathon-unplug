import postcodes from "@/data/postcodes/valid-postcodes.json";

const knownPostcodes = new Set(postcodes);
export const POSTCODE_ERROR = "Choose a valid NZ postcode from our postcode data.";

/** Membership in the checked-in source dataset, preserving leading zeroes. */
export function isValidNzPostcode(value: string): boolean {
  return /^\d{4}$/.test(value) && knownPostcodes.has(value);
}
