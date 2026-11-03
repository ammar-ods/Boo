"use server";

import { inquirySchema } from "@/lib/schemas/inquiry";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  nextReferenceCode,
  saveOrder,
  savePublicUpload,
} from "@/lib/local-db";
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

  const production = formData
    .getAll("production")
    .filter((item): item is File => item instanceof File && item.size > 0);

  try {
    const referenceCode = await nextReferenceCode();
    const id = crypto.randomUUID();
    const stamp = Date.now();
    const mockupPath = await savePublicUpload(
      "orders",
      `${referenceCode}-mockup.jpg`,
      Buffer.from(await mockup.arrayBuffer()),
    );
    const productionPaths: string[] = [];
    for (const file of production) {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      productionPaths.push(
        await savePublicUpload(
          "orders",
          `${referenceCode}-${stamp}-${safeName}`,
          Buffer.from(await file.arrayBuffer()),
        ),
      );
    }

    const now = new Date().toISOString();
    const record: InquiryRecord = {
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
      canvas_json: safeJson(formData.get("canvasJson")),
      created_at: now,
      updated_at: now,
      cleanup_requested_at: null,
    };

    await saveOrder(record);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from("inquiries").insert({
          id,
          reference_code: referenceCode,
          product_slug: record.product_slug,
          product_name: record.product_name,
          customer_name: record.customer_name,
          customer_email: record.customer_email,
          customer_phone: record.customer_phone,
          material: record.material,
          quantity: record.quantity,
          notes: record.notes,
          canvas_json: record.canvas_json,
          status: "pending",
          mockup_path: mockupPath,
          production_paths: productionPaths,
        });
      } catch {
        /* local copy is the source of truth */
      }
    }

    const display = referenceCode.startsWith("#") ? referenceCode : `#${referenceCode}`;
    return {
      ok: true,
      referenceCode: display,
      whatsappUrl: buildWhatsAppUrl({
        referenceCode: display,
        productName: parsed.data.productName,
        quantity: parsed.data.quantity,
      }),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Inquiry failed",
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
