"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilLine, Plus } from "lucide-react";
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
import { EditableCopy } from "@/components/cms/editable-copy";
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
  compact = false,
}: {
  product: Product;
  layout?: "grid" | "list";
  cardRounded?: boolean;
  thumbRounded?: boolean;
  compact?: boolean;
}) {
  const cardRadius = cardRounded ? "rounded-[16px]" : "rounded-[12px]";
  const thumbRadius = thumbRounded ? "rounded-[10px]" : "rounded-[8px]";
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
      <article
        className={`relative flex gap-4 bg-white p-4 shadow-sm transition duration-300 hover:shadow-xl ${cardRadius} ${
          pressed ? "scale-[0.97]" : ""
        }`}
      >
        <Link href={`/product/${product.slug}`} onClick={pulse} className={`relative size-24 shrink-0 overflow-hidden bg-chip sm:size-28 ${thumbRadius}`}>
          {image ? <Image src={image} alt={name} fill className="object-cover" /> : null}
        </Link>
        <Link href={`/product/${product.slug}`} onClick={pulse} className="min-w-0 flex-1 py-1 pe-12">
          <p className="text-[10px] font-bold tracking-[0.16em] text-oxford/45 uppercase">
            {categoryLabel || product.category}
          </p>
          <h3 className="font-heading text-lg text-oxford sm:text-xl">{name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tagline}</p>
          <PriceTag product={product} size="sm" className="mt-2" />
        </Link>
        <button
          type="button"
          className="icon-circle absolute end-3 top-1/2 z-10 size-10 -translate-y-1/2 shadow-md"
          aria-label={customizable ? t("customize") : t("addToCart")}
          onClick={onPlus}
        >
          <Plus className="size-4 sm:size-5" />
        </button>
      </article>
    );
  }

  return (
    <article
      className={`group flex h-full flex-col shadow-sm transition duration-300 hover:shadow-xl ${
        compact ? "bg-cream p-2 ring-1 ring-oxford/8 sm:p-2.5" : "bg-white p-3 sm:p-4"
      } ${cardRadius} ${pressed ? "scale-[0.97]" : ""}`}
    >
      <div className={`relative overflow-hidden bg-chip ${thumbRadius} ${compact ? "mb-2" : "mb-4"}`}>
        <Link href={`/product/${product.slug}`} onClick={pulse} className="block">
          <div className={`relative overflow-hidden ${compact ? "aspect-square" : "aspect-[4/5]"}`}>
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : null}
            <span
              className={`absolute start-2 top-2 rounded bg-white/92 font-bold tracking-[0.14em] text-oxford uppercase shadow-sm ${
                compact ? "px-1.5 py-0.5 text-[9px]" : "start-3 top-3 px-2.5 py-1 text-[10px]"
              }`}
            >
              {categoryLabel || product.category}
            </span>
          </div>
        </Link>
      </div>
      <Link href={`/product/${product.slug}`} onClick={pulse} className="flex flex-1 flex-col justify-between">
        <div>
          {compact ? null : (
            <p className="mb-1 text-[10px] font-bold tracking-[0.16em] text-oxford/40 uppercase">
              {categoryLabel || product.category}
            </p>
          )}
          <h3
            className={`line-clamp-2 font-heading leading-snug text-oxford ${
              compact ? "min-h-[2.1em] text-[13px] sm:text-sm" : "min-h-[2.5em] text-[15px] sm:text-lg"
            }`}
          >
            {name}
          </h3>
          {compact ? null : <p className="mt-1 line-clamp-1 min-h-[1.25rem] text-[13px] text-muted-foreground">{tagline}</p>}
        </div>
        <div
          className={`flex items-end justify-between gap-3 border-t border-oxford/6 ${
            compact ? "mt-2 min-h-6 pt-2" : "mt-4 min-h-8 pt-3"
          }`}
        >
          <PriceTag product={product} size="sm" />
          {compact ? null : (
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
          )}
        </div>
      </Link>
      <button
        type="button"
        className={`mt-2 flex w-full items-center justify-center gap-1.5 bg-cream font-semibold text-foreground transition-all group-hover:bg-foreground group-hover:text-background ${
          compact ? "rounded-[10px] px-2 py-1.5 text-[11px] sm:text-xs" : "mt-3 rounded-[12px] px-4 py-2.5 text-sm"
        }`}
        onClick={onPlus}
      >
        {customizable ? <PencilLine className={compact ? "size-3.5" : "size-4"} /> : <Plus className={compact ? "size-3.5" : "size-4"} />}
        <span>{customizable ? <EditableCopy k="customizeName" /> : <EditableCopy k="addToCart" />}</span>
      </button>
    </article>
  );
}
