import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import { MUG_WRAP_FLAT, productViews, SEED_PRODUCTS, type Product, type ProductView } from "@/lib/products";
import type { InquiryRecord } from "@/lib/inquiry-types";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, supabaseServiceKey } from "@/lib/supabase/env";
import { DEFAULT_SITE, migrateSite, type SiteDocument } from "@/lib/site";
import { SEED_BUNDLES, type Bundle } from "@/lib/bundles";

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
  try {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(value, null, 2), "utf8");
    return true;
  } catch {
    /* Vercel’s filesystem is read-only; keep serving in-memory data. */
    return false;
  }
}

type SafeZonePayload = Product["safe_zone_bounds"] & {
  tagline?: string;
  materials?: string[];
  defaultMaterial?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  accent?: Product["accent"];
  showSafeZone?: boolean;
  wrapPreview?: boolean;
  mugPhoto?: string;
  wrapTemplate?: string;
  views?: ProductView[];
};

function parseViews(
  bounds: SafeZonePayload,
  mockup: string,
  overlay: string | null,
  wrapPreview: boolean,
): ProductView[] | undefined {
  if (Array.isArray(bounds.views) && bounds.views.length > 0) {
    return bounds.views.map((view, index) => ({
      id: String(view.id || `view-${index + 1}`),
      label: String(view.label || `Side ${index + 1}`),
      mockup: String(view.mockup || mockup),
      safe_zone_bounds: {
        left: Number(view.safe_zone_bounds?.left ?? bounds.left ?? 200),
        top: Number(view.safe_zone_bounds?.top ?? bounds.top ?? 200),
        width: Number(view.safe_zone_bounds?.width ?? bounds.width ?? 400),
        height: Number(view.safe_zone_bounds?.height ?? bounds.height ?? 400),
      },
      wrap: Boolean(view.wrap),
      wrapBounds: view.wrapBounds,
    }));
  }
  if (overlay) {
    return [
      {
        id: "front",
        label: "Front",
        mockup,
        safe_zone_bounds: {
          left: Number(bounds.left ?? 200),
          top: Number(bounds.top ?? 200),
          width: Number(bounds.width ?? 400),
          height: Number(bounds.height ?? 400),
        },
        wrap: wrapPreview,
      },
      {
        id: "back",
        label: "Back",
        mockup: overlay,
        safe_zone_bounds: {
          left: Number(bounds.left ?? 200),
          top: Number(bounds.top ?? 200),
          width: Number(bounds.width ?? 400),
          height: Number(bounds.height ?? 400),
        },
      },
    ];
  }
  return undefined;
}

function rowToProduct(row: Record<string, unknown>): Product {
  const bounds = (row.safe_zone_bounds ?? {}) as SafeZonePayload;
  const materials = Array.isArray(row.materials)
    ? (row.materials as string[])
    : Array.isArray(bounds.materials)
      ? bounds.materials
      : [];
  const mockup = String(row.base_image_url ?? row.mockup ?? "");
  const overlay = row.overlay_image_url ? String(row.overlay_image_url) : null;
  const wrapPreview = Boolean(bounds.wrapPreview);
  const slug = String(row.slug);
  const seed = SEED_PRODUCTS.find((item) => item.slug === slug);
  let views = parseViews(bounds, mockup, overlay, wrapPreview);
  if ((!views || views.length === 0) && seed?.views) {
    views = seed.views.map((view, index) =>
      index === 0
        ? {
            ...view,
            mockup: wrapPreview ? MUG_WRAP_FLAT.mockup : mockup,
            wrap: wrapPreview || view.wrap,
          }
        : view,
    );
  }

  return {
    slug,
    name: String(row.title ?? row.name ?? seed?.name ?? ""),
    nameAr: String(row.name_ar ?? row.nameAr ?? seed?.nameAr ?? row.title ?? ""),
    category: (row.category as Product["category"]) || seed?.category || "Apparel",
    tagline: String(row.tagline ?? bounds.tagline ?? seed?.tagline ?? ""),
    taglineAr: String(row.tagline_ar ?? row.taglineAr ?? seed?.taglineAr ?? ""),
    description: String(row.description ?? seed?.description ?? ""),
    descriptionAr: String(row.description_ar ?? row.descriptionAr ?? seed?.descriptionAr ?? ""),
    is_laser_cut: Boolean(row.is_laser_cut),
    materials: materials.length ? materials : seed?.materials ?? ["Standard"],
    colors: Array.isArray(row.colors) ? (row.colors as string[]) : seed?.colors ?? materials,
    defaultMaterial: String(row.default_material ?? bounds.defaultMaterial ?? materials[0] ?? "Standard"),
    canvasWidth: Number(row.canvas_width ?? bounds.canvasWidth ?? 800),
    canvasHeight: Number(row.canvas_height ?? bounds.canvasHeight ?? 800),
    safe_zone_bounds: {
      left: Number(bounds.left ?? 200),
      top: Number(bounds.top ?? 200),
      width: Number(bounds.width ?? 400),
      height: Number(bounds.height ?? 400),
    },
    mockup,
    accent: (row.accent as Product["accent"]) || bounds.accent || "teal",
    showSafeZone: row.show_safe_zone !== false && bounds.showSafeZone !== false,
    archived: Boolean(row.archived) || row.is_active === false,
    wrapPreview,
    mugPhoto: bounds.mugPhoto ? String(bounds.mugPhoto) : wrapPreview ? mockup : undefined,
    wrapTemplate: bounds.wrapTemplate ? String(bounds.wrapTemplate) : undefined,
    views,
    priceEgp: Number(row.price_egp ?? row.priceEgp ?? seed?.priceEgp ?? 100),
    customizable: row.customizable !== false,
  };
}

