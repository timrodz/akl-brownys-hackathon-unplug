import { listParamsFromSearch, loadRecommendationsList } from "@/lib/admin/entities";
import { isDatabaseConfigured } from "@/lib/db";

import { AdminEntityPage } from "../components/admin-entity-page";
import { DbUnavailable } from "../components/db-unavailable";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminRecommendationsPage({ searchParams }: PageProps) {
  if (!isDatabaseConfigured()) {
    return <DbUnavailable />;
  }

  const params = listParamsFromSearch(await searchParams);
  const result = await loadRecommendationsList(params);

  return (
    <AdminEntityPage
      glossaryLabel="Recommendations"
      tableName="recommendations"
      basePath="/admin/recommendations"
      result={result}
    />
  );
}
