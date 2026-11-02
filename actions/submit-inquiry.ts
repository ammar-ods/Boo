"use server";

import { inquirySchema } from "@/lib/schemas/inquiry";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

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

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Studio storage is not connected yet. Add Supabase keys in .env.local.",
    };
  }

  const mockup = formData.get("mockup");
  if (!(mockup instanceof File) || mockup.size === 0) {
    return { ok: false, error: "Mockup thumbnail is missing." };
  }

  const production = formData
    .getAll("production")
    .filter((item): item is File => item instanceof File && item.size > 0);

  try {
    const supabase = createAdminClient();
    const { data: inserted, error: insertError } = await supabase
      .from("inquiries")
      .insert({
        product_slug: parsed.data.productSlug,
        product_name: parsed.data.productName,
        customer_name: parsed.data.customerName,
        customer_email: parsed.data.customerEmail || null,
        customer_phone: parsed.data.customerPhone,
        material: parsed.data.material,
        quantity: parsed.data.quantity,
        notes: parsed.data.notes || null,
        canvas_json: safeJson(formData.get("canvasJson")),
        status: "pending",
      })
      .select("id, reference_code")
      .single();

    if (insertError || !inserted) {
      return {
        ok: false,
        error: insertError?.message ?? "Could not create the inquiry record.",
      };
    }

    const folder = inserted.reference_code.replace("#", "");
    const mockupPath = `${folder}/mockup.jpg`;
    const { error: mockupError } = await supabase.storage
      .from("inquiry-assets")
      .upload(mockupPath, mockup, {
        contentType: mockup.type || "image/jpeg",
        upsert: true,
      });
    if (mockupError) {
      return { ok: false, error: mockupError.message };
    }

    const productionPaths: string[] = [];
    for (const file of production) {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${folder}/production/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("inquiry-assets").upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (!error) productionPaths.push(path);
    }

    await supabase
      .from("inquiries")
      .update({
        mockup_path: mockupPath,
        production_paths: productionPaths,
      })
      .eq("id", inserted.id);

    const referenceCode = inserted.reference_code.startsWith("#")
      ? inserted.reference_code
      : `#${inserted.reference_code}`;

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