function productToRow(product: Product) {
  const views = product.views?.length ? product.views : productViews(product);
  const catalogImage = product.mugPhoto || product.mockup;
  const safe_zone_bounds: SafeZonePayload = {
    ...product.safe_zone_bounds,
    tagline: product.tagline,
    materials: product.materials,
    defaultMaterial: product.defaultMaterial,
    canvasWidth: product.canvasWidth,
    canvasHeight: product.canvasHeight,
    accent: product.accent,
    showSafeZone: product.showSafeZone !== false,
    wrapPreview: Boolean(product.wrapPreview),
    mugPhoto: product.mugPhoto,
    wrapTemplate: product.wrapTemplate,
    views,
  };

  return {
    slug: product.slug,
    title: product.name,
    name_ar: product.nameAr,
    category: product.category,
    description: product.description,
    description_ar: product.descriptionAr,
    colors: product.colors,
    price_egp: product.priceEgp,
    base_image_url: catalogImage,
    overlay_image_url: views[1]?.mockup || null,
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

function canUseSeedFallback(error: { message?: string; code?: string } | null) {
  const message = error?.message ?? "";
  return tableMissing(error) || /invalid api key/i.test(message) || /jwt/i.test(message);
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

const RETIRED_SLUGS = new Set([
  "classic-tee",
  "studio-hoodie",
  "ceramic-mug",
  "wood-plaque",
  "wood-keychain",
  "acrylic-medal",
  "acrylic-standee",
  "vinyl-sticker-sheet",
  "die-cut-sticker",
]);

export async function getCatalog(): Promise<Product[]> {
  noStore();
  if (useSupabase()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) {
        if (canUseSeedFallback(error)) return SEED_PRODUCTS;
        return SEED_PRODUCTS;
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
    } catch {
      return SEED_PRODUCTS;
    }
  }

  const stored = await readJson<Product[] | null>(CATALOG_FILE, null);
  const stale =
    !stored ||
    stored.length === 0 ||
    (stored.some((item) => RETIRED_SLUGS.has(item.slug)) &&
      !stored.some((item) => item.slug === "white-tee"));
  if (stale) {
    await writeJson(CATALOG_FILE, SEED_PRODUCTS);
    return SEED_PRODUCTS;
  }
  return stored;
}

export async function getLiveCatalog() {
  return (await getCatalog()).filter((product) => !product.archived && !RETIRED_SLUGS.has(product.slug));
}

export async function getCatalogProduct(slug: string) {
  noStore();
  if (useSupabase()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
    if (error) {
      if (canUseSeedFallback(error)) {
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

export function asFileList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
      }
    } catch {
      return [value];
    }
  }
  return [];
}

function normalizeInquiry(row: Record<string, unknown>): InquiryRecord {
  return {
    ...(row as unknown as InquiryRecord),
    id: String(row.id ?? ""),
    reference_code: String(row.reference_code ?? ""),
    mockup_path: row.mockup_path ? String(row.mockup_path) : null,
    production_paths: asFileList(row.production_paths),
  };
}

let memoryOrders: InquiryRecord[] = [];

function sortOrders(orders: InquiryRecord[]) {
  return [...orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function mergeOrders(...lists: InquiryRecord[][]) {
  const map = new Map<string, InquiryRecord>();
  for (const list of lists) {
    for (const order of list) {
      if (!order?.id) continue;
      map.set(order.id, order);
    }
  }
  return sortOrders([...map.values()]);
}

function orderToRow(order: InquiryRecord) {
  return {
    id: order.id,
    reference_code: order.reference_code,
    product_slug: order.product_slug,
    product_name: order.product_name,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    material: order.material,
    quantity: order.quantity,
    notes: order.notes,
    status: order.status,
    quoted_price: order.quoted_price,
    mockup_path: order.mockup_path || "",
    production_paths: order.production_paths ?? [],
    canvas_json: order.canvas_json ?? null,
    created_at: order.created_at,
    updated_at: order.updated_at,
    cleanup_requested_at: order.cleanup_requested_at,
  };
}

export async function listOrders(): Promise<InquiryRecord[]> {
  noStore();
  const local = await readJson<InquiryRecord[]>(ORDERS_FILE, []);
  let remote: InquiryRecord[] = [];
  if (useSupabase()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      if (!canUseSeedFallback(error) && !tableMissing(error)) {
        throw new Error(`Could not load orders: ${error.message}`);
      }
    } else {
      remote = (data ?? []).map((row) => normalizeInquiry(row as Record<string, unknown>));
    }
  }
  return mergeOrders(memoryOrders, local, remote);
}

export async function getOrder(id: string) {
  const key = decodeURIComponent(id).trim();
  const ref = key.startsWith("#") ? key : `#${key.replace(/^#/, "")}`;
  const match = (order: InquiryRecord) =>
    order.id === key || order.reference_code === ref || order.reference_code === key;

  if (useSupabase()) {
    try {
      const supabase = createAdminClient();
      const byId = await supabase.from("inquiries").select("*").eq("id", key).maybeSingle();
      if (byId.data) return normalizeInquiry(byId.data as Record<string, unknown>);
      if (byId.error && !canUseSeedFallback(byId.error)) throw new Error(byId.error.message);
      const byRef = await supabase.from("inquiries").select("*").eq("reference_code", ref).maybeSingle();
      if (byRef.data) return normalizeInquiry(byRef.data as Record<string, unknown>);
      const byBare = await supabase.from("inquiries").select("*").eq("reference_code", key).maybeSingle();
      if (byBare.data) return normalizeInquiry(byBare.data as Record<string, unknown>);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!/invalid api key/i.test(message) && !/jwt/i.test(message) && !/service_role/i.test(message)) {
        throw error;
      }
    }
  }
  const orders = await listOrders();
  return orders.find(match);
}

export function orderAssetUrls(order: InquiryRecord) {
  const urls = new Set<string>();
  if (order.mockup_path) urls.add(order.mockup_path);
  for (const path of order.production_paths ?? []) {
    if (path) urls.add(path);
  }
  const payload = (order.canvas_json ?? {}) as {
    views?: { url?: string }[];
    uploads?: { url?: string }[];
    payment?: { receiptUrl?: string };
  };
  for (const view of payload.views ?? []) {
    if (view.url) urls.add(view.url);
  }
  for (const file of payload.uploads ?? []) {
    if (file.url) urls.add(file.url);
  }
  if (payload.payment?.receiptUrl) urls.add(payload.payment.receiptUrl);
  return [...urls];
}

export async function deleteOrder(id: string) {
  const order = await getOrder(id);
  if (!order) throw new Error("Order not found");

  memoryOrders = memoryOrders.filter((item) => item.id !== order.id);
  const local = await readJson<InquiryRecord[]>(ORDERS_FILE, []);
  await writeJson(
    ORDERS_FILE,
    local.filter((item) => item.id !== order.id && item.reference_code !== order.reference_code),
  );

  if (useSupabase()) {
    try {
      if (!supabaseServiceKey()) {
        throw new Error("Set SUPABASE_SERVICE_ROLE_KEY so orders can be deleted from the dashboard.");
      }
      const supabase = createAdminClient();
      const { error } = await supabase.from("inquiries").delete().eq("id", order.id);
      if (error) throw new Error(`Could not delete order: ${error.message}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!/invalid api key/i.test(message) && !/jwt/i.test(message) && !/service_role/i.test(message)) {
        throw error;
      }
    }
  }

  for (const file of orderAssetUrls(order)) {
    await deleteStoredFile(file);
  }

  return order.id;
}

export async function saveOrder(order: InquiryRecord) {
  memoryOrders = mergeOrders(memoryOrders, [order]);
  const local = await readJson<InquiryRecord[]>(ORDERS_FILE, []);
  const wroteLocal = await writeJson(ORDERS_FILE, mergeOrders(local, memoryOrders, [order]));

  if (useSupabase()) {
    if (!supabaseServiceKey()) {
      throw new Error(
        "Set SUPABASE_SERVICE_ROLE_KEY so checkout orders can be saved and shown in the admin dashboard.",
      );
    }
    const supabase = createAdminClient();
    const row = orderToRow(order);
    const { error } = await supabase.from("inquiries").upsert(row, { onConflict: "id" });
    if (error) {
      const retry = await supabase.from("inquiries").insert(row);
      if (retry.error) {
        throw new Error(
          tableMissing(retry.error)
            ? "The inquiries table is missing in Supabase. Run supabase/schema.sql in the SQL editor, then try checkout again."
            : `Could not save order: ${retry.error.message}`,
        );
      }
    }
  } else if (!wroteLocal) {
    throw new Error("Could not save this order. Configure Supabase so orders persist.");
  }
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
  const type = contentType || contentTypeFor(filename);
  if (useSupabase()) {
    try {
      const supabase = createAdminClient();
      await ensureUploadsBucket();
      const filePath = `${folder}/${filename}`;
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

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
    } catch {
      /* fall through to disk / data URL */
    }
  }

  try {
    await ensureLocalDirs();
    const relative = `/uploads/${folder}/${filename}`;
    const full = path.join(process.cwd(), "public", relative);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, bytes);
    return relative;
  } catch {
    return `data:${type};base64,${bytes.toString("base64")}`;
  }
}

export async function persistOrderMedia(url: string, filename: string) {
  if (!url) return "";
  if (url.startsWith("/uploads/") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (!url.startsWith("data:")) return url;
  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return url;
  const buffer = Buffer.from(match[2], "base64");
  const ext = contentTypeFor(filename).includes("png") ? "png" : filename.split(".").pop() || "jpg";
  return savePublicUpload("orders", `${Date.now()}-${filename.replace(/[^\w.-]+/g, "") || `file.${ext}`}`, buffer, match[1]);
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

const SITE_FILE = path.join(DATA_DIR, "site.json");
const BUNDLES_FILE = path.join(DATA_DIR, "bundles.json");

let memorySite: SiteDocument | null = null;
const SITE_OBJECT = "cms/site.json";

export type SitePersist = "supabase" | "local" | "memory";

async function readRemoteSite(): Promise<unknown | null> {
  if (!useSupabase()) return null;
  try {
    const supabase = createAdminClient();
    const table = await supabase.from("site_content").select("document").eq("id", "default").maybeSingle();
    if (!table.error && table.data?.document) return table.data.document;
  } catch {
    /* table may not exist yet */
  }
  try {
    const supabase = createAdminClient();
    const file = await supabase.storage.from(UPLOADS_BUCKET).download(SITE_OBJECT);
    if (file.data) return JSON.parse(await file.data.text());
  } catch {
    return null;
  }
  return null;
}

async function writeRemoteSite(document: SiteDocument) {
  if (!useSupabase()) return false;
  try {
    const supabase = createAdminClient();
    const table = await supabase.from("site_content").upsert({
      id: "default",
      document,
      updated_at: new Date().toISOString(),
    });
    const payload = Buffer.from(JSON.stringify(document), "utf8");
    await ensureUploadsBucket();
    const uploaded = await supabase.storage
      .from(UPLOADS_BUCKET)
      .upload(SITE_OBJECT, payload, { contentType: "application/json", upsert: true });
    return !table.error || !uploaded.error;
  } catch {
    return false;
  }
}

export async function getSite() {
  noStore();
  const remote = await readRemoteSite();
  if (remote) {
    const migrated = migrateSite(remote);
    memorySite = migrated;
    return migrated;
  }
  if (memorySite) return memorySite;
  const stored = await readJson<unknown>(SITE_FILE, null);
  if (!stored) return DEFAULT_SITE;
  const migrated = migrateSite(stored);
  if (!migrated.sections.length) return DEFAULT_SITE;
  return migrated;
}

export async function saveSite(site: SiteDocument): Promise<{ site: SiteDocument; persist: SitePersist }> {
  const migrated = migrateSite(site);
  memorySite = migrated;
  const wroteLocal = await writeJson(SITE_FILE, migrated);
  if (await writeRemoteSite(migrated)) {
    return { site: migrated, persist: "supabase" };
  }
  return { site: migrated, persist: wroteLocal ? "local" : "memory" };
}

export async function getBundles() {
  noStore();
  const stored = await readJson<Bundle[] | null>(BUNDLES_FILE, null);
  if (!stored?.length) {
    await writeJson(BUNDLES_FILE, SEED_BUNDLES);
    return SEED_BUNDLES;
  }
  return stored;
}
