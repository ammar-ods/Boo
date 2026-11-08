import { NextResponse } from "next/server";
import { getCatalogProduct, persistOrderMedia, saveOrder, nextReferenceCode } from "@/lib/local-db";

type CheckoutItem = {
  slug: string;
  name: string;
  quantity: number;
  color: string;
  priceEgp: number;
  image?: string;
  viewMockups?: { id?: string; label?: string; url: string }[];
  uploads?: { name?: string; url: string }[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      address?: string;
      notes?: string;
      payment?: { method?: string; transferPhone?: string; receiptUrl?: string };
      items?: CheckoutItem[];
    };
    const items = Array.isArray(body.items) ? body.items : [];
    const paymentMethod = body.payment?.method === "online" ? "online" : "cod";
    if (!body.name?.trim() || !body.phone?.trim() || !body.address?.trim() || items.length === 0) {
      return NextResponse.json({ error: "Missing checkout fields" }, { status: 400 });
    }
    if (paymentMethod === "online" && (!body.payment?.transferPhone?.trim() || !body.payment?.receiptUrl)) {
      return NextResponse.json({ error: "Missing transfer details" }, { status: 400 });
    }
    const reference_code = await nextReferenceCode();
    const summary = items
      .map((item) => `${item.quantity}× ${item.name} (${item.color})`)
      .join(", ");
    const total = items.reduce((sum, item) => sum + item.priceEgp * item.quantity, 0);
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
      customer_name: body.name.trim(),
      customer_email: null,
      customer_phone: body.phone.trim(),
      material: first?.color ?? null,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      notes: [
        body.address,
        body.notes,
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
        views: viewFiles,
        uploads: uploadFiles,
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
