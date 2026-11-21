import type { InquiryRecord } from "@/lib/inquiry-types";
import { orderLineItems } from "@/lib/order-view";
import type { Product } from "@/lib/products";

export type FinanceSale = {
  id: string;
  lineKey?: string;
  source: "order" | "manual";
  orderId?: string;
  orderRef?: string;
  productSlug: string;
  productName: string;
  date: string;
  quantity: number;
  revenue: number;
  cost: number | null;
  notes?: string;
  createdAt: string;
};

export type SpendingType = "material" | "operational";

export type FinanceSpending = {
  id: string;
  date: string;
  type: SpendingType;
  category: string;
  amount: number;
  notes?: string;
};

export type FinanceAsset = {
  id: string;
  name: string;
  cost: number;
  date: string;
  notes?: string;
};

export type SpendingCategory = {
  id: string;
  label: string;
  type: SpendingType;
};

export type FinanceSettings = {
  startingCapital: number;
  productCosts: Record<string, number>;
  spendingCategories: SpendingCategory[];
};

export type FinanceDocument = {
  sales: FinanceSale[];
  spendings: FinanceSpending[];
  assets: FinanceAsset[];
  settings: FinanceSettings;
  ignoredLineKeys: string[];
};

export const CUSTOM_PRODUCT_SLUG = "custom";

export const DEFAULT_SPENDING_CATEGORIES: SpendingCategory[] = [
  { id: "inventory", label: "Inventory", type: "material" },
  { id: "packaging", label: "Packaging", type: "material" },
  { id: "raw-materials", label: "Raw materials", type: "material" },
  { id: "shipping-supplies", label: "Shipping supplies", type: "material" },
  { id: "rent", label: "Rent", type: "operational" },
  { id: "utilities", label: "Utilities", type: "operational" },
  { id: "marketing", label: "Marketing", type: "operational" },
  { id: "salaries", label: "Salaries", type: "operational" },
  { id: "software", label: "Software", type: "operational" },
  { id: "delivery", label: "Delivery", type: "operational" },
  { id: "other", label: "Other", type: "operational" },
];

export const DEFAULT_FINANCE: FinanceDocument = {
  sales: [],
  spendings: [],
  assets: [],
  ignoredLineKeys: [],
  settings: {
    startingCapital: 0,
    productCosts: {},
    spendingCategories: DEFAULT_SPENDING_CATEGORIES,
  },
};

