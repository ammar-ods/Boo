import { NextResponse } from "next/server";
import { getCatalogProduct, persistOrderMedia, saveOrder, nextReferenceCode, getSite } from "@/lib/local-db";
import { cartBreakdown, matchPromo } from "@/lib/commerce";

type CheckoutItem = {
  slug: string;
  name: string;
  quantity: number;
  color: string;
  priceEgp: number;
  image?: string;
  custom?: boolean;
  viewMockups?: { id?: string; label?: string; url: string }[];
  uploads?: { name?: string; url: string }[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      address?: string;
      email?: string;
      notes?: string;
      fields?: Record<string, string>;
      promoCode?: string;
      payment?: { method?: string; transferPhone?: string; receiptUrl?: string };
      items?: CheckoutItem[];
    };
    const site = await getSite();
    const items = Array.isArray(body.items) ? body.items : [];
    const paymentMethod = body.payment?.method === "online" ? "online" : "cod";
    const fields = body.fields ?? {};
    const name = String(fields.name || body.name || "").trim();
    const phone = String(fields.phone || body.phone || "").trim();
    const address = String(fields.address || body.address || "").trim();
    if (!name || !phone || items.length === 0) {
      return NextResponse.json({ error: "Missing checkout fields" }, { status: 400 });
    }
    for (const field of (site.commerce.checkoutFields ?? []).filter((item) => item.enabled && item.required)) {
      if (!String(fields[field.key] ?? "").trim()) {
        return NextResponse.json({ error: "Missing checkout fields" }, { status: 400 });
      }
    }
    const hasCustom = items.some((item) => item.custom || (item.uploads?.length ?? 0) > 0);
    if (site.commerce.codBlockCustom !== false && hasCustom && paymentMethod === "cod") {
      return NextResponse.json({ error: "Custom orders must pay online" }, { status: 400 });
    }
    if (paymentMethod === "online" && (!body.payment?.transferPhone?.trim() || !body.payment?.receiptUrl)) {
      return NextResponse.json({ error: "Missing transfer details" }, { status: 400 });
    }
    const reference_code = await nextReferenceCode();
    const summary = items
      .map((item) => `${item.quantity}× ${item.name} (${item.color})`)
      .join(", ");
    const subtotal = items.reduce((sum, item) => sum + item.priceEgp * item.quantity, 0);
    const promo = matchPromo(body.promoCode, site.promo.codes ?? []);
    const breakdown = cartBreakdown(subtotal, site.commerce, promo);
    const total = breakdown.total;
    const now = new Date().toISOString();
    const first = items[0];
    const catalogItem = first?.slug ? await getCatalogProduct(first.slug) : undefined;

    const viewFiles: { id: string; label: string; url: string }[] = [];
    const uploadFiles: { name: string; url: string }[] = [];
    for (const [itemIndex, item] of items.entries()) {
      for (const [index, view] of (item.viewMockups ?? []).entries()) {
        if (!view.url) continue;
        const url = await persistOrderMedia(view.url, `${item.slug || "item"}-${view.id || index}.jpg`);
        viewFiles.push({
          id: view.id || `${item.slug}-view-${index}`,
          label: view.label || view.id || `View ${index + 1}`,
          url,
        });
      }
      for (const [index, file] of (item.uploads ?? []).entries()) {
        if (!file.url) continue;
        const url = await persistOrderMedia(file.url, file.name || `${item.slug}-upload-${index}`);
        uploadFiles.push({ name: file.name || `Upload ${index + 1}`, url });
      }
      if (!(item.viewMockups ?? []).length && item.image) {
        const url = await persistOrderMedia(item.image, `${item.slug || itemIndex}.jpg`);
        viewFiles.push({ id: item.slug, label: item.name, url });
      }
    }

    let receiptUrl = "";
    if (paymentMethod === "online" && body.payment?.receiptUrl) {
      receiptUrl = await persistOrderMedia(body.payment.receiptUrl, "receipt.jpg");
    }

    const previewPaths = viewFiles.map((item) => item.url).filter(Boolean);
    const uploadPaths = uploadFiles.map((item) => item.url).filter(Boolean);
    const mockup =
      previewPaths[0] ||
      first?.image ||
      catalogItem?.mockup ||
      "/products/white-tee-front.jpg";

    const order = await saveOrder({
      id: crypto.randomUUID(),
      reference_code,
      product_slug: first?.slug ?? "cart",
      product_name: summary,
      customer_name: name,
      customer_email: String(fields.email || body.email || "").trim() || null,
      customer_phone: phone,
      material: first?.color ?? null,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      notes: [
        address,
        fields.notes || body.notes,
        breakdown.discount ? `Promo ${breakdown.promoCode} −${breakdown.discount} EGP` : "",
        breakdown.shippingFree ? "Shipping: free" : `Shipping ${breakdown.shippingCharged} EGP`,
        `Total ${total} EGP`,
        paymentMethod === "online"
          ? `Payment: online transfer from ${body.payment?.transferPhone}`
          : "Payment: cash on delivery",
      ]
        .filter(Boolean)
        .join("\n"),
      status: "pending",
      quoted_price: total,
      mockup_path: mockup,
      production_paths: [...previewPaths.slice(1), ...uploadPaths, receiptUrl].filter(Boolean),
      canvas_json: {
        items,
        fields,
        views: viewFiles,
        uploads: uploadFiles,
        commerce: breakdown,
        payment: {
          method: paymentMethod,
          transferPhone: body.payment?.transferPhone?.trim() || "",
          receiptUrl,
        },
      },
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
