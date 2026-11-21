import { FinanceAssetsPanel } from "@/components/admin/finance-assets-panel";
import { getFinanceBooks } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountingAssetsPage() {
  const { doc } = await getFinanceBooks();
  return <FinanceAssetsPanel doc={doc} />;
}
