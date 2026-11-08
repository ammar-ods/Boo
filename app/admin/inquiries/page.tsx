import Link from "next/link";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { OrdersFilters } from "@/components/admin/orders-filters";
import { listOrders } from "@/lib/local-db";
import type { InquiryStatus } from "@/lib/schemas/inquiry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function dayStamp(iso: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const { status, from = "", to = "" } = await searchParams;
  const current = (status as InquiryStatus | "all") || "all";
  const all = await listOrders();
  const rows = all.filter((row) => {
    if (current !== "all" && row.status !== current) return false;
    const stamp = dayStamp(row.created_at);
    if (from && stamp < from) return false;
    if (to && stamp > to) return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="font-script text-2xl text-boo-teal">inbox</p>
          <h1 className="mt-1 font-heading text-4xl text-oxford">Orders</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Open an order for the mockup, uploads, and customer details.
          </p>
        </div>
        <p className="rounded-full bg-white px-4 py-1.5 font-heading text-sm text-oxford ring-1 ring-oxford/10">
          {rows.length} shown
        </p>
      </div>

      <OrdersFilters status={current} from={from} to={to} />

      <div className="grid gap-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-[0_12px_32px_-24px_rgba(10,37,64,0.28)] ring-1 ring-oxford/8 sm:flex-row"
          >
            <Link
              href={`/admin/inquiries/${row.id}`}
              className="flex min-w-0 flex-1 flex-col transition hover:bg-cream/70 sm:flex-row"
            >
              <div className="h-36 w-full shrink-0 bg-[#f6f3ee] sm:h-auto sm:w-32">
                {row.mockup_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.mockup_path} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full min-h-28 items-center justify-center px-3 text-center text-xs text-muted-foreground">
                    No preview
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-heading text-base text-boo-teal">
                    #{row.reference_code.replace("#", "")}
                  </p>
                  <p className="mt-1 truncate font-heading text-xl text-oxford">{row.product_name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {row.customer_name} · {row.customer_phone} · qty {row.quantity}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.created_at ? new Date(row.created_at).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-heading capitalize">
                    {row.status}
                  </span>
                  <p className="text-sm font-heading text-oxford">Open</p>
                </div>
              </div>
            </Link>
            <div className="flex items-center border-t border-oxford/8 p-4 sm:w-40 sm:border-s sm:border-t-0">
              <DeleteOrderButton id={row.id} reference={row.reference_code} compact />
            </div>
          </div>
        ))}
        {rows.length === 0 ? (
          <div className="rounded-[1.6rem] bg-white px-6 py-14 text-center text-muted-foreground ring-1 ring-oxford/8">
            No orders in this filter yet. Customizer inquiries land here automatically.
          </div>
        ) : null}
      </div>
    </div>
  );
}
