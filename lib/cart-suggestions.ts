import type { CartItem } from "@/lib/cart";
import type { Bundle } from "@/lib/bundles";
import { normalizeCategoryId, sellingPrice, type Product } from "@/lib/products";

export const FREE_SHIP_SUGGEST_WINDOW = 200;
const LIMIT = 4;

function cartSlugs(items: CartItem[], bundles: Bundle[]) {
  const slugs = new Set<string>();
  for (const item of items) {
    slugs.add(item.slug);
    if (item.kind !== "bundle") continue;
    const bundle = bundles.find((row) => row.slug === item.slug);
    for (const slug of bundle?.productSlugs ?? []) slugs.add(slug);
  }
  return slugs;
}

function similarity(product: Product, cartProducts: Product[]) {
  if (!cartProducts.length) return 0;
  const category = normalizeCategoryId(product.category);
  const materials = new Set((product.materials ?? []).map((item) => item.toLowerCase()));
  let score = 0;
  for (const other of cartProducts) {
    if (normalizeCategoryId(other.category) === category && category) score += 8;
    if (other.is_laser_cut === product.is_laser_cut) score += 1;
    if ((other.customizable !== false) === (product.customizable !== false)) score += 1;
    const overlap = (other.materials ?? []).some((item) => materials.has(item.toLowerCase()));
    if (overlap) score += 3;
    const delta = Math.abs(sellingPrice(other) - sellingPrice(product));
    if (delta <= 50) score += 2;
    else if (delta <= 150) score += 1;
  }
  return score;
}

function rank(products: Product[], cartProducts: Product[], preferHigherPrice: boolean) {
  return [...products].sort((a, b) => {
    const byScore = similarity(b, cartProducts) - similarity(a, cartProducts);
    if (byScore) return byScore;
    return preferHigherPrice ? sellingPrice(b) - sellingPrice(a) : sellingPrice(a) - sellingPrice(b);
  });
}

export function remainingToFreeShipping(subtotal: number, freeShippingMin: number) {
  if (!freeShippingMin) return 0;
  return Math.max(0, freeShippingMin - subtotal);
}

export function suggestCartProducts({
  products,
  items,
  bundles = [],
  remaining,
}: {
  products: Product[];
  items: CartItem[];
  bundles?: Bundle[];
  remaining: number;
}) {
  const exclude = cartSlugs(items, bundles);
  const available = products.filter((product) => !product.archived && !exclude.has(product.slug));
  const cartProducts = products.filter((product) => exclude.has(product.slug));
  const nearFreeShip = remaining > 0 && remaining <= FREE_SHIP_SUGGEST_WINDOW;
  const pool = nearFreeShip
    ? available.filter((product) => {
        const price = sellingPrice(product);
        return price > 0 && price <= remaining;
      })
    : available;
  if (!pool.length) return { products: [] as Product[], nearFreeShip };

  const similar = pool.filter((product) => similarity(product, cartProducts) > 0);
  const rest = pool.filter((product) => similarity(product, cartProducts) === 0);
  const ordered = nearFreeShip
    ? [...rank(similar, cartProducts, true), ...rank(rest, cartProducts, true)]
    : similar.length
      ? rank(similar, cartProducts, false)
      : rank(rest, cartProducts, false);

  return { products: ordered.slice(0, LIMIT), nearFreeShip };
}
