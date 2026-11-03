import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listOrders } from "@/lib/local-db";
import type { InquiryStatus } from "@/lib/schemas/inquiry";

export const dynamic = "force-dynamic";

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
            Every inquiry is saved on this website, even without Supabase.
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

      <div className="overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quote</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link className="font-heading text-boo-teal" href={`/admin/inquiries/${row.id}`}>
                    #{row.reference_code.replace("#", "")}
                  </Link>
                </TableCell>
                <TableCell>{row.product_name}</TableCell>
                <TableCell>
                  <div>{row.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{row.customer_phone}</div>
                </TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "pending" ? "secondary" : "default"}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {row.quoted_price != null ? `${row.quoted_price}` : "—"}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No orders in this filter yet. Customizer inquiries land here automatically.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
