export const ADMIN_PAGE_SIZE = 50;

export function parseAdminPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export function parseOptionalUuid(
  raw: string | string[] | undefined,
): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw?.trim();
  if (!value) {
    return undefined;
  }
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    return undefined;
  }
  return value;
}

export function adminPageRange(
  page: number,
  totalRows: number,
  pageSize = ADMIN_PAGE_SIZE,
): { offset: number; totalPages: number; showingFrom: number; showingTo: number } {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;
  const showingFrom = totalRows === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + pageSize, totalRows);
  return { offset, totalPages, showingFrom, showingTo };
}
