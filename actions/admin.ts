"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adminCookieName,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { inquiryStatusSchema } from "@/lib/schemas/inquiry";
import { deleteStoredFile, getOrder, saveOrder } from "@/lib/local-db";

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
  const current = await getOrder(id);
  if (!current) throw new Error("Order not found");

  const next = {
    ...current,
    status,
    quoted_price,
    updated_at: new Date().toISOString(),
  };

  if (status === "fulfilled" || status === "cancelled") {
    const files = [current.mockup_path, ...(current.production_paths ?? [])].filter(
      (file): file is string => Boolean(file),
    );
    for (const file of files) {
      await deleteStoredFile(file);
    }
    next.mockup_path = "";
    next.production_paths = [];
    next.cleanup_requested_at = new Date().toISOString();
  }

  await saveOrder(next);
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
}
