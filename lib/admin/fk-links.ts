/** Admin list paths for foreign-key columns (database column name → route). */
export const ADMIN_FK_LINKS: Record<string, string> = {
  submission_id: "/admin/submissions",
  submissionId: "/admin/submissions",
  item_id: "/admin/items",
  itemId: "/admin/items",
  business_id: "/admin/businesses",
  businessId: "/admin/businesses",
};

export function adminLinkForColumn(
  columnKey: string,
  value: unknown,
): string | undefined {
  const base = ADMIN_FK_LINKS[columnKey];
  if (!base || value == null) {
    return undefined;
  }
  const id = String(value);
  return `${base}?id=${encodeURIComponent(id)}`;
}
