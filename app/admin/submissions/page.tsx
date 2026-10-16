import { listParamsFromSearch, loadSubmissionsList } from "@/lib/admin/entities";
import { isDatabaseConfigured } from "@/lib/db";

import { AdminEntityPage } from "../components/admin-entity-page";
import { DbUnavailable } from "../components/db-unavailable";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSubmissionsPage({ searchParams }: PageProps) {
  if (!isDatabaseConfigured()) {
    return <DbUnavailable />;
  }

  const params = listParamsFromSearch(await searchParams);
  const result = await loadSubmissionsList(params);

  return (
    <AdminEntityPage
      glossaryLabel="Submissions"
      tableName="submissions"
      basePath="/admin/submissions"
      result={result}
    />
  );
}
