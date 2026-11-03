import { readFile, writeFile } from "fs/promises";
import path from "path";
import { SEED_PRODUCTS, type Product } from "@/lib/products";
import type { InquiryRecord } from "@/lib/inquiry-types";

const isProduction = process.env.NODE_ENV === "production";
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function ensureDirs() {
  if (isProduction) return; // Skip directory creation on Vercel read-only filesystem
  try {
    const { mkdir } = await import("fs/promises");
    await mkdir(DATA_DIR, { recursive: true });
    await mkdir(path.join(UPLOADS_DIR, "orders"), { recursive: true });
    await mkdir(path.join(UPLOADS_DIR, "products"), { recursive: true });
  } catch {
    // Ignore file system errors in production
  }
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
  if (isProduction) return; // Cannot write to disk on Vercel serverless
  try {
    await ensureDirs();
    await writeFile(file, JSON.stringify(value, null, 2), "utf8");
  } catch {
    // Ignore write errors in production
  }
}

export async function getCatalog(): Promise<Product[]> {
  const stored = await readJson<Product[] | null>(CATALOG_FILE, null);
  if (!stored || stored.length === 0) {
    return SEED_PRODUCTS;
  }
  return stored;
}

export async function getLiveCatalog() {
  return (await getCatalog()).filter((product) => !product.archived);
}

export async function getCatalogProduct(slug: string) {
  return (await getCatalog()).find((product) => product.slug === slug);
}

export async function saveCatalog(products: Product[]) {
  await writeJson(CATALOG_FILE, products);
}

export async function upsertProduct(product: Product) {
  const catalog = await getCatalog();
  const index = catalog.findIndex((item) => item.slug === product.slug);
  if (index >= 0) catalog[index] = product;
  else catalog.push(product);
  await saveCatalog(catalog);
  return product;
}

export async function deleteProduct(slug: string) {
  const catalog = await getCatalog();
  await saveCatalog(catalog.filter((item) => item.slug !== slug));
}

export async function listOrders(): Promise<InquiryRecord[]> {
  const orders = await readJson<InquiryRecord[]>(ORDERS_FILE, []);
  return orders.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function getOrder(id: string) {
  return (await listOrders()).find((order) => order.id === id);
}

export async function saveOrder(order: InquiryRecord) {
  if (isProduction) return order; // Supabase handles orders in production
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

export async function savePublicUpload(
  folder: "orders" | "products",
  filename: string,
  bytes: Buffer,
) {
  if (isProduction) {
    throw new Error("Local file system uploads are disabled in production. Use Supabase Storage.");
  }
  await ensureDirs();
  const relative = `/uploads/${folder}/${filename}`;
  const full = path.join(process.cwd(), "public", relative);
  const { mkdir, writeFile } = await import("fs/promises");
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes);
  return relative;
}

export function uploadsDir() {
  return UPLOADS_DIR;
}