function money(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function asDate(value: unknown) {
  const raw = String(value || "").slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const d = new Date(String(value || ""));
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function migrateFinance(raw: unknown): FinanceDocument {
  const src = (raw ?? {}) as Partial<FinanceDocument>;
  const settings = src.settings ?? DEFAULT_FINANCE.settings;
  const categories = Array.isArray(settings.spendingCategories) && settings.spendingCategories.length
    ? settings.spendingCategories.map((item, index) => ({
        id: String(item.id || `cat-${index}`),
        label: String(item.label || "Category"),
        type: item.type === "material" ? "material" : "operational",
      }))
    : DEFAULT_SPENDING_CATEGORIES;
  return {
    sales: Array.isArray(src.sales)
      ? src.sales.map((sale) => ({
          id: String(sale.id),
          lineKey: sale.lineKey ? String(sale.lineKey) : undefined,
          source: sale.source === "order" ? "order" : "manual",
          orderId: sale.orderId ? String(sale.orderId) : undefined,
          orderRef: sale.orderRef ? String(sale.orderRef) : undefined,
          productSlug: String(sale.productSlug || CUSTOM_PRODUCT_SLUG),
          productName: String(sale.productName || "Custom"),
          date: asDate(sale.date),
          quantity: Math.max(1, Math.round(Number(sale.quantity) || 1)),
          revenue: money(sale.revenue),
          cost: sale.cost == null ? null : money(sale.cost),
          notes: sale.notes ? String(sale.notes) : undefined,
          createdAt: String(sale.createdAt || `${sale.date}T00:00:00.000Z`),
        }))
      : [],
    spendings: Array.isArray(src.spendings)
      ? src.spendings.map((row) => ({
          id: String(row.id),
          date: asDate(row.date),
          type: row.type === "material" ? "material" : "operational",
          category: String(row.category || "Other"),
          amount: money(row.amount),
          notes: row.notes ? String(row.notes) : undefined,
        }))
      : [],
    assets: Array.isArray(src.assets)
      ? src.assets.map((row) => ({
          id: String(row.id),
          name: String(row.name || "Asset"),
          cost: money(row.cost),
          date: asDate(row.date),
          notes: row.notes ? String(row.notes) : undefined,
        }))
      : [],
    ignoredLineKeys: Array.isArray(src.ignoredLineKeys) ? src.ignoredLineKeys.map(String).filter(Boolean) : [],
    settings: {
      startingCapital: money(settings.startingCapital),
      productCosts:
        settings.productCosts && typeof settings.productCosts === "object"
          ? Object.fromEntries(
              Object.entries(settings.productCosts).map(([slug, value]) => [slug, money(value)]),
            )
          : {},
      spendingCategories: categories,
    },
  };
}

export function defaultUnitCost(doc: FinanceDocument, slug: string) {
  return money(doc.settings.productCosts[slug] ?? 0);
}

export function saleCost(doc: FinanceDocument, sale: FinanceSale) {
  if (sale.cost != null) return money(sale.cost);
  return money(defaultUnitCost(doc, sale.productSlug) * sale.quantity);
}

export function saleProfit(doc: FinanceDocument, sale: FinanceSale) {
  return money(sale.revenue - saleCost(doc, sale));
}

export function formatEgp(value: number) {
  const n = money(value);
  const sign = n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toLocaleString("en-EG")} EGP`;
}

export function mergeFulfilledSales(doc: FinanceDocument, orders: InquiryRecord[]) {
  const next: FinanceDocument = {
    ...doc,
    sales: [...doc.sales],
    settings: { ...doc.settings, productCosts: { ...doc.settings.productCosts } },
  };
  const seen = new Set(next.sales.map((sale) => sale.lineKey).filter(Boolean));
  const ignored = new Set(next.ignoredLineKeys);
  let changed = false;
  for (const order of orders) {
    if (order.status !== "fulfilled") continue;
    const lines = orderLineItems(order);
    lines.forEach((line, index) => {
      const lineKey = `${order.id}:${index}`;
      if (seen.has(lineKey) || ignored.has(lineKey)) return;
      const slug = line.slug || order.product_slug || CUSTOM_PRODUCT_SLUG;
      const qty = Math.max(1, Number(line.quantity) || 1);
      next.sales.push({
        id: crypto.randomUUID(),
        lineKey,
        source: "order",
        orderId: order.id,
        orderRef: order.reference_code,
        productSlug: slug,
        productName: line.name || order.product_name || "Custom",
        date: asDate(order.created_at),
        quantity: qty,
        revenue: money((Number(line.priceEgp) || 0) * qty) || money(order.quoted_price),
        cost: null,
        notes: order.customer_name ? `Order ${order.reference_code}` : undefined,
        createdAt: order.created_at || new Date().toISOString(),
      });
      seen.add(lineKey);
      changed = true;
    });
  }
  next.sales.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  return { doc: next, changed };
}

export function financeSummary(doc: FinanceDocument) {
  const revenue = money(doc.sales.reduce((sum, sale) => sum + sale.revenue, 0));
  const cogs = money(doc.sales.reduce((sum, sale) => sum + saleCost(doc, sale), 0));
  const spendings = money(doc.spendings.reduce((sum, row) => sum + row.amount, 0));
  const assets = money(doc.assets.reduce((sum, row) => sum + row.cost, 0));
  const profit = money(revenue - cogs);
  const freeCash = money(doc.settings.startingCapital + revenue - cogs - spendings - assets);
  return { revenue, cogs, spendings, assets, profit, freeCash, startingCapital: doc.settings.startingCapital };
}

export function salesByMonth(doc: FinanceDocument, months = 8) {
  const now = new Date();
  const buckets: { key: string; label: string; revenue: number; profit: number }[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en", { month: "short" });
    buckets.push({ key, label, revenue: 0, profit: 0 });
  }
  const map = new Map(buckets.map((item) => [item.key, item]));
  for (const sale of doc.sales) {
    const key = sale.date.slice(0, 7);
    const bucket = map.get(key);
    if (!bucket) continue;
    bucket.revenue += sale.revenue;
    bucket.profit += saleProfit(doc, sale);
  }
  return buckets.map((item) => ({
    ...item,
    revenue: money(item.revenue),
    profit: money(item.profit),
  }));
}

export function catalogCostRows(products: Product[], doc: FinanceDocument) {
  return [...products]
    .filter((product) => !product.archived)
    .map((product) => ({
      slug: product.slug,
      name: product.name,
      cost: doc.settings.productCosts[product.slug] ?? 0,
    }))
    .concat([
      {
        slug: CUSTOM_PRODUCT_SLUG,
        name: "Custom",
        cost: doc.settings.productCosts[CUSTOM_PRODUCT_SLUG] ?? 0,
      },
    ]);
}
