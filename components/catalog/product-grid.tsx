"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import { type Product, type ProductCategory } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const COLLECTIONS: Record<string, ProductCategory[] | "staff"> = {
  apparel: ["Apparel"],
  drinkware: ["Drinkware"],
  wood: ["Laser Cut Wood"],
  "staff-picks": "staff",
};

export function ProductGrid({
  products,
  collection,
  query,
  compact = false,
}: {
  products: Product[];
  initialCategory?: ProductCategory;
  collection?: string;
  query?: string;
  compact?: boolean;
}) {
  const [inStock, setInStock] = useState(false);
  const { t } = useI18n();
  const [sort, setSort] = useState<"featured" | "name" | "price-asc">("featured");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const mapped = collection ? COLLECTIONS[collection] : undefined;

  const items = useMemo(() => {
    let next = products;
    if (mapped === "staff") {
      next = products.slice(0, 3);
    } else if (mapped) {
      next = products.filter((product) => mapped.includes(product.category));
    }
    if (query) {
      const needle = query.toLowerCase();
      next = next.filter(
        (product) =>
          product.name.toLowerCase().includes(needle) ||
          product.tagline.toLowerCase().includes(needle) ||
          product.category.toLowerCase().includes(needle),
      );
    }
    if (inStock) next = next.filter((product) => !product.archived);
    if (sort === "name") {
      next = [...next].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sort === "price-asc") {
      next = [...next].sort((a, b) => (a.priceEgp || 0) - (b.priceEgp || 0));
    }
    return next;
  }, [collection, inStock, mapped, products, query, sort]);

  const grid = (
    <div
      className={
        layout === "list"
          ? "grid gap-3"
          : "grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
      }
    >
      {items.map((product) => (
        <ProductCard key={product.slug} product={product} layout={layout} />
      ))}
    </div>
  );

  if (compact) {
    return grid;
  }

  return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{items.length} pieces</p>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "featured" | "name" | "price-asc")}
              className="h-9 rounded-full border-2 border-oxford/15 bg-white px-3 text-sm"
            >
              <option value="featured">{t("sortFeatured")}</option>
              <option value="name">{t("sortName")}</option>
              <option value="price-asc">{t("sortPriceLow")}</option>
            </select>
            <div className="flex rounded-full border border-border bg-white p-1 text-xs">
              <button
                type="button"
                onClick={() => setLayout("grid")}
                className={cn("rounded-full px-3 py-1", layout === "grid" && "bg-oxford text-white")}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setLayout("list")}
                className={cn("rounded-full px-3 py-1", layout === "list" && "bg-oxford text-white")}
              >
                List
              </button>
            </div>
          </div>
        </div>
        {grid}
      </div>
  );
}
