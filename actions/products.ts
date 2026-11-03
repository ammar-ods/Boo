"use server";

import { redirect } from "next/navigation";
import {
  CATEGORIES,
  slugify,
  type Product,
  type ProductCategory,
} from "@/lib/products";
import {
  deleteProduct,
  getCatalog,
  getCatalogProduct,
  savePublicUpload,
  upsertProduct,
} from "@/lib/local-db";

function parseSafe(formData: FormData) {
  return {
    left: Number(formData.get("safe_left") || 200),
    top: Number(formData.get("safe_top") || 200),
    width: Number(formData.get("safe_width") || 400),
    height: Number(formData.get("safe_height") || 400),
  };
}

async function productFromForm(formData: FormData, existing?: Product): Promise<Product> {
  const name = String(formData.get("name") || "").trim();
  const slug = slugify(String(formData.get("slug") || name));
  if (!name || !slug) throw new Error("Name is required");

  const materials = String(formData.get("materials") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const category = String(formData.get("category")) as ProductCategory;
  const file = formData.get("mockup");
  let mockup = existing?.mockup || "/products/classic-tee.svg";
  if (file instanceof File && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    mockup = await savePublicUpload(
      "products",
      `${slug}-${Date.now()}.${ext}`,
      Buffer.from(await file.arrayBuffer()),
    );
  }

  return {
    slug,
    name,
    category: CATEGORIES.includes(category) ? category : "Apparel",
    tagline: String(formData.get("tagline") || "Custom studio piece."),
    description: String(formData.get("description") || ""),
    is_laser_cut: formData.get("is_laser_cut") === "on",
    materials: materials.length ? materials : ["Standard"],
    defaultMaterial: materials[0] || "Standard",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: parseSafe(formData),
    mockup,
    accent: (["pink", "orange", "teal"].includes(String(formData.get("accent")))
      ? formData.get("accent")
      : "teal") as Product["accent"],
    showSafeZone: formData.get("showSafeZone") === "on",
    archived: formData.get("archived") === "on",
  };
}

export async function createProduct(formData: FormData) {
  const product = await productFromForm(formData);
  const existing = await getCatalogProduct(product.slug);
  if (existing) {
    redirect(`/admin/products/${existing.slug}?error=exists`);
  }
  await upsertProduct(product);
  redirect(`/admin/products/${product.slug}`);
}

export async function updateProduct(formData: FormData) {
  const originalSlug = String(formData.get("originalSlug") || "");
  const current = await getCatalogProduct(originalSlug);
  const product = await productFromForm(formData, current);
  if (originalSlug && originalSlug !== product.slug) {
    const catalog = await getCatalog();
    const withoutOld = catalog.filter((item) => item.slug !== originalSlug);
    withoutOld.push(product);
    const { saveCatalog } = await import("@/lib/local-db");
    await saveCatalog(withoutOld);
  } else {
    await upsertProduct(product);
  }
  redirect(`/admin/products/${product.slug}`);
}

export async function removeProduct(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  if (slug) await deleteProduct(slug);
  redirect("/admin/products");
}
