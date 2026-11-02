import Link from "next/link";

export const dynamic = "force-dynamic";
import { logoutAdmin } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { InquiryRecord } from "@/lib/inquiry-types";
import type { InquiryStatus } from "@/lib/schemas/inquiry";

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

  let rows: InquiryRecord[] = [];
  let loadError = "";

  if (!isSupabaseConfigured()) {
    loadError = "Supabase is not configured.";
  } else {
    try {
      const supabase = createAdminClient();
      let query = supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (current !== "all") query = query.eq("status", current);
      const { data, error } = await query;
      if (error) loadError = error.message;
      rows = (data ?? []) as InquiryRecord[];
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Could not load inquiries";
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-script text-2xl text-boo-teal">studio desk</p>
          <h1 className="font-heading text-4xl">Inquiries</h1>
        </div>
        <form action={logoutAdmin}>
          <button className="text-sm text-muted-foreground hover:text-boo-pink">
            Log out
          </button>
        </form>
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

      {loadError ? (
        <div className="rounded-2xl bg-secondary p-6 text-sm">
          {loadError} Apply <code>supabase/schema.sql</code> in the Supabase SQL editor.
        </div>
      ) : (
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
                    <Link
                      className="font-heading text-boo-teal"
                      href={`/admin/inquiries/${row.id}`}
                    >
                      {row.reference_code.startsWith("#")
                        ? row.reference_code
                        : `#${row.reference_code}`}
                    </Link>
                  </TableCell>
                  <TableCell>{row.product_name}</TableCell>
                  <TableCell>
                    <div>{row.customer_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.customer_phone}
                    </div>
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
                    No inquiries in this filter yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
