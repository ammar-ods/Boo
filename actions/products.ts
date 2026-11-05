"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CATEGORIES,
  MUG_WRAP_FLAT,
  slugify,
  type Product,
  type ProductCategory,
  type ProductView,
} from "@/lib/products";
import {
  deleteProduct,
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
  const wrapPreview = formData.get("wrapPreview") === "on" || category === "Drinkware";
  const file = formData.get("mockup");
  let mockup = existing?.mockup || "/products/classic-tee.svg";
  if (file instanceof File && file.size > 0) {
    mockup = await uploadViewFile(slug, file);
  }

  let mugPhoto = existing?.mugPhoto;
  const mugFile = formData.get("mug_photo");
  if (mugFile instanceof File && mugFile.size > 0) {
    mugPhoto = await uploadViewFile(slug, mugFile);
  } else if (wrapPreview && !mugPhoto) {
    mugPhoto =
      mockup.includes("mug-wrap-flat") ? MUG_WRAP_FLAT.productMockup : mockup || MUG_WRAP_FLAT.productMockup;
  }

  let wrapTemplate = existing?.wrapTemplate;
  const wrapFile = formData.get("wrap_template");
  if (wrapFile instanceof File && wrapFile.size > 0) {
    wrapTemplate = await uploadViewFile(slug, wrapFile);
  } else if (wrapPreview && !wrapTemplate) {
    wrapTemplate = MUG_WRAP_FLAT.mockup;
  }

  if (wrapPreview && mugPhoto) mockup = mugPhoto;

  const safe = parseSafe(formData);
  const views: ProductView[] = [
    {
      id: "front",
      label: String(formData.get("primary_label") || (wrapPreview ? "Wrap" : "Front")),
      mockup: wrapPreview ? wrapTemplate || MUG_WRAP_FLAT.mockup : mockup,
      safe_zone_bounds: wrapPreview ? MUG_WRAP_FLAT.safe_zone_bounds : safe,
      wrap: wrapPreview,
    },
  ];

  const extraIds = formData.getAll("extra_id").map(String);
  const extraLabels = formData.getAll("extra_label").map(String);
  const extraExisting = formData.getAll("extra_existing").map(String);
  const extraFiles = formData.getAll("extra_mockup");
  const extraLeft = formData.getAll("extra_left").map(Number);
  const extraTop = formData.getAll("extra_top").map(Number);
  const extraWidth = formData.getAll("extra_width").map(Number);
  const extraHeight = formData.getAll("extra_height").map(Number);

  for (let index = 0; index < extraLabels.length; index += 1) {
    const extraFile = extraFiles[index];
    let extraMockup = extraExisting[index] || "";
    if (extraFile instanceof File && extraFile.size > 0) {
      extraMockup = await uploadViewFile(slug, extraFile);
    }
    if (!extraMockup) continue;
    views.push({
      id: extraIds[index] || `side-${index + 2}`,
      label: extraLabels[index] || `Side ${index + 2}`,
      mockup: extraMockup,
      safe_zone_bounds: {
        left: extraLeft[index] || safe.left,
        top: extraTop[index] || safe.top,
        width: extraWidth[index] || safe.width,
        height: extraHeight[index] || safe.height,
      },
    });
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
    safe_zone_bounds: safe,
    mockup,
    accent: (["pink", "orange", "teal"].includes(String(formData.get("accent")))
      ? formData.get("accent")
      : "teal") as Product["accent"],
    showSafeZone: formData.get("showSafeZone") === "on",
    archived: formData.get("archived") === "on",
    wrapPreview,
    mugPhoto,
    wrapTemplate,
    views,
  };
}

async function uploadViewFile(slug: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  return savePublicUpload(
    "products",
    `${slug}-${Date.now()}-${Math.round(Math.random() * 999)}.${ext}`,
    Buffer.from(await file.arrayBuffer()),
    file.type || undefined,
  );
}

export async function createProduct(formData: FormData) {
  try {
    const product = await productFromForm(formData);
    const existing = await getCatalogProduct(product.slug);
    if (existing) {
      redirect(
        `/admin/products/new?error=${encodeURIComponent("That slug already exists. Pick another name.")}`,
      );
    }
    const saved = await upsertProduct(product);
    revalidateProductPages(saved.slug);
    redirect(`/admin/products/${saved.slug}?saved=1`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    const message = error instanceof Error ? error.message : "Could not create product";
    redirect(`/admin/products/new?error=${encodeURIComponent(message)}`);
  }
}

export async function updateProduct(formData: FormData) {
  try {
    const originalSlug = String(formData.get("originalSlug") || "");
    const current = await getCatalogProduct(originalSlug);
    const product = await productFromForm(formData, current);
    if (originalSlug && originalSlug !== product.slug) {
      await upsertProduct(product);
      await deleteProduct(originalSlug);
      revalidateProductPages(originalSlug);
    } else {
      await upsertProduct(product);
    }
    revalidateProductPages(product.slug);
    redirect(`/admin/products/${product.slug}?saved=1`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    const slug = String(formData.get("originalSlug") || "new");
    const message = error instanceof Error ? error.message : "Could not update product";
    redirect(`/admin/products/${slug}?error=${encodeURIComponent(message)}`);
  }
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function removeProduct(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  if (slug) {
    await deleteProduct(slug);
    revalidateProductPages(slug);
  }
  redirect("/admin/products");
}

function revalidateProductPages(slug: string) {
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${slug}`);
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath(`/customize/${slug}`);
}
