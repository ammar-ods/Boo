"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminCookieName,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { inquiryStatusSchema } from "@/lib/schemas/inquiry";
import { deleteInquiryStorage } from "@/lib/storage-cleanup";
import type { InquiryRecord } from "@/lib/inquiry-types";

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=1");
  }
  const jar = await cookies();
  jar.set(adminCookieName(), await createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin/inquiries");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(adminCookieName());
  redirect("/admin/login");
}

export async function updateInquiryStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = inquiryStatusSchema.parse(String(formData.get("status") ?? "pending"));
  const quotedRaw = String(formData.get("quoted_price") ?? "");
  const quoted_price = quotedRaw ? Number(quotedRaw) : null;

  const supabase = createAdminClient();
  const { data: current, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !current) {
    throw new Error(error?.message ?? "Inquiry not found");
  }

  const { error: updateError } = await supabase
    .from("inquiries")
    .update({ status, quoted_price, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (updateError) throw updateError;

  if (status === "fulfilled" || status === "cancelled") {
    await deleteInquiryStorage(current as InquiryRecord);
  }

  redirect(`/admin/inquiries/${id}`);
}
