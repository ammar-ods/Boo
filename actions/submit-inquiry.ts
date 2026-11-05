"use server";

import { inquirySchema } from "@/lib/schemas/inquiry";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { InquiryRecord } from "@/lib/inquiry-types";

export type SubmitInquiryResult =
  | { ok: true; referenceCode: string; whatsappUrl: string }
  | { ok: false; error: string };

export async function submitInquiry(formData: FormData): Promise<SubmitInquiryResult> {
  const parsed = inquirySchema.safeParse({
    productSlug: formData.get("productSlug"),
    productName: formData.get("productName"),
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail") || "",
    customerPhone: formData.get("customerPhone"),
    material: formData.get("material"),
    quantity: Number(formData.get("quantity")),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid inquiry" };
  }

    const mockup = formData.get("mockup");
  if (!(mockup instanceof File) || mockup.size === 0) {
    return { ok: false, error: "Mockup thumbnail is missing." };
  }

  const extraViews = formData
    .getAll("viewMockups")
    .filter((item): item is File => item instanceof File && item.size > 0);

  const production = formData
    .getAll("production")
    .filter((item): item is File => item instanceof File && item.size > 0);

  try {
    const supabase = createAdminClient();

    // Generate a unique reference code (e.g., BOO-1042)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `#BOO-${randomNum}`;
    const id = crypto.randomUUID();
    const stamp = Date.now();

    // 1. Upload Mockup to Supabase Storage ('uploads' bucket)
    const mockupBuffer = Buffer.from(await mockup.arrayBuffer());
    const mockupFileName = `orders/${referenceCode.replace('#', '')}-mockup.jpg`;
    
    const { error: mockupUploadError } = await supabase.storage
      .from("uploads")
      .upload(mockupFileName, mockupBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (mockupUploadError) {
      throw new Error(`Failed to upload mockup: ${mockupUploadError.message}`);
    }

    const { data: mockupPublicUrlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(mockupFileName);
    
    const mockupPath = mockupPublicUrlData.publicUrl;

    // 2. Upload Production Files to Supabase Storage
    const productionPaths: string[] = [];
    for (const file of extraViews) {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const viewFileName = `orders/${referenceCode.replace("#", "")}-view-${safeName}`;
      const { error: viewUploadError } = await supabase.storage
        .from("uploads")
        .upload(viewFileName, Buffer.from(await file.arrayBuffer()), {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });
      if (!viewUploadError) {
        const { data: viewUrlData } = supabase.storage.from("uploads").getPublicUrl(viewFileName);
        productionPaths.push(viewUrlData.publicUrl);
      }
    }
    for (const file of production) {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const prodFileName = `orders/${referenceCode.replace('#', '')}-${stamp}-${safeName}`;
      
      const { error: prodUploadError } = await supabase.storage
        .from("uploads")
        .upload(prodFileName, Buffer.from(await file.arrayBuffer()), {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (!prodUploadError) {
        const { data: prodUrlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(prodFileName);
        productionPaths.push(prodUrlData.publicUrl);
      }
    }

    const now = new Date().toISOString();
    const canvasJson = safeJson(formData.get("canvasJson"));

    // 3. Insert Record into Supabase 'inquiries' Table
    const { error: dbError } = await supabase.from("inquiries").insert({
      id,
      reference_code: referenceCode,
      product_slug: parsed.data.productSlug,
      product_name: parsed.data.productName,
      customer_name: parsed.data.customerName,
      customer_email: parsed.data.customerEmail || null,
      customer_phone: parsed.data.customerPhone,
      material: parsed.data.material,
      quantity: parsed.data.quantity,
      notes: parsed.data.notes || null,
      status: "pending",
      quoted_price: null,
      mockup_path: mockupPath,
      production_paths: productionPaths,
      canvas_json: canvasJson,
      created_at: now,
    });

    if (dbError) {
      throw new Error(`Failed to save inquiry to database: ${dbError.message}`);
    }

    return {
      ok: true,
      referenceCode,
      whatsappUrl: buildWhatsAppUrl({
        referenceCode,
        productName: parsed.data.productName,
        quantity: parsed.data.quantity,
      }),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Inquiry submission failed",
    };
  }
}

function safeJson(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}