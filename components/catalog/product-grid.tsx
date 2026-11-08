"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import { CATEGORIES, type Product, type ProductCategory } from "@/lib/products";
import { cn } from "@/lib/utils";

const COLLECTIONS: Record<string, ProductCategory[] | "staff"> = {
  apparel: ["Apparel"],
  drinkware: ["Drinkware"],
  wood: ["Laser Cut Wood"],
  "staff-picks": "staff",
};

export function ProductGrid({
  products,
  initialCategory,
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
  const [category, setCategory] = useState<ProductCategory | "All">(
    initialCategory ?? "All",
  );
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<"featured" | "name">("featured");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const items = useMemo(() => {
    let next = products;
    const collectionFilter = collection ? COLLECTIONS[collection] : undefined;
    if (collectionFilter === "staff") {
      next = products.slice(0, 3);
    } else if (collectionFilter) {
      next = products.filter((product) => collectionFilter.includes(product.category));
    }
    if (category !== "All") {
      next = next.filter((product) => product.category === category);
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
    return next;
  }, [category, collection, inStock, products, query, sort]);

  const grid = (
    <div
      className={
        layout === "list"
          ? "grid gap-3"
          : compact
            ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            : "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
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
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="space-y-6">
        <div>
          <p className="mb-2 text-xs tracking-[0.16em] text-oxford/60">DISCIPLINE</p>
          <div className="flex flex-col gap-1">
            {(["All", ...CATEGORIES] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-start text-sm font-medium transition",
                  category === item ? "bg-oxford text-white shadow-[0_3px_0_0_#06182c]" : "text-oxford hover:bg-chip",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => setInStock(event.target.checked)}
            className="accent-oxford"
          />
          In stock
        </label>
        <p className="text-xs text-muted-foreground">Micro-batches ship from the atelier desk after quote.</p>
      </aside>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{items.length} pieces</p>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "featured" | "name")}
              className="h-9 rounded-full border-2 border-oxford/15 bg-white px-3 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="name">Name</option>
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
    </div>
  );
}
