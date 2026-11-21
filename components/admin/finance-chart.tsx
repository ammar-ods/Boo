import { formatEgp } from "@/lib/finance";

export function FinanceChart({
  points,
}: {
  points: { key: string; label: string; revenue: number; profit: number }[];
}) {
  const max = Math.max(1, ...points.map((item) => item.revenue));
  return (
    <div className="rounded-[1.8rem] bg-white p-6 ring-1 ring-oxford/8 sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-oxford/40 uppercase">Sales over time</p>
          <h2 className="mt-1 font-heading text-2xl text-oxford">Revenue by month</h2>
        </div>
        <p className="text-xs text-oxford/45">Last {points.length} months</p>
      </div>
      <div className="mt-8 flex h-48 items-end gap-2 sm:h-56 sm:gap-3">
        {points.map((item) => (
          <div key={item.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end sm:h-44">
              <div
                className="mx-auto w-full max-w-10 rounded-t-xl bg-oxford/90 sm:max-w-12"
                style={{ height: `${Math.max(4, Math.round((item.revenue / max) * 100))}%` }}
                title={`${item.label}: ${formatEgp(item.revenue)}`}
              />
            </div>
            <p className="text-[10px] font-semibold tracking-[0.08em] text-oxford/45 uppercase">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
