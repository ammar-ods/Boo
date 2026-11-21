"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import {
  CUSTOM_PRODUCT_SLUG,
  type FinanceAsset,
  type FinanceSale,
  type FinanceSpending,
  type SpendingType,
} from "@/lib/finance";
import { getFinance, saveFinance } from "@/lib/local-db";

async function requireAdmin() {
  const token = (await cookies()).get(adminCookieName())?.value;
  if (!(await isValidAdminSession(token))) redirect("/admin/login");
}

function money(value: FormDataEntryValue | null) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function day(value: FormDataEntryValue | null) {
  const raw = String(value || "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : new Date().toISOString().slice(0, 10);
}

function refresh() {
  revalidatePath("/admin/accounting");
  revalidatePath("/admin/accounting/sales");
  revalidatePath("/admin/accounting/spendings");
  revalidatePath("/admin/accounting/assets");
  revalidatePath("/admin/accounting/settings");
}

export async function saveFinanceSale(formData: FormData) {
  await requireAdmin();
  const doc = await getFinance();
  const id = String(formData.get("id") || "");
  const existing = doc.sales.find((row) => row.id === id);
  const sale: FinanceSale = {
    id: existing?.id || crypto.randomUUID(),
    lineKey: existing?.lineKey,
    source: existing?.source || "manual",
    orderId: existing?.orderId,
    orderRef: existing?.orderRef,
    productSlug: String(formData.get("productSlug") || CUSTOM_PRODUCT_SLUG),
    productName: String(formData.get("productName") || "Custom").trim() || "Custom",
    date: day(formData.get("date")),
    quantity: Math.max(1, Math.round(money(formData.get("quantity")) || 1)),
    revenue: money(formData.get("revenue")),
    cost: formData.get("cost") === "" || formData.get("cost") == null ? null : money(formData.get("cost")),
    notes: String(formData.get("notes") || "").trim() || undefined,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  const sales = existing ? doc.sales.map((row) => (row.id === id ? sale : row)) : [sale, ...doc.sales];
  await saveFinance({ ...doc, sales });
  refresh();
  redirect("/admin/accounting/sales?saved=1");
}

export async function deleteFinanceSale(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const doc = await getFinance();
  const removed = doc.sales.find((row) => row.id === id);
  await saveFinance({
    ...doc,
    sales: doc.sales.filter((row) => row.id !== id),
    ignoredLineKeys: removed?.lineKey ? [...doc.ignoredLineKeys, removed.lineKey] : doc.ignoredLineKeys,
  });
  refresh();
  redirect("/admin/accounting/sales?deleted=1");
}

export async function saveFinanceSpending(formData: FormData) {
  await requireAdmin();
  const doc = await getFinance();
  const id = String(formData.get("id") || "");
  const type = String(formData.get("type") || "operational") === "material" ? "material" : "operational";
  const row: FinanceSpending = {
    id: id || crypto.randomUUID(),
    date: day(formData.get("date")),
    type: type as SpendingType,
    category: String(formData.get("category") || "Other").trim() || "Other",
    amount: money(formData.get("amount")),
    notes: String(formData.get("notes") || "").trim() || undefined,
  };
  const spendings = id ? doc.spendings.map((item) => (item.id === id ? row : item)) : [row, ...doc.spendings];
  await saveFinance({ ...doc, spendings });
  refresh();
  redirect("/admin/accounting/spendings?saved=1");
}

export async function deleteFinanceSpending(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const doc = await getFinance();
  await saveFinance({ ...doc, spendings: doc.spendings.filter((row) => row.id !== id) });
  refresh();
  redirect("/admin/accounting/spendings?deleted=1");
}

export async function saveFinanceAsset(formData: FormData) {
  await requireAdmin();
  const doc = await getFinance();
  const id = String(formData.get("id") || "");
  const row: FinanceAsset = {
    id: id || crypto.randomUUID(),
    name: String(formData.get("name") || "Asset").trim() || "Asset",
    cost: money(formData.get("cost")),
    date: day(formData.get("date")),
    notes: String(formData.get("notes") || "").trim() || undefined,
  };
  const assets = id ? doc.assets.map((item) => (item.id === id ? row : item)) : [row, ...doc.assets];
  await saveFinance({ ...doc, assets });
  refresh();
  redirect("/admin/accounting/assets?saved=1");
}

export async function deleteFinanceAsset(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const doc = await getFinance();
  await saveFinance({ ...doc, assets: doc.assets.filter((row) => row.id !== id) });
  refresh();
  redirect("/admin/accounting/assets?deleted=1");
}

export async function saveFinanceSettings(formData: FormData) {
  await requireAdmin();
  const doc = await getFinance();
  const slugs = formData.getAll("costSlug").map(String);
  const costs = formData.getAll("costValue");
  const productCosts: Record<string, number> = { ...doc.settings.productCosts };
  slugs.forEach((slug, index) => {
    if (!slug) return;
    productCosts[slug] = money(costs[index] ?? 0);
  });
  const catIds = formData.getAll("categoryId").map(String);
  const catLabels = formData.getAll("categoryLabel").map(String);
  const catTypes = formData.getAll("categoryType").map(String);
  const spendingCategories = catIds
    .map((id, index) => ({
      id: id || `cat-${index}`,
      label: (catLabels[index] || "").trim(),
      type: catTypes[index] === "material" ? ("material" as const) : ("operational" as const),
    }))
    .filter((item) => item.label);
  await saveFinance({
    ...doc,
    settings: {
      startingCapital: money(formData.get("startingCapital")),
      productCosts,
      spendingCategories: spendingCategories.length ? spendingCategories : doc.settings.spendingCategories,
    },
  });
  refresh();
  redirect("/admin/accounting/settings?saved=1");
}
