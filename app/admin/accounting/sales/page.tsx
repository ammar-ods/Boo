import { FinanceSalesPanel } from "@/components/admin/finance-sales-panel";
import { getFinanceBooks } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountingSalesPage() {
  const { doc, catalog } = await getFinanceBooks();
  return <FinanceSalesPanel doc={doc} products={catalog} />;
}
