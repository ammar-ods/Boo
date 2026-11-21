import { FinanceSpendingsPanel } from "@/components/admin/finance-spendings-panel";
import { getFinanceBooks } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountingSpendingsPage() {
  const { doc } = await getFinanceBooks();
  return <FinanceSpendingsPanel doc={doc} />;
}
