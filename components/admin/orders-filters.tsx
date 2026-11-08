import Link from "next/link";
import type { InquiryStatus } from "@/lib/schemas/inquiry";

const STATUSES: Array<InquiryStatus | "all"> = [
  "all",
  "pending",
  "quoted",
  "fulfilled",
  "cancelled",
];

export function OrdersFilters({
  status,
  from,
  to,
}: {
  status: InquiryStatus | "all";
  from: string;
  to: string;
}) {
  function hrefFor(nextStatus: InquiryStatus | "all") {
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const query = params.toString();
    return query ? `/admin/inquiries?${query}` : "/admin/inquiries";
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((item) => (
          <Link
            key={item}
            href={hrefFor(item)}
            className={`rounded-full px-3 py-1.5 font-heading text-sm ${
              status === item ? "bg-boo-ink text-white" : "bg-white ring-1 ring-foreground/10"
            }`}
          >
            {item}
          </Link>
        ))}
      </div>
      <form method="get" action="/admin/inquiries" className="flex flex-wrap items-end gap-3 rounded-[1.4rem] bg-white p-4 ring-1 ring-foreground/10">
        {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">From</span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="h-10 rounded-xl border border-input bg-transparent px-3 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">To</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="h-10 rounded-xl border border-input bg-transparent px-3 text-sm"
          />
        </label>
        <button type="submit" className="h-10 rounded-full bg-oxford px-4 font-heading text-sm text-white">
          Filter dates
        </button>
        {from || to ? (
          <Link href={status === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${status}`} className="h-10 px-2 font-heading text-sm leading-10 text-boo-teal">
            Clear dates
          </Link>
        ) : null}
      </form>
    </div>
  );
}
