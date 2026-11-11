"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { ShopSidebar } from "@/components/shop/shop-sidebar";
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
  const { editing, patchSection } = useEdit();
  const { locale } = useI18n();
  const [pick, setPick] = useState("");
  const slugs = section.content.productSlugs ?? [];
  const selected = useMemo(
    () => slugs.map((slug) => products.find((product) => product.slug === slug)).filter(Boolean) as Product[],
    [products, slugs],
  );
  const available = products.filter((product) => !product.archived && !slugs.includes(product.slug));

  function setSlugs(productSlugs: string[]) {
    patchSection(section.id, { content: { productSlugs } });
  }

  return (
    <div className="flex w-screen max-w-[100vw] gap-6 lg:gap-10" style={{ marginInline: "calc(50% - 50vw)" }}>
      <ShopSidebar activeId={section.content.collection} />
      <div className="min-w-0 flex-1 space-y-5 px-4 pe-[max(1rem,env(safe-area-inset-inline-end))] sm:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3">
          {selected.map((product) => (
            <div key={product.slug} className="relative">
              {editing ? (
                <button
                  type="button"
                  className="absolute end-2 top-2 z-20 grid size-8 place-items-center rounded-full bg-white text-red-700 shadow ring-1 ring-oxford/10"
                  aria-label="Remove product"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setSlugs(slugs.filter((slug) => slug !== product.slug));
                  }}
                >
                  <Trash2 className="size-3.5" />
                </button>
              ) : null}
              <ProductCard product={product} />
            </div>
          ))}
          {editing ? (
            <div className="flex min-h-[180px] flex-col justify-center rounded-[1.15rem] border-2 border-dashed border-oxford/20 bg-white/40 p-3 sm:min-h-[280px] sm:rounded-[28px] sm:p-4">
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
                  setSlugs([...slugs, pick]);
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
        {!editing && selected.length === 0 ? (
          <p className="text-sm text-oxford/50">No products on this page yet.</p>
        ) : null}
      </div>
    </div>
  );
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
  const slugs = section.content.productSlugs ?? [];
  const available = products.filter((product) => !product.archived && !slugs.includes(product.slug));

  function setSlugs(productSlugs: string[]) {
    patch(section.id, { content: { productSlugs } });
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">Product cards</p>
      {slugs.map((slug, index) => {
        const product = products.find((item) => item.slug === slug);
        if (!product) return null;
        return (
          <div key={slug} className="flex items-center gap-2 rounded-xl bg-cream/80 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={productThumbnail(product)} alt="" className="size-12 rounded-lg object-cover" />
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
