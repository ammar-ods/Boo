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
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-script text-2xl text-boo-teal">inbox</p>
          <h1 className="font-heading text-4xl">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Tap an order to open the mockup, uploads, and customer details.
          </p>
        </div>
        <p className="font-heading text-boo-ink">{rows.length} shown</p>
      </div>

      <OrdersFilters status={current} from={from} to={to} />

      <div className="grid gap-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-foreground/10"
          >
            <Link
              href={`/admin/inquiries/${row.id}`}
              className="flex min-w-0 flex-1 gap-4 transition hover:bg-cream/60"
            >
              <div className="h-28 w-28 shrink-0 bg-[#f6f3ee]">
                {row.mockup_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.mockup_path} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No preview
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-4 py-4 pr-4">
                <div className="min-w-0">
                  <p className="font-heading text-lg text-boo-teal">
                    #{row.reference_code.replace("#", "")}
                  </p>
                  <p className="truncate font-heading text-xl">{row.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.customer_name} · {row.customer_phone} · qty {row.quantity}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.created_at ? new Date(row.created_at).toLocaleString() : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-heading">
                    {row.status}
                  </span>
                  <p className="mt-2 text-sm font-heading text-boo-ink">Open →</p>
                </div>
              </div>
            </Link>
            <div className="flex w-36 shrink-0 items-center border-l border-foreground/10 px-3">
              <DeleteOrderButton id={row.id} reference={row.reference_code} />
            </div>
          </div>
        ))}
        {rows.length === 0 ? (
          <div className="rounded-[1.4rem] bg-white py-10 text-center text-muted-foreground ring-1 ring-foreground/10">
            No orders in this filter yet. Customizer inquiries land here automatically.
          </div>
        ) : null}
      </div>
    </div>
  );
}
