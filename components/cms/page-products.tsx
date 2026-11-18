"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ShopFilterBar } from "@/components/shop/shop-filter-bar";
import { ShopRail } from "@/components/shop/shop-sidebar";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { localizedName, productThumbnail, type Product } from "@/lib/products";
import type { SiteSection } from "@/lib/site";

export function PageProducts({
  section,
  products,
}: {
  section: SiteSection;
  products: Product[];
}) {
  const { editing, patchSection, pageKey, site } = useEdit();
  const { locale } = useI18n();
  const [pick, setPick] = useState("");
  const slugs = section.content.productSlugs ?? [];
  const isHome = !pageKey || pageKey === "home";
  const isCategoryPage = Boolean(pageKey && pageKey !== "home" && site.chrome.catalogSections?.some((item) => item.id === pageKey));
  const fallbackAll = isHome || isCategoryPage;
  const selected = useMemo(() => {
    if (slugs.length) {
      return slugs.map((slug) => products.find((product) => product.slug === slug)).filter(Boolean) as Product[];
    }
    return fallbackAll ? products.filter((product) => !product.archived) : [];
  }, [fallbackAll, products, slugs]);
  const selectedSlugs = selected.map((product) => product.slug);
  const available = products.filter((product) => !product.archived && !selectedSlugs.includes(product.slug));
  const cardRounded = Boolean(section.style.cardRounded);
  const thumbRounded = Boolean(section.style.imageRounded);

  function setSlugs(productSlugs: string[]) {
    patchSection(section.id, { content: { productSlugs } });
  }

  const body = (
      <div className="space-y-5">
        {editing ? <ShopFilterBar collection={isCategoryPage ? pageKey || undefined : section.content.collection} /> : null}
        {editing ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {selected.map((product) => (
            <div key={product.slug} className="relative">
              {!isCategoryPage ? (
                <button
                  type="button"
                  className="absolute end-2 top-2 z-20 grid size-8 place-items-center rounded-full bg-white text-red-700 shadow ring-1 ring-oxford/10"
                  aria-label="Remove product"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setSlugs(selectedSlugs.filter((slug) => slug !== product.slug));
                  }}
                >
                  <Trash2 className="size-3.5" />
                </button>
              ) : null}
              <ProductCard product={product} cardRounded={cardRounded} thumbRounded={thumbRounded} />
            </div>
          ))}
          {!isCategoryPage ? (
            <div className="flex min-h-[180px] flex-col justify-center rounded-xl border-2 border-dashed border-oxford/20 bg-white/40 p-3 sm:min-h-[280px] sm:p-4">
              <p className="mb-3 text-sm font-medium text-oxford">Add a product card</p>
              <select
                value={pick}
                onChange={(event) => setPick(event.target.value)}
                className="h-10 w-full rounded-full border border-oxford/15 bg-white px-3 text-sm text-oxford"
              >
                <option value="">{locale === "ar" ? "اختر منتج" : "Choose a product"}</option>
                {available.map((product) => (
                  <option key={product.slug} value={product.slug}>
                    {localizedName(product, locale)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-oxford px-4 text-sm font-semibold text-white disabled:opacity-40"
                disabled={!pick}
                onClick={() => {
                  if (!pick) return;
                  setSlugs([...selectedSlugs, pick]);
                  setPick("");
                }}
              >
                <Plus className="size-4" />
                {locale === "ar" ? "إضافة" : "Add card"}
              </button>
              {available.length === 0 ? (
                <p className="mt-3 text-xs text-oxford/50">Every catalog product is already on this page.</p>
              ) : null}
            </div>
          ) : null}
        </div>
        ) : selected.length === 0 ? (
          <p className="text-sm text-oxford/50">No products on this page yet.</p>
        ) : (
          <ProductGrid
            products={selected}
            compact={isHome}
            cardRounded={cardRounded}
            thumbRounded={thumbRounded}
          />
        )}
      </div>
  );

  if (isHome) return <div className="cms-copy">{body}</div>;
  return <ShopRail activeId={isCategoryPage ? pageKey || undefined : section.content.collection}>{body}</ShopRail>;
}

export function ProductShelfEditor({
  section,
  products,
  patch,
}: {
  section: SiteSection;
  products: Product[];
  patch: ReturnType<typeof useEdit>["patchSection"];
}) {
  const { locale } = useI18n();
  const stored = section.content.productSlugs ?? [];
  const live = products.filter((product) => !product.archived);
  const slugs = stored.length ? stored : live.map((product) => product.slug);
  const available = live.filter((product) => !slugs.includes(product.slug));

  function setSlugs(productSlugs: string[]) {
    patch(section.id, { content: { productSlugs } });
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">Product cards</p>
      <label className="flex h-10 items-center justify-between gap-3 border-b border-oxford/6 text-sm">
        <span>Card rounded corners</span>
        <input
          type="checkbox"
          className="size-4 accent-oxford"
          checked={Boolean(section.style.cardRounded)}
          onChange={(event) => patch(section.id, { style: { cardRounded: event.target.checked } })}
        />
      </label>
      <label className="flex h-10 items-center justify-between gap-3 border-b border-oxford/6 text-sm">
        <span>Thumbnail rounded corners</span>
        <input
          type="checkbox"
          className="size-4 accent-oxford"
          checked={Boolean(section.style.imageRounded)}
          onChange={(event) => patch(section.id, { style: { imageRounded: event.target.checked } })}
        />
      </label>
      {slugs.length === 0 ? <p className="text-xs text-oxford/50">No products in this section yet.</p> : null}
      {slugs.map((slug, index) => {
        const product = products.find((item) => item.slug === slug);
        if (!product) return null;
        return (
          <div key={slug} className="flex items-center gap-2 rounded-xl bg-cream/80 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={productThumbnail(product)} alt="" className="size-12 object-cover" />
            <p className="min-w-0 flex-1 truncate text-sm text-oxford">{localizedName(product, locale)}</p>
            <button
              type="button"
              className="text-xs text-oxford"
              onClick={() => {
                if (index === 0) return;
                const next = [...slugs];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                setSlugs(next);
              }}
            >
              Up
            </button>
            <button
              type="button"
              className="text-xs text-oxford"
              onClick={() => {
                if (index >= slugs.length - 1) return;
                const next = [...slugs];
                [next[index + 1], next[index]] = [next[index], next[index + 1]];
                setSlugs(next);
              }}
            >
              Down
            </button>
            <button type="button" className="text-xs text-red-700" onClick={() => setSlugs(slugs.filter((item) => item !== slug))}>
              Remove
            </button>
          </div>
        );
      })}
      <select
        className="h-10 w-full rounded-xl border border-oxford/12 bg-white px-3 text-sm"
        value=""
        onChange={(event) => {
          const slug = event.target.value;
          if (slug) setSlugs([...slugs, slug]);
        }}
      >
        <option value="">Add product…</option>
        {available.map((product) => (
          <option key={product.slug} value={product.slug}>
            {localizedName(product, locale)}
          </option>
        ))}
      </select>
    </div>
  );
}
