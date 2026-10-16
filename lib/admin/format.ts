const TRUNCATE_LENGTH = 120;

export function truncateText(
  value: string | null | undefined,
  max = TRUNCATE_LENGTH,
): { display: string; full?: string } {
  if (value == null || value === "") {
    return { display: "—" };
  }
  if (value.length <= max) {
    return { display: value };
  }
  return { display: `${value.slice(0, max)}…`, full: value };
}

export function formatAdminCell(value: unknown): { display: string; full?: string } {
  if (value === null || value === undefined) {
    return { display: "—" };
  }
  if (typeof value === "boolean") {
    return { display: value ? "yes" : "no" };
  }
  if (value instanceof Date) {
    return { display: value.toISOString() };
  }
  if (Array.isArray(value)) {
    const joined = value.map(String).join(", ");
    return truncateText(joined);
  }
  if (typeof value === "object") {
    return truncateText(JSON.stringify(value));
  }
  if (typeof value === "number") {
    return { display: String(value) };
  }
  return truncateText(String(value));
}
