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
import {
  DEFAULT_CHECKOUT_FIELDS,
  DEFAULT_CONTACT_FIELDS,
  loc,
  type PromoCode,
  type ShopFormField,
} from "@/lib/site";

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
  if (!id) redirect("/admin/inquiries?error=missing");
  try {
    await deleteOrder(id);
  } catch {
    redirect("/admin/inquiries?error=delete");
  }
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/inquiries", "layout");
  revalidatePath("/admin/inquiries", "page");
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
      codes: parsePromoCodes(formData.get("codes"), site.promo.codes),
    },
  });
  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin/promo");
}

export async function saveShopSettings(formData: FormData) {
  const token = (await cookies()).get(adminCookieName())?.value;
  if (!(await isValidAdminSession(token))) redirect("/admin/login");
  const site = await getSite();
  await saveSite({
    ...site,
    chrome: {
      ...site.chrome,
      whatsappPhone: String(formData.get("whatsappPhone") ?? "").trim(),
      payPhone: String(formData.get("payPhone") ?? "").trim() || site.chrome.payPhone,
      showDiscipline: formData.get("showDiscipline") === "on",
    },
    commerce: {
      shippingPrice: Math.max(0, Number(formData.get("shippingPrice") || 0)),
      freeShippingMin: Math.max(0, Number(formData.get("freeShippingMin") || 0)),
      shippingLabel: {
        ar: String(formData.get("shippingLabelAr") ?? site.commerce.shippingLabel.ar),
        en: String(formData.get("shippingLabelEn") ?? site.commerce.shippingLabel.en),
      },
      shippingDetails: {
        ar: String(formData.get("shippingDetailsAr") ?? site.commerce.shippingDetails.ar),
        en: String(formData.get("shippingDetailsEn") ?? site.commerce.shippingDetails.en),
      },
      contactEmail: String(formData.get("contactEmail") ?? "").trim(),
      contactFields: parseFormFields(formData.get("contactFields"), DEFAULT_CONTACT_FIELDS),
      checkoutFields: parseFormFields(formData.get("checkoutFields"), DEFAULT_CHECKOUT_FIELDS),
      codBlockCustom: formData.get("codBlockCustom") === "on",
    },
  });
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/checkout");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
}

function parsePromoCodes(raw: FormDataEntryValue | null, fallback: PromoCode[]): PromoCode[] {
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw) as PromoCode[];
    if (!Array.isArray(parsed)) return fallback;
    return parsed
      .map((item) => ({
        id: String(item.id || crypto.randomUUID()),
        code: String(item.code || "").trim().toUpperCase(),
        percent: Math.min(100, Math.max(0, Number(item.percent) || 0)),
        active: item.active !== false,
      }))
      .filter((item) => item.code);
  } catch {
    return fallback;
  }
}

function parseFormFields(raw: FormDataEntryValue | null, fallback: ShopFormField[]): ShopFormField[] {
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw) as ShopFormField[];
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
    return parsed.map((item, index) => ({
      id: String(item.id || `field-${index}`),
      key: String(item.key || `field_${index}`).trim() || `field_${index}`,
      type: item.type === "email" || item.type === "tel" || item.type === "textarea" ? item.type : "text",
      required: Boolean(item.required),
      enabled: item.enabled !== false,
      label: loc(String(item.label?.ar ?? item.key), String(item.label?.en ?? item.key)),
    }));
  } catch {
    return fallback;
  }
}
