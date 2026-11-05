import Link from "next/link";
import { listOrders } from "@/lib/local-db";
import type { InquiryStatus } from "@/lib/schemas/inquiry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const STATUSES: Array<InquiryStatus | "all"> = [
  "all",
  "pending",
  "quoted",
  "fulfilled",
  "cancelled",
];

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const current = (status as InquiryStatus | "all") || "all";
  const all = await listOrders();
  const rows = current === "all" ? all : all.filter((row) => row.status === current);

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
        <p className="font-heading text-boo-ink">{all.length} total</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUSES.map((item) => (
          <Link
            key={item}
            href={item === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${item}`}
            className={`rounded-full px-3 py-1.5 font-heading text-sm ${
              current === item
                ? "bg-boo-ink text-white"
                : "bg-white ring-1 ring-foreground/10"
            }`}
          >
            {item}
          </Link>
        ))}
      </div>

      <div className="grid gap-4">
        {rows.map((row) => (
          <Link
            key={row.id}
            href={`/admin/inquiries/${row.id}`}
            className="flex gap-4 overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:ring-boo-teal"
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
              </div>
              <div className="shrink-0 text-right">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-heading">
                  {row.status}
                </span>
                <p className="mt-2 text-sm font-heading text-boo-ink">Open →</p>
              </div>
            </div>
          </Link>
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
