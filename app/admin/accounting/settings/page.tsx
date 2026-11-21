import { FinanceSettingsForm } from "@/components/admin/finance-settings-form";
import { getFinanceBooks } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountingSettingsPage() {
  const { doc, catalog } = await getFinanceBooks();
  return <FinanceSettingsForm doc={doc} products={catalog} />;
}
