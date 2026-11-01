"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import { CATEGORIES, PRODUCTS, type ProductCategory } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductGrid({
  initialCategory,
}: {
  initialCategory?: ProductCategory;
}) {
  const [category, setCategory] = useState<ProductCategory | "All">(
    initialCategory ?? "All",
  );
  const items = useMemo(
    () =>
      category === "All"
        ? PRODUCTS
        : PRODUCTS.filter((product) => product.category === category),
    [category],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={cn(
              "rounded-full border px-4 py-1.5 font-heading text-sm transition",
              category === item
                ? "border-boo-teal bg-boo-teal text-white"
                : "border-border bg-white text-boo-ink hover:border-boo-orange",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
