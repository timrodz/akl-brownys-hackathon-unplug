import {
  listParamsFromSearch,
  loadBusinessItemsList,
} from "@/lib/admin/entities";
import { isDatabaseConfigured } from "@/lib/db";

import { AdminEntityPage } from "../components/admin-entity-page";
import { DbUnavailable } from "../components/db-unavailable";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminBusinessItemsPage({
  searchParams,
}: PageProps) {
  if (!isDatabaseConfigured()) {
    return <DbUnavailable />;
  }

  const params = listParamsFromSearch(await searchParams);
  const result = await loadBusinessItemsList(params);

  return (
    <AdminEntityPage
      glossaryLabel="Business items"
      tableName="business_items"
      basePath="/admin/business-items"
      result={result}
    />
  );
}
