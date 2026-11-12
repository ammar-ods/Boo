"use client";

import { discountPercentOf, sellingPrice, type Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function PriceTag({
  product,
  className,
  size = "md",
}: {
  product: Pick<Product, "priceEgp" | "discounted" | "saleEgp" | "discountPercent">;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { formatPrice } = useI18n();
  const list = Math.max(0, Number(product.priceEgp) || 0);
  const sale = sellingPrice(product);
  const percent = discountPercentOf(product);
  const priceClass = size === "lg" ? "text-xl sm:text-2xl" : size === "sm" ? "text-xs sm:text-sm" : "text-sm";

  if (!percent) {
    return <p className={cn("font-semibold text-oxford", priceClass, className)}>{formatPrice(sale || list || 100)}</p>;
  }

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1 font-semibold text-oxford", priceClass, className)}>
      <span className="text-[0.85em] font-medium text-oxford/40 line-through">{formatPrice(list)}</span>
      <span>{formatPrice(sale)}</span>
      <span className="rounded-full bg-boo-pink px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white sm:text-[11px]">
        −{percent}%
      </span>
    </p>
  );
}
