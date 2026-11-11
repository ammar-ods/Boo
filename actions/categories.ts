"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { removeCategoryFromSite, uniqueCategoryId, upsertCategoryInSite, categoryPath } from "@/lib/categories";
import { loc } from "@/lib/site";
import { getCatalog, getSite, savePublicUpload, saveSite, upsertProduct } from "@/lib/local-db";
import { normalizeCategoryId } from "@/lib/products";

async function requireAdmin() {
  const token = (await cookies()).get(adminCookieName())?.value;
  if (!(await isValidAdminSession(token))) redirect("/admin/login");
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

async function uploadThumb(id: string, file: File | null, fallback: string) {
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    return savePublicUpload(
      "products",
      `cat-${id}-${Date.now()}.${ext}`,
      Buffer.from(await file.arrayBuffer()),
      file.type || undefined,
    );
  }
  return fallback;
}

function revalidateCategory(id: string) {
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath(`/p/${id}`);
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  try {
    const site = await getSite();
    const titleEn = String(formData.get("titleEn") || "").trim() || "New category";
    const titleAr = String(formData.get("titleAr") || "").trim() || titleEn;
    const id = uniqueCategoryId(site, String(formData.get("slug") || titleEn));
    const image = await uploadThumb(id, formData.get("image") instanceof File ? (formData.get("image") as File) : null, "");
    const visible = formData.get("visible") === "on";
    const section = {
      id,
      href: categoryPath(id),
      image,
      label: loc(titleAr, titleEn),
      visible,
    };
    await saveSite(upsertCategoryInSite(site, section));
    await assignProductsToCategory(id, formData.getAll("productSlug").map(String));
    revalidateCategory(id);
    redirect(`/admin/categories/${id}?saved=1`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    const message = error instanceof Error ? error.message : "Could not create category";
    redirect(`/admin/categories/new?error=${encodeURIComponent(message)}`);
  }
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  try {
    const site = await getSite();
    const current = (site.chrome.catalogSections ?? []).find((item) => item.id === id);
    if (!current) throw new Error("Category not found");
    const titleEn = String(formData.get("titleEn") || "").trim() || current.label.en;
    const titleAr = String(formData.get("titleAr") || "").trim() || current.label.ar;
    const image = await uploadThumb(
      id,
      formData.get("image") instanceof File ? (formData.get("image") as File) : null,
      current.image,
    );
    const visible = formData.get("visible") === "on";
    const section = {
      ...current,
      image,
      label: loc(titleAr, titleEn),
      visible,
      href: current.href || categoryPath(id),
    };
    await saveSite(upsertCategoryInSite(site, section));
    await assignProductsToCategory(id, formData.getAll("productSlug").map(String));
    revalidateCategory(id);
    redirect(`/admin/categories/${id}?saved=1`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    const message = error instanceof Error ? error.message : "Could not save category";
    redirect(`/admin/categories/${id}?error=${encodeURIComponent(message)}`);
  }
}

export async function hideCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const site = await getSite();
  const current = (site.chrome.catalogSections ?? []).find((item) => item.id === id);
  if (current) {
    await saveSite(upsertCategoryInSite(site, { ...current, visible: formData.get("visible") === "on" }));
  }
  revalidateCategory(id);
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) {
    const site = await getSite();
    await saveSite(removeCategoryFromSite(site, id));
  }
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/catalog");
  redirect("/admin/categories?deleted=1");
}

async function assignProductsToCategory(categoryId: string, selectedSlugs: string[]) {
  const selected = new Set(selectedSlugs.filter(Boolean));
  const products = await getCatalog();
  for (const product of products) {
    const current = normalizeCategoryId(product.category);
    const shouldBelong = selected.has(product.slug);
    if (shouldBelong && current !== categoryId) {
      await upsertProduct({ ...product, category: categoryId });
    } else if (!shouldBelong && current === categoryId) {
      await upsertProduct({ ...product, category: "" });
    }
  }
}
