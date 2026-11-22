"use client";

import { EditableCopy } from "@/components/cms/editable-copy";
import { ProductCard } from "@/components/catalog/product-card";
import { remainingToFreeShipping, suggestCartProducts } from "@/lib/cart-suggestions";
import type { Bundle } from "@/lib/bundles";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function CartSuggestions({
  products,
  bundles = [],
  freeShippingMin,
  subtotal,
}: {
  products: Product[];
  bundles?: Bundle[];
  freeShippingMin: number;
  subtotal: number;
}) {
  const items = useCart((s) => s.items);
  const remaining = remainingToFreeShipping(subtotal, freeShippingMin);
  const suggested = suggestCartProducts({ products, items, bundles, remaining });
  if (!suggested.products.length) return null;

  return (
    <section className="rounded-[20px] bg-white p-4 ring-1 ring-oxford/8 sm:p-6">
      <EditableCopy
        k={suggested.nearFreeShip ? "cartSuggestShipping" : "cartSuggestTitle"}
        as="h2"
        className="font-heading text-xl text-oxford sm:text-2xl"
      />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {suggested.products.map((product) => (
          <ProductCard key={product.slug} product={product} cardRounded thumbRounded />
        ))}
      </div>
    </section>
  );
}
