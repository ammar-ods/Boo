import { NextResponse } from "next/server";
import { nextReferenceCode, saveOrder } from "@/lib/local-db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    email?: string;
    notes?: string;
  };
  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const reference_code = await nextReferenceCode();
  const now = new Date().toISOString();
  const order = await saveOrder({
    id: crypto.randomUUID(),
    reference_code,
    product_slug: "contact",
    product_name: "Contact",
    customer_name: body.name.trim(),
    customer_email: body.email?.trim() || null,
    customer_phone: body.phone.trim(),
    material: null,
    quantity: 1,
    notes: body.notes ?? null,
    status: "pending",
    quoted_price: null,
    mockup_path: null,
    production_paths: [],
    canvas_json: { source: "contact" },
    created_at: now,
    updated_at: now,
    cleanup_requested_at: null,
  });
  return NextResponse.json({ reference: order.reference_code });
}
