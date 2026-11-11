"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import { ShopSidebar } from "@/components/shop/shop-sidebar";
import { type Product, type ProductCategory } from "@/lib/products";
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
  const [sort, setSort] = useState<"featured" | "name">("featured");
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
    <div className="flex gap-8 lg:gap-10">
      <ShopSidebar activeId={collection || (query ? undefined : "all")} />
      <div className="min-w-0 flex-1 space-y-5">
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
