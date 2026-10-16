import { isDatabaseConfigured } from "@/lib/db";
import { loadItemTypes } from "@/lib/admin/item-ref-data";
import { DbUnavailable } from "../../components/db-unavailable";
import { ItemForm } from "../item-form";

export const metadata = {
  title: "Add Item | Admin",
};

export default async function NewItemPage() {
  if (!isDatabaseConfigured()) {
    return <DbUnavailable />;
  }

  const itemTypes = await loadItemTypes();

  return (
    <div className="py-2">
      <ItemForm itemTypes={itemTypes} />
    </div>
  );
}
