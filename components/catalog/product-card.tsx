"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  localizedName,
  localizedTagline,
  normalizeCategoryId,
  optionSwatch,
  productOptions,
  productThumbnail,
  sellingPrice,
  type Product,
} from "@/lib/products";
import { PriceTag } from "@/components/catalog/price-tag";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useEdit } from "@/lib/edit-context";
import { pick } from "@/lib/site";
import { startRouteLoading } from "@/components/layout/route-loading";
import { revealCartAfterPause } from "@/lib/storefront-ui";

export function ProductCard({
  product,
  layout = "grid",
  cardRounded = false,
  thumbRounded = false,
}: {
  product: Product;
  layout?: "grid" | "list";
  cardRounded?: boolean;
  thumbRounded?: boolean;
}) {
  const cardRadius = cardRounded ? "rounded-xl" : "rounded-none";
  const thumbRadius = thumbRounded ? "rounded-lg" : "rounded-none";
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
  const options = productOptions(product);
  const swatches = options.choices.slice(0, 4);

  function pulse() {
    setPressed(true);
    window.setTimeout(() => setPressed(false), 220);
  }

  function onPlus(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    pulse();
    if (customizable) {
      startRouteLoading();
      router.push(`/product/${product.slug}`);
      return;
    }
    addItem({
      slug: product.slug,
      name: product.name,
      nameAr: product.nameAr,
      image,
      color: options.choices[0] || product.defaultMaterial || "",
      quantity: 1,
      priceEgp: sellingPrice(product) || 100,
      kind: "product",
    });
    revealCartAfterPause(t("addedSuccess"));
  }

  if (layout === "list") {
    return (
      <Link
        href={`/product/${product.slug}`}
        onClick={pulse}
        className={`flex gap-4 bg-white p-4 shadow-sm transition duration-300 hover:shadow-xl ${cardRadius} ${
          pressed ? "scale-[0.97]" : ""
        }`}
      >
        <div className={`relative size-24 shrink-0 overflow-hidden bg-chip sm:size-28 ${thumbRadius}`}>
          {image ? <Image src={image} alt={name} fill className="object-cover" /> : null}
        </div>
        <div className="min-w-0 py-1">
          <p className="text-[10px] font-bold tracking-[0.16em] text-oxford/45 uppercase">
            {categoryLabel || product.category}
          </p>
          <h3 className="font-heading text-lg text-oxford sm:text-xl">{name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tagline}</p>
          <PriceTag product={product} size="sm" className="mt-2" />
        </div>
      </Link>
    );
  }

  return (
    <article
      className={`group flex h-full flex-col bg-white p-3 shadow-sm transition duration-300 hover:shadow-xl sm:p-4 ${cardRadius} ${
        pressed ? "scale-[0.97]" : ""
      }`}
    >
      <div className={`relative mb-4 overflow-hidden bg-chip ${thumbRadius}`}>
        <Link href={`/product/${product.slug}`} onClick={pulse} className="block">
          <div className="relative aspect-[4/5] overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : null}
            <span className="absolute start-3 top-3 rounded bg-white/92 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-oxford uppercase shadow-sm">
              {categoryLabel || product.category}
            </span>
          </div>
        </Link>
        <button
          type="button"
          className="icon-circle absolute bottom-3 end-3 z-10 size-10 opacity-100 shadow-md transition duration-300 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={customizable ? t("customize") : t("addToCart")}
          onClick={onPlus}
        >
          <Plus className="size-4 sm:size-5" />
        </button>
      </div>
      <Link href={`/product/${product.slug}`} onClick={pulse} className="flex flex-1 flex-col justify-between">
        <div>
          <p className="mb-1 text-[10px] font-bold tracking-[0.16em] text-oxford/40 uppercase">
            {categoryLabel || product.category}
          </p>
          <h3 className="line-clamp-2 min-h-[2.5em] font-heading text-[15px] leading-snug text-oxford sm:text-lg">{name}</h3>
          <p className="mt-1 line-clamp-1 min-h-[1.25rem] text-[13px] text-muted-foreground">{tagline}</p>
        </div>
        <div className="mt-4 flex min-h-8 items-end justify-between gap-3 border-t border-oxford/6 pt-3">
          <PriceTag product={product} size="sm" />
          <div className="flex h-3.5 min-w-[4.5rem] items-center justify-end gap-1.5">
            {swatches.length > 1
              ? swatches.map((choice) => (
                  <span
                    key={choice}
                    title={choice}
                    className="size-3.5 rounded-full shadow-inner ring-1 ring-oxford/10"
                    style={{ background: optionSwatch(choice) }}
                  />
                ))
              : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
