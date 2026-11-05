import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import { SEED_PRODUCTS, type Product } from "@/lib/products";
import type { InquiryRecord } from "@/lib/inquiry-types";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const UPLOADS_BUCKET = "uploads";

function useSupabase() {
  return isSupabaseConfigured();
}

function requireServiceRole() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Set SUPABASE_SERVICE_ROLE_KEY in Vercel (Project → Settings → Environment Variables) using the service_role key from Supabase → Settings → API.",
    );
  }
}

async function ensureLocalDirs() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(path.join(UPLOADS_DIR, "orders"), { recursive: true });
  await mkdir(path.join(UPLOADS_DIR, "products"), { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await ensureLocalDirs();
  await writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

type SafeZonePayload = Product["safe_zone_bounds"] & {
  tagline?: string;
  materials?: string[];
  defaultMaterial?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  accent?: Product["accent"];
  showSafeZone?: boolean;
};

function rowToProduct(row: Record<string, unknown>): Product {
  const bounds = (row.safe_zone_bounds ?? {}) as SafeZonePayload;
  const materials = Array.isArray(row.materials)
    ? (row.materials as string[])
    : Array.isArray(bounds.materials)
      ? bounds.materials
      : [];

  return {
    slug: String(row.slug),
    name: String(row.title ?? row.name ?? ""),
    category: row.category as Product["category"],
    tagline: String(row.tagline ?? bounds.tagline ?? ""),
    description: String(row.description ?? ""),
    is_laser_cut: Boolean(row.is_laser_cut),
    materials: materials.length ? materials : ["Standard"],
    defaultMaterial: String(row.default_material ?? bounds.defaultMaterial ?? materials[0] ?? "Standard"),
    canvasWidth: Number(row.canvas_width ?? bounds.canvasWidth ?? 800),
    canvasHeight: Number(row.canvas_height ?? bounds.canvasHeight ?? 800),
    safe_zone_bounds: {
      left: Number(bounds.left ?? 200),
      top: Number(bounds.top ?? 200),
      width: Number(bounds.width ?? 400),
      height: Number(bounds.height ?? 400),
    },
    mockup: String(row.base_image_url ?? row.mockup ?? ""),
    accent: (row.accent as Product["accent"]) || bounds.accent || "teal",
    showSafeZone: row.show_safe_zone !== false && bounds.showSafeZone !== false,
    archived: Boolean(row.archived) || row.is_active === false,
  };
}

function productToRow(product: Product) {
  // Matches the live Supabase table: title, base_image_url, is_active (not name/mockup/archived).
  const safe_zone_bounds: SafeZonePayload = {
    ...product.safe_zone_bounds,
    tagline: product.tagline,
    materials: product.materials,
    defaultMaterial: product.defaultMaterial,
    canvasWidth: product.canvasWidth,
    canvasHeight: product.canvasHeight,
    accent: product.accent,
    showSafeZone: product.showSafeZone !== false,
  };

  return {
    slug: product.slug,
    title: product.name,
    category: product.category,
    description: product.description,
    base_image_url: product.mockup,
    overlay_image_url: null,
    safe_zone_bounds,
    is_laser_cut: product.is_laser_cut,
    is_active: !product.archived,
  };
}

function tableMissing(error: { message?: string; code?: string } | null) {
  const message = error?.message ?? "";
  return (
    error?.code === "42P01" ||
    /could not find the table/i.test(message) ||
    /relation .* does not exist/i.test(message)
  );
}

async function seedRemoteCatalog() {
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").upsert(
    SEED_PRODUCTS.map((product) => productToRow(product)),
    { onConflict: "slug" },
  );
  if (error) {
    throw new Error(
      tableMissing(error)
        ? "The products table is missing in Supabase. Run supabase/schema.sql (or supabase/products.sql) in the SQL editor, then try again."
        : `Could not seed catalog: ${error.message}`,
    );
  }
}

export async function getCatalog(): Promise<Product[]> {
  noStore();
  if (useSupabase()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      if (tableMissing(error)) return SEED_PRODUCTS;
      throw new Error(error.message);
    }
    if (!data || data.length === 0) {
      try {
        await seedRemoteCatalog();
        const { data: seeded, error: seedReadError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: true });
        if (!seedReadError && seeded && seeded.length > 0) {
          return seeded.map((row) => rowToProduct(row as Record<string, unknown>));
        }
      } catch {
        /* table may still be missing write permission */
      }
      return SEED_PRODUCTS;
    }
    return data.map((row) => rowToProduct(row as Record<string, unknown>));
  }

  const stored = await readJson<Product[] | null>(CATALOG_FILE, null);
  if (!stored || stored.length === 0) return SEED_PRODUCTS;
  return stored;
}

export async function getLiveCatalog() {
  return (await getCatalog()).filter((product) => !product.archived);
}

export async function getCatalogProduct(slug: string) {
  noStore();
  if (useSupabase()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
    if (error) {
      if (tableMissing(error)) {
        return SEED_PRODUCTS.find((product) => product.slug === slug);
      }
      throw new Error(error.message);
    }
    if (!data) {
      const catalog = await getCatalog();
      return catalog.find((product) => product.slug === slug);
    }
    return rowToProduct(data as Record<string, unknown>);
  }
  return (await getCatalog()).find((product) => product.slug === slug);
}

