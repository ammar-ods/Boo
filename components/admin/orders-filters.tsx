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
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((item) => (
          <Link
            key={item}
            href={hrefFor(item)}
            className={`rounded-full px-4 py-1.5 font-heading text-sm capitalize ${
              status === item ? "bg-oxford text-white" : "bg-white text-oxford ring-1 ring-oxford/10"
            }`}
          >
            {item}
          </Link>
        ))}
      </div>
      <form
        method="get"
        action="/admin/inquiries"
        className="flex flex-wrap items-end gap-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-oxford/8"
      >
        {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
        <label className="min-w-[9rem] flex-1 text-sm">
          <span className="mb-1.5 block text-muted-foreground">From</span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
          />
        </label>
        <label className="min-w-[9rem] flex-1 text-sm">
          <span className="mb-1.5 block text-muted-foreground">To</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
          />
        </label>
        <button type="submit" className="h-11 rounded-full bg-oxford px-5 font-heading text-sm text-white">
          Filter dates
        </button>
        {from || to ? (
          <Link
            href={status === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${status}`}
            className="h-11 px-2 font-heading text-sm leading-[2.75rem] text-oxford/70"
          >
            Clear dates
          </Link>
        ) : null}
      </form>
    </div>
  );
}
