"use client";

import { ProductCard } from "@/components/catalog/product-card";
import { remainingToFreeShipping, suggestCartProducts } from "@/lib/cart-suggestions";
import type { Bundle } from "@/lib/bundles";
import { useCart } from "@/lib/cart";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import type { SiteSection } from "@/lib/site";

export function CartSuggestions({
  products,
  bundles = [],
  freeShippingMin,
  section,
}: {
  products: Product[];
  bundles?: Bundle[];
  freeShippingMin: number;
  section?: SiteSection;
}) {
  const items = useCart((s) => s.items);
  const { site } = useEdit();
  const subtotal = items.reduce((sum, item) => sum + item.priceEgp * item.quantity, 0);
  const remaining = remainingToFreeShipping(subtotal, freeShippingMin);
  const suggested = suggestCartProducts({
    products,
    items,
    bundles,
    remaining,
    pinnedSlugs: section?.content.productSlugs ?? [],
    context: {
      pages: site.pages,
      homeSections: site.sections,
      catalogSections: site.chrome.catalogSections,
    },
  });
  if (!suggested.products.length) return null;

  const cardRounded = Boolean(section?.style.cardRounded);
  const thumbRounded = Boolean(section?.style.imageRounded);
  const { locale } = useI18n();
  const note =
    suggested.nearFreeShip && section
      ? locale === "en"
        ? section.content.body?.en || section.content.body?.ar
        : section.content.body?.ar || section.content.body?.en
      : "";

  return (
    <div className="mt-3">
      {note ? <p className="mb-3 max-w-md text-[12px] leading-relaxed text-foreground/45">{note}</p> : null}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {suggested.products.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            cardRounded={cardRounded}
            thumbRounded={thumbRounded}
            compact
          />
        ))}
      </div>
    </div>
  );
}
