import { isDatabaseConfigured } from "@/lib/db";
import { loadBusinessTypes } from "@/lib/admin/business-ref-data";
import { DbUnavailable } from "../../components/db-unavailable";
import { BusinessForm } from "../business-form";

export const metadata = {
  title: "Add Business | Admin",
};

export default async function NewBusinessPage() {
  if (!isDatabaseConfigured()) {
    return <DbUnavailable />;
  }

  const businessTypes = await loadBusinessTypes();

  return (
    <div className="py-2">
      <BusinessForm businessTypes={businessTypes} />
    </div>
  );
}
