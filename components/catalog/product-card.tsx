"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { localizedName, localizedTagline, type Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n";

export function ProductCard({
  product,
  layout = "grid",
}: {
  product: Product;
  layout?: "grid" | "list";
}) {
  const { locale, formatPrice } = useI18n();
  const name = localizedName(product, locale);
  const tagline = localizedTagline(product, locale);

  if (layout === "list") {
    return (
      <Link href={`/product/${product.slug}`} className="surface-card flex gap-4 p-3 transition hover:-translate-y-0.5">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-chip">
          <Image src={product.mockup} alt={name} fill className="object-cover" />
        </div>
        <div className="min-w-0 py-1">
          <p className="text-[11px] tracking-[0.16em] text-oxford/60">{product.category.toUpperCase()}</p>
          <h3 className="font-heading text-xl text-oxford">{name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
          <p className="mt-2 text-sm font-semibold text-oxford">{formatPrice(product.priceEgp || 100)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-[28px] bg-card shadow-[0_16px_36px_-22px_rgba(10,37,64,0.32)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_22px_40px_-20px_rgba(10,37,64,0.4)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-chip">
          <Image
            src={product.mockup}
            alt={name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-oxford">
            {product.category}
          </span>
          <span className="icon-circle absolute bottom-3 end-3 size-11">
            <Plus className="size-5" />
          </span>
        </div>
      </div>
      <div className="space-y-1 px-1 pt-3">
        <h3 className="font-heading text-lg leading-snug text-oxford">{name}</h3>
        <p className="text-sm text-muted-foreground">{tagline}</p>
        <p className="text-sm font-semibold text-oxford">{formatPrice(product.priceEgp || 100)}</p>
      </div>
    </Link>
  );
}
