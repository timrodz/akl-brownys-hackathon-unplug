import { listParamsFromSearch, loadSubmissionItemsList } from "@/lib/admin/entities";
import { isDatabaseConfigured } from "@/lib/db";

import { AdminEntityPage } from "../components/admin-entity-page";
import { DbUnavailable } from "../components/db-unavailable";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSubmissionItemsPage({ searchParams }: PageProps) {
  if (!isDatabaseConfigured()) {
    return <DbUnavailable />;
  }

  const params = listParamsFromSearch(await searchParams);
  const result = await loadSubmissionItemsList(params);

  return (
    <AdminEntityPage
      glossaryLabel="Submission items"
      tableName="submission_items"
      basePath="/admin/submission-items"
      result={result}
    />
  );
}
