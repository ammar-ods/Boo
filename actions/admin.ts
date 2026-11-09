"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adminCookieName,
  createAdminSessionToken,
  isValidAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { inquiryStatusSchema } from "@/lib/schemas/inquiry";
import { deleteOrder, getOrder, getSite, saveOrder, saveSite } from "@/lib/local-db";

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

  await saveOrder({
    ...current,
    status,
    quoted_price,
    updated_at: new Date().toISOString(),
  });
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
}

export async function deleteInquiry(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Order not found");
  await deleteOrder(id);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/inquiries", "layout");
  redirect("/admin/inquiries?deleted=1");
}

export async function savePromo(formData: FormData) {
  const token = (await cookies()).get(adminCookieName())?.value;
  if (!(await isValidAdminSession(token))) redirect("/admin/login");
  const site = await getSite();
  await saveSite({
    ...site,
    chrome: {
      ...site.chrome,
      payPhone: String(formData.get("payPhone") ?? "").trim() || site.chrome.payPhone,
    },
    promo: {
      live: formData.get("live") === "on",
      text: {
        ar: String(formData.get("textAr") ?? ""),
        en: String(formData.get("textEn") ?? ""),
      },
      image: String(formData.get("image") ?? ""),
    },
  });
  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin/promo");
}
