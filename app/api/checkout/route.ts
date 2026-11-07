import { NextResponse } from "next/server";
import { getCatalogProduct, saveOrder, nextReferenceCode } from "@/lib/local-db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      notes?: string;
      items?: { slug: string; name: string; quantity: number; color: string; priceEgp: number; image?: string }[];
    };
    const items = Array.isArray(body.items) ? body.items : [];
    if (!body.name?.trim() || !body.phone?.trim() || items.length === 0) {
      return NextResponse.json({ error: "Missing checkout fields" }, { status: 400 });
    }
    const reference_code = await nextReferenceCode();
    const summary = items
      .map((item) => `${item.quantity}× ${item.name} (${item.color})`)
      .join(", ");
    const total = items.reduce((sum, item) => sum + item.priceEgp * item.quantity, 0);
    const now = new Date().toISOString();
    const first = items[0];
    const catalogItem = first?.slug ? await getCatalogProduct(first.slug) : undefined;
    const mockup =
      first?.image ||
      catalogItem?.mockup ||
      "/products/white-tee-front.jpg";
    const order = await saveOrder({
      id: crypto.randomUUID(),
      reference_code,
      product_slug: first?.slug ?? "cart",
      product_name: summary,
      customer_name: body.name.trim(),
      customer_email: body.email?.trim() || null,
      customer_phone: body.phone.trim(),
      material: first?.color ?? null,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      notes: [body.address, body.notes, `Total ${total} EGP`].filter(Boolean).join("\n"),
      status: "pending",
      quoted_price: total,
      mockup_path: mockup,
      production_paths: [],
      canvas_json: { items },
      created_at: now,
      updated_at: now,
      cleanup_requested_at: null,
    });
    return NextResponse.json({ ref: order.reference_code });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
