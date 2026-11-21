import { FinanceChart } from "@/components/admin/finance-chart";
import { financeSummary, formatEgp, salesByMonth } from "@/lib/finance";
import { getFinanceBooks } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountingDashboardPage() {
  const { doc } = await getFinanceBooks();
  const summary = financeSummary(doc);
  const points = salesByMonth(doc);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <article className="rounded-[1.8rem] bg-oxford p-7 text-white shadow-sm sm:min-h-[11rem] sm:p-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">Free cash</p>
          <p className="mt-4 font-heading text-4xl sm:text-5xl">{formatEgp(summary.freeCash)}</p>
          <p className="mt-3 text-sm text-white/60">
            Starting capital {formatEgp(summary.startingCapital)} · after costs, spendings, and assets
          </p>
        </article>
        <article className="rounded-[1.8rem] bg-white p-7 ring-1 ring-oxford/8 sm:min-h-[11rem] sm:p-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-oxford/40 uppercase">Total revenue</p>
          <p className="mt-4 font-heading text-4xl text-oxford sm:text-5xl">{formatEgp(summary.revenue)}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Profit {formatEgp(summary.profit)} after product cost {formatEgp(summary.cogs)}
          </p>
        </article>
      </div>
      <FinanceChart points={points} />
    </div>
  );
}
