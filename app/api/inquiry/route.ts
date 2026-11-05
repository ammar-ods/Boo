import { NextResponse } from "next/server";
import { inquirySchema } from "@/lib/schemas/inquiry";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = inquirySchema.safeParse({
      productSlug: formData.get("productSlug"),
      productName: formData.get("productName"),
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail") || "",
      customerPhone: formData.get("customerPhone"),
      material: formData.get("material") || "Standard",
      quantity: Number(formData.get("quantity") || 1),
      notes: formData.get("notes") || "",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid inquiry" },
        { status: 400 },
      );
    }

    const mockup = formData.get("mockup");
    if (!(mockup instanceof File) || mockup.size === 0) {
      return NextResponse.json(
        { ok: false, error: "Mockup thumbnail is missing." },
        { status: 400 },
      );
    }

    const extraViews = formData
      .getAll("viewMockups")
      .filter((item): item is File => item instanceof File && item.size > 0);
    const production = formData
      .getAll("production")
      .filter((item): item is File => item instanceof File && item.size > 0);

    const supabase = createAdminClient();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `#BOO-${randomNum}`;
    const id = crypto.randomUUID();
    const stamp = Date.now();

    const mockupFileName = `orders/${referenceCode.replace("#", "")}-mockup.jpg`;
    const { error: mockupUploadError } = await supabase.storage
      .from("uploads")
      .upload(mockupFileName, Buffer.from(await mockup.arrayBuffer()), {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (mockupUploadError) {
      return NextResponse.json(
        { ok: false, error: `Failed to upload mockup: ${mockupUploadError.message}` },
        { status: 500 },
      );
    }
    const { data: mockupPublicUrlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(mockupFileName);

    const productionPaths: string[] = [];
    for (const file of extraViews) {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const viewFileName = `orders/${referenceCode.replace("#", "")}-view-${safeName}`;
      const { error } = await supabase.storage
        .from("uploads")
        .upload(viewFileName, Buffer.from(await file.arrayBuffer()), {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });
      if (!error) {
        productionPaths.push(supabase.storage.from("uploads").getPublicUrl(viewFileName).data.publicUrl);
      }
    }
    for (const file of production) {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const prodFileName = `orders/${referenceCode.replace("#", "")}-${stamp}-${safeName}`;
      const { error } = await supabase.storage
        .from("uploads")
        .upload(prodFileName, Buffer.from(await file.arrayBuffer()), {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });
      if (!error) {
        productionPaths.push(supabase.storage.from("uploads").getPublicUrl(prodFileName).data.publicUrl);
      }
    }

    let canvasJson: unknown = null;
    const rawJson = formData.get("canvasJson");
    if (typeof rawJson === "string" && rawJson) {
      try {
        canvasJson = JSON.parse(rawJson);
      } catch {
        canvasJson = null;
      }
    }

    const now = new Date().toISOString();
    const { error: dbError } = await supabase.from("inquiries").insert({
      id,
      reference_code: referenceCode,
      product_slug: parsed.data.productSlug,
      product_name: parsed.data.productName,
      customer_name: parsed.data.customerName,
      customer_email: parsed.data.customerEmail || null,
      customer_phone: parsed.data.customerPhone,
      material: parsed.data.material || "Standard",
      quantity: parsed.data.quantity || 1,
      notes: parsed.data.notes || null,
      status: "pending",
      quoted_price: null,
      mockup_path: mockupPublicUrlData.publicUrl,
      production_paths: productionPaths,
      canvas_json: canvasJson,
      created_at: now,
    });

    if (dbError) {
      return NextResponse.json(
        { ok: false, error: `Failed to save inquiry to database: ${dbError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      referenceCode,
      whatsappUrl: buildWhatsAppUrl({
        referenceCode,
        productName: parsed.data.productName,
        quantity: parsed.data.quantity || 1,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Inquiry submission failed",
      },
      { status: 500 },
    );
  }
}
