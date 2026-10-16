import { listParamsFromSearch, loadItemsList } from "@/lib/admin/entities";
import { isDatabaseConfigured } from "@/lib/db";

import { AdminEntityPage } from "../components/admin-entity-page";
import { DbUnavailable } from "../components/db-unavailable";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminItemsPage({ searchParams }: PageProps) {
  if (!isDatabaseConfigured()) {
    return <DbUnavailable />;
  }

  const params = listParamsFromSearch(await searchParams);
  const result = await loadItemsList(params);

  return (
    <AdminEntityPage
      glossaryLabel="Items"
      tableName="items"
      basePath="/admin/items"
      result={result}
    />
  );
}
