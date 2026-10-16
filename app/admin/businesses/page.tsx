import { listParamsFromSearch, loadBusinessesList } from "@/lib/admin/entities";
import { isDatabaseConfigured } from "@/lib/db";

import { AdminEntityPage } from "../components/admin-entity-page";
import { DbUnavailable } from "../components/db-unavailable";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminBusinessesPage({ searchParams }: PageProps) {
  if (!isDatabaseConfigured()) {
    return <DbUnavailable />;
  }

  const params = listParamsFromSearch(await searchParams);
  const result = await loadBusinessesList(params);

  return (
    <AdminEntityPage
      glossaryLabel="Businesses"
      tableName="businesses"
      basePath="/admin/businesses"
      result={result}
    />
  );
}
