import { NextResponse } from "next/server";
import { nextReferenceCode, saveOrder, getSite } from "@/lib/local-db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    email?: string;
    notes?: string;
    fields?: Record<string, string>;
  };
  const site = await getSite();
  const fields = body.fields ?? {};
  const required = (site.commerce.contactFields ?? []).filter((field) => field.enabled && field.required);
  for (const field of required) {
    if (!String(fields[field.key] ?? "").trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
  }
  const name = (fields.name || body.name || "").trim();
  const phone = (fields.phone || body.phone || "").trim();
  if (!name || !phone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const reference_code = await nextReferenceCode();
  const now = new Date().toISOString();
  const order = await saveOrder({
    id: crypto.randomUUID(),
    reference_code,
    product_slug: "contact",
    product_name: "Contact",
    customer_name: name,
    customer_email: (fields.email || body.email)?.trim() || null,
    customer_phone: phone,
    material: null,
    quantity: 1,
    notes: fields.notes || body.notes || null,
    status: "pending",
    quoted_price: null,
    mockup_path: null,
    production_paths: [],
    canvas_json: {
      source: "contact",
      fields,
      contactEmail: site.commerce.contactEmail || null,
    },
    created_at: now,
    updated_at: now,
    cleanup_requested_at: null,
  });
  return NextResponse.json({ reference: order.reference_code });
}