export async function saveCatalog(products: Product[]) {
  if (useSupabase()) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("products").upsert(products.map(productToRow), {
      onConflict: "slug",
    });
    if (error) throw new Error(`Could not save catalog: ${error.message}`);
    return;
  }
  await writeJson(CATALOG_FILE, products);
}

export async function upsertProduct(product: Product) {
  if (useSupabase()) {
    requireServiceRole();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .upsert(productToRow(product), { onConflict: "slug" })
      .select("*")
      .single();
    if (error) {
      throw new Error(
        tableMissing(error)
          ? "The products table is missing in Supabase. Run supabase/schema.sql (or supabase/products.sql) in the SQL editor."
          : `Could not save product: ${error.message}`,
      );
    }
    return data ? rowToProduct(data as Record<string, unknown>) : product;
  }
  const catalog = await getCatalog();
  const index = catalog.findIndex((item) => item.slug === product.slug);
  if (index >= 0) catalog[index] = product;
  else catalog.push(product);
  await saveCatalog(catalog);
  return product;
}

export async function deleteProduct(slug: string) {
  if (useSupabase()) {
    requireServiceRole();
    const supabase = createAdminClient();
    const { error } = await supabase.from("products").delete().eq("slug", slug);
    if (error) throw new Error(`Could not delete product: ${error.message}`);
    return;
  }
  const catalog = await getCatalog();
  await saveCatalog(catalog.filter((item) => item.slug !== slug));
}

function normalizeInquiry(row: Record<string, unknown>): InquiryRecord {
  const paths = row.production_paths;
  return {
    ...(row as unknown as InquiryRecord),
    production_paths: Array.isArray(paths)
      ? paths.filter((path): path is string => typeof path === "string")
      : [],
  };
}

export async function listOrders(): Promise<InquiryRecord[]> {
  if (useSupabase()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => normalizeInquiry(row as Record<string, unknown>));
  }
  const orders = await readJson<InquiryRecord[]>(ORDERS_FILE, []);
  return orders.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function getOrder(id: string) {
  if (useSupabase()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("inquiries").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? normalizeInquiry(data as Record<string, unknown>) : undefined;
  }
  return (await listOrders()).find((order) => order.id === id);
}

export async function saveOrder(order: InquiryRecord) {
  if (useSupabase()) {
    requireServiceRole();
    const supabase = createAdminClient();
    const { error } = await supabase.from("inquiries").upsert(order);
    if (error) throw new Error(error.message);
    return order;
  }
  const orders = await listOrders();
  const index = orders.findIndex((item) => item.id === order.id);
  if (index >= 0) orders[index] = order;
  else orders.unshift(order);
  await writeJson(ORDERS_FILE, orders);
  return order;
}

export async function nextReferenceCode() {
  const orders = await listOrders();
  const nums = orders.map((order) => {
    const match = order.reference_code.replace("#", "").match(/BOO-(\d+)/);
    return match ? Number(match[1]) : 0;
  });
  const next = Math.max(1003, ...nums) + 1;
  return `BOO-${next}`;
}

function contentTypeFor(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "svg") return "image/svg+xml";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "application/octet-stream";
}

async function ensureUploadsBucket() {
  const supabase = createAdminClient();
  const { data } = await supabase.storage.getBucket(UPLOADS_BUCKET);
  if (data) return;
  const { error } = await supabase.storage.createBucket(UPLOADS_BUCKET, {
    public: true,
    fileSizeLimit: "15MB",
  });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(
      `Could not create the "${UPLOADS_BUCKET}" storage bucket: ${error.message}. Create a public bucket named "${UPLOADS_BUCKET}" in Supabase Storage.`,
    );
  }
}

export async function savePublicUpload(
  folder: "orders" | "products",
  filename: string,
  bytes: Buffer,
  contentType?: string,
) {
  if (useSupabase()) {
    requireServiceRole();
    const supabase = createAdminClient();
    await ensureUploadsBucket();
    const filePath = `${folder}/${filename}`;
    const type = contentType || contentTypeFor(filename);
    let { error: uploadError } = await supabase.storage
      .from(UPLOADS_BUCKET)
      .upload(filePath, bytes, { contentType: type, upsert: true });

    if (uploadError && /bucket/i.test(uploadError.message) && /not found/i.test(uploadError.message)) {
      await ensureUploadsBucket();
      const retry = await supabase.storage
        .from(UPLOADS_BUCKET)
        .upload(filePath, bytes, { contentType: type, upsert: true });
      uploadError = retry.error;
    }

    if (uploadError) {
      throw new Error(`Supabase storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }

  await ensureLocalDirs();
  const relative = `/uploads/${folder}/${filename}`;
  const full = path.join(process.cwd(), "public", relative);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes);
  return relative;
}

export async function deleteStoredFile(fileUrl: string) {
  if (!fileUrl) return;
  if (useSupabase() && fileUrl.includes("/storage/v1/object/public/uploads/")) {
    const pathPart = fileUrl.split("/storage/v1/object/public/uploads/")[1];
    if (!pathPart) return;
    const supabase = createAdminClient();
    await supabase.storage.from(UPLOADS_BUCKET).remove([pathPart]);
    return;
  }
  if (fileUrl.startsWith("/uploads/")) {
    try {
      const { unlink } = await import("fs/promises");
      await unlink(path.join(process.cwd(), "public", fileUrl));
    } catch {
      /* already gone */
    }
  }
}

export function uploadsDir() {
  return UPLOADS_DIR;
}
