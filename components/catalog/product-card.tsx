"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { localizedName, localizedTagline, normalizeCategoryId, productOptions, productThumbnail, sellingPrice, type Product } from "@/lib/products";
import { PriceTag } from "@/components/catalog/price-tag";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useEdit } from "@/lib/edit-context";
import { pick } from "@/lib/site";
import { flashStatus } from "@/components/status-flash";

export function ProductCard({
  product,
  layout = "grid",
}: {
  product: Product;
  layout?: "grid" | "list";
}) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { site } = useEdit();
  const categoryId = normalizeCategoryId(product.category);
  const categoryLabel =
    pick(site.chrome.catalogSections?.find((item) => item.id === categoryId)?.label, locale) || product.category;
  const addItem = useCart((s) => s.addItem);
  const [pressed, setPressed] = useState(false);
  const name = localizedName(product, locale);
  const tagline = localizedTagline(product, locale);
  const image = productThumbnail(product);
  const customizable = product.customizable !== false;

  function pulse() {
    setPressed(true);
    window.setTimeout(() => setPressed(false), 220);
  }

  function onPlus(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    pulse();
    if (customizable) {
      router.push(`/product/${product.slug}`);
      return;
    }
    addItem({
      slug: product.slug,
      name: product.name,
      nameAr: product.nameAr,
      image,
      color: productOptions(product).choices[0] || product.defaultMaterial || "",
      quantity: 1,
      priceEgp: sellingPrice(product) || 100,
      kind: "product",
    });
    flashStatus(t("addedSuccess"));
  }

  if (layout === "list") {
    return (
      <Link
        href={`/product/${product.slug}`}
        onClick={pulse}
        className={`surface-card flex gap-4 p-3 transition duration-200 ${pressed ? "scale-[0.97]" : "hover:-translate-y-0.5"}`}
      >
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-chip sm:size-28">
          <Image src={image} alt={name} fill className="object-cover" />
        </div>
        <div className="min-w-0 py-1">
          <p className="text-[11px] tracking-[0.16em] text-oxford/60">{(categoryLabel || product.category).toUpperCase()}</p>
          <h3 className="font-heading text-lg text-oxford sm:text-xl">{name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tagline}</p>
          <PriceTag product={product} size="sm" className="mt-2" />
        </div>
      </Link>
    );
  }

  return (
    <article className={`transition duration-200 ${pressed ? "scale-[0.96]" : ""}`}>
      <div className="relative">
        <Link href={`/product/${product.slug}`} onClick={pulse} className="group block">
          <div className="overflow-hidden rounded-[1.15rem] bg-card shadow-[0_16px_36px_-22px_rgba(10,37,64,0.32)] transition duration-500 group-hover:-translate-y-1 sm:rounded-[28px]">
            <div className="relative aspect-[3/4] overflow-hidden bg-chip sm:aspect-[4/5]">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute start-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-oxford sm:start-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[11px]">
                {categoryLabel || product.category}
              </span>
            </div>
          </div>
        </Link>
        <button
          type="button"
          className="icon-circle absolute bottom-2 end-2 z-10 size-9 sm:bottom-3 sm:end-3 sm:size-11"
          aria-label={customizable ? t("customize") : t("addToCart")}
          onClick={onPlus}
        >
          <Plus className="size-4 sm:size-5" />
        </button>
      </div>
      <Link href={`/product/${product.slug}`} onClick={pulse} className="block space-y-0.5 px-0.5 pt-2 sm:space-y-1 sm:px-1 sm:pt-3">
        <h3 className="font-heading text-[13px] leading-snug text-oxford sm:text-lg">{name}</h3>
        <p className="line-clamp-2 text-[11px] text-muted-foreground sm:text-sm">{tagline}</p>
        <PriceTag product={product} size="sm" />
      </Link>
    </article>
  );
}
