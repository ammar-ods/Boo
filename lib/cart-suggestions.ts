import type { CartItem } from "@/lib/cart";
import type { Bundle } from "@/lib/bundles";
import { normalizeCategoryId, sellingPrice, type Product } from "@/lib/products";
import type { CatalogSection, CmsPage, SiteSection } from "@/lib/site";

export const FREE_SHIP_SUGGEST_WINDOW = 200;
const LIMIT = 4;
const RELATED_MIN = 40;

const THEMES: string[][] = [
  ["wall", "decor", "ديكور", "frame", "poster", "لوحة", "برواز"],
  ["baby", "newborn", "sebou", "سبوع", "اطفال", "أطفال", "طفل", "مولود"],
  ["ramadan", "رمضان", "فوانيس", "فانوس"],
  ["eid", "عيد"],
  ["gift", "هدايا", "هدية", "bundle"],
  ["apparel", "tee", "shirt", "ملابس", "تيشيرت"],
  ["drink", "mug", "tumbler", "cup", "مشروبات", "مج"],
  ["wood", "laser", "coaster", "خشب", "كوستر"],
  ["engage", "katb", "كتاب", "خطوبة", "wedding"],
];

const STOP = new Set([
  "the",
  "and",
  "with",
  "for",
  "from",
  "this",
  "that",
  "your",
  "على",
  "من",
  "في",
  "مع",
  "أو",
  "الى",
  "إلى",
]);

export type SuggestContext = {
  pages?: CmsPage[];
  homeSections?: SiteSection[];
  catalogSections?: CatalogSection[];
};

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

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOP.has(token));
}

function productText(product: Pick<Product, "slug" | "name" | "nameAr" | "category" | "tagline" | "taglineAr">) {
  return [product.slug.replace(/-/g, " "), product.category, product.name, product.nameAr, product.tagline, product.taglineAr]
    .filter(Boolean)
    .join(" ");
}

function tokensOf(product: Pick<Product, "slug" | "name" | "nameAr" | "category" | "tagline" | "taglineAr">, extra = "") {
  return new Set(tokenize(`${productText(product)} ${extra}`));
}

function themeHits(tokens: Set<string>) {
  return THEMES.filter((group) => group.some((word) => tokens.has(word) || [...tokens].some((token) => token.includes(word))));
}

function shelfFamilies(pages: CmsPage[] = [], homeSections: SiteSection[] = []) {
  const sections = [...homeSections, ...pages.flatMap((page) => page.sections ?? [])];
  return sections
    .filter((section) => section.type === "products")
    .map((section) => (section.content.productSlugs ?? []).filter(Boolean))
    .filter((slugs) => slugs.length > 1);
}

function sectionText(id: string, sections: CatalogSection[] = []) {
  const row = sections.find((section) => section.id === id || normalizeCategoryId(section.id) === id);
  if (!row) return id;
  return `${row.id} ${row.label?.ar ?? ""} ${row.label?.en ?? ""}`;
}

function similarity(
  product: Product,
  cartProducts: Product[],
  families: string[][],
  catalogSections: CatalogSection[],
) {
  if (!cartProducts.length) return 0;
  const category = normalizeCategoryId(product.category);
  const extra = sectionText(category, catalogSections);
  const productTokens = tokensOf(product, extra);
  const productThemes = themeHits(productTokens);
  const materials = new Set((product.materials ?? []).map((item) => item.toLowerCase()));
  let score = 0;

  for (const other of cartProducts) {
    const otherCat = normalizeCategoryId(other.category);
    if (category && otherCat && category === otherCat) score += 100;
    const otherTokens = tokensOf(other, sectionText(otherCat, catalogSections));
    let overlap = 0;
    for (const token of productTokens) {
      if (otherTokens.has(token)) overlap += 1;
    }
    score += overlap * 14;
    const otherThemes = themeHits(otherTokens);
    if (productThemes.some((group) => otherThemes.includes(group))) score += 50;
    const sharedMaterial = (other.materials ?? []).some((item) => materials.has(item.toLowerCase()));
    if (sharedMaterial) score += 6;
  }

  for (const family of families) {
    const cartIn = cartProducts.some((item) => family.includes(item.slug));
    if (cartIn && family.includes(product.slug)) score += 90;
  }

  return score;
}

function asCatalogStandIn(item: CartItem): Product {
  return {
    slug: item.slug,
    name: item.name,
    nameAr: item.nameAr,
    category: "",
    tagline: "",
    taglineAr: "",
    description: "",
    descriptionAr: "",
    is_laser_cut: false,
    materials: [],
    colors: [],
    defaultMaterial: "",
    canvasWidth: 0,
    canvasHeight: 0,
    safe_zone_bounds: { left: 0, top: 0, width: 0, height: 0 },
    mockup: item.image,
    accent: "teal",
    priceEgp: item.priceEgp,
  };
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
  pinnedSlugs = [],
  context,
}: {
  products: Product[];
  items: CartItem[];
  bundles?: Bundle[];
  remaining: number;
  pinnedSlugs?: string[];
  context?: SuggestContext;
}) {
  const exclude = cartSlugs(items, bundles);
  const available = products.filter((product) => !product.archived && !exclude.has(product.slug));
  const fromCatalog = products.filter((product) => exclude.has(product.slug));
  const cartProducts =
    fromCatalog.length > 0
      ? fromCatalog
      : items.filter((item) => item.kind !== "bundle").map(asCatalogStandIn);
  const nearFreeShip = remaining > 0 && remaining <= FREE_SHIP_SUGGEST_WINDOW;
  const inRange = (product: Product) => {
    const price = sellingPrice(product);
    return price > 0 && price <= remaining;
  };
  const pool = nearFreeShip ? available.filter(inRange) : available;
  const pinned = pinnedSlugs
    .map((slug) => pool.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));
  const leftover = pool.filter((product) => !pinned.some((item) => item.slug === product.slug));
  if (!pinned.length && !leftover.length) return { products: [] as Product[], nearFreeShip };
  if (!cartProducts.length) return { products: pinned.slice(0, LIMIT), nearFreeShip };

  const families = shelfFamilies(context?.pages, context?.homeSections);
  const catalogSections = context?.catalogSections ?? [];
  const ranked = leftover
    .map((product) => ({ product, score: similarity(product, cartProducts, families, catalogSections) }))
    .filter((row) => row.score >= RELATED_MIN)
    .sort((a, b) => b.score - a.score || sellingPrice(a.product) - sellingPrice(b.product))
    .map((row) => row.product);

  const merged = [...pinned, ...ranked.filter((product) => !pinned.some((item) => item.slug === product.slug))];
  return { products: merged.slice(0, LIMIT), nearFreeShip };
}
