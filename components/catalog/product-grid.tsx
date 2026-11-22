"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { EditableCopy } from "@/components/cms/editable-copy";
import { ShopFilterBar } from "@/components/shop/shop-filter-bar";
import { normalizeCategoryId, sellingPrice, type Product, type ProductCategory } from "@/lib/products";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/site";
import { cn } from "@/lib/utils";

const COLLECTIONS: Record<string, ProductCategory[] | "staff"> = {
  "staff-picks": "staff",
};

const PAGE_SIZE = 8;

export function ProductGrid({
  products,
  collection,
  query,
  compact = false,
  cardRounded = false,
  thumbRounded = false,
}: {
  products: Product[];
  initialCategory?: ProductCategory;
  collection?: string;
  query?: string;
  compact?: boolean;
  cardRounded?: boolean;
  thumbRounded?: boolean;
}) {
  const [inStock, setInStock] = useState(false);
  const { t, locale } = useI18n();
  const { site, editing } = useEdit();
  const [sort, setSort] = useState<"featured" | "name" | "price-asc">("featured");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [pageFilter, setPageFilter] = useState(collection && collection !== "all" ? collection : "all");
  const topRef = useRef<HTMLDivElement>(null);
  const skipPageScroll = useRef(true);
  const mapped = collection ? COLLECTIONS[collection] : undefined;

  const items = useMemo(() => {
    let next = products;
    if (mapped === "staff") {
      next = products.slice(0, 3);
    } else if (pageFilter === "custom") {
      next = next.filter((product) => product.customizable !== false);
    } else if (pageFilter && pageFilter !== "all") {
      next = next.filter((product) => normalizeCategoryId(product.category) === pageFilter);
    }
    if (query) {
      const needle = query.toLowerCase();
      next = next.filter(
        (product) =>
          product.name.toLowerCase().includes(needle) ||
          product.tagline.toLowerCase().includes(needle) ||
          product.category.toLowerCase().includes(needle),
      );
    }
    if (inStock) next = next.filter((product) => !product.archived);
    if (sort === "name") {
      next = [...next].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sort === "price-asc") {
      next = [...next].sort((a, b) => sellingPrice(a) - sellingPrice(b));
    }
    return next;
  }, [inStock, mapped, pageFilter, products, query, sort]);

  useEffect(() => {
    setPageFilter(collection && collection !== "all" ? collection : "all");
  }, [collection]);

  useEffect(() => {
    setPage(1);
    setShowAll(false);
  }, [collection, inStock, pageFilter, query, sort]);

  useEffect(() => {
    if (skipPageScroll.current) {
      skipPageScroll.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const visible = showAll ? items : items.slice(pageStart, pageStart + PAGE_SIZE);
  const shownCount = showAll ? items.length : Math.min(items.length, pageStart + visible.length);

  const grid = (
    <div
      className={
        layout === "list"
          ? "grid gap-4"
          : "grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8"
      }
    >
      {visible.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
          layout={layout}
          cardRounded={cardRounded}
          thumbRounded={thumbRounded}
        />
      ))}
    </div>
  );

  if (compact) {
    return grid;
  }

  const showingVars = { shown: shownCount, total: items.length };

  return (
    <div ref={topRef} className="scroll-mt-28 space-y-8">
      <ShopFilterBar products={products} filter={pageFilter} onFilter={setPageFilter} />

      <div className="flex flex-col justify-between gap-4 rounded-xl bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-lg bg-[#f4f3f0] px-3.5 py-2 text-[12px] font-semibold tracking-[0.08em] text-oxford uppercase">
            <input
              type="checkbox"
              className="size-3.5 accent-oxford"
              checked={inStock}
              onChange={(event) => setInStock(event.target.checked)}
            />
            <EditableCopy k="readyToShip" />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] text-oxford/45 uppercase">
            <EditableCopy k="sortBy" />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "featured" | "name" | "price-asc")}
              className="h-9 rounded-lg border-0 bg-[#f4f3f0] px-3 text-[12px] font-semibold tracking-[0.04em] text-oxford"
            >
              <option value="featured">{pick(site.chrome.copy.sortFeatured, locale) || t("sortFeatured")}</option>
              <option value="name">{pick(site.chrome.copy.sortName, locale) || t("sortName")}</option>
              <option value="price-asc">{pick(site.chrome.copy.sortPriceLow, locale) || t("sortPriceLow")}</option>
            </select>
          </label>
          <div className="flex rounded-lg bg-[#f4f3f0] p-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
            <button
              type="button"
              onClick={() => setLayout("grid")}
              className={cn("rounded-md px-3 py-1.5", layout === "grid" && "bg-oxford text-white")}
            >
              <EditableCopy k="layoutGrid" />
            </button>
            <button
              type="button"
              onClick={() => setLayout("list")}
              className={cn("rounded-md px-3 py-1.5", layout === "list" && "bg-oxford text-white")}
            >
              <EditableCopy k="layoutList" />
            </button>
          </div>
          {editing ? (
            <div className="flex flex-wrap gap-2 text-[11px] text-oxford/60">
              <EditableCopy k="sortFeatured" />
              <EditableCopy k="sortName" />
              <EditableCopy k="sortPriceLow" />
            </div>
          ) : null}
        </div>
      </div>

      {grid}

      {items.length > PAGE_SIZE ? (
        <div className="flex flex-col items-center justify-center gap-6 pt-4">
          <div className="flex w-full max-w-xs flex-col items-center gap-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-oxford/10">
              <div
                className="h-full rounded-full bg-oxford transition-all duration-500"
                style={{ width: `${items.length ? Math.round((shownCount / items.length) * 100) : 0}%` }}
              />
            </div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-oxford/45 uppercase">
              <EditableCopy k="showingPieces" vars={showingVars} />
            </p>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                className={cn(
                  "grid size-10 place-items-center rounded-lg text-sm font-semibold transition",
                  number === page && !showAll ? "bg-oxford text-white shadow-sm" : "bg-[#f4f3f0] text-oxford hover:bg-chip",
                )}
                onClick={() => {
                  setShowAll(false);
                  setPage(number);
                }}
              >
                {number}
              </button>
            ))}
            {page < pageCount && !showAll ? (
              <button
                type="button"
                className="grid size-10 place-items-center rounded-lg bg-[#f4f3f0] text-oxford hover:bg-chip"
                aria-label={locale === "ar" ? "التالي" : "Next"}
                onClick={() => {
                  setShowAll(false);
                  setPage((value) => Math.min(pageCount, value + 1));
                }}
              >
                <ChevronRight className={`size-4 ${locale === "ar" ? "rotate-180" : ""}`} />
              </button>
            ) : null}
          </div>
          {!showAll && page < pageCount ? (
            <button
              type="button"
              className="text-sm text-oxford/50 underline-offset-4 transition hover:text-oxford hover:underline"
              onClick={() => {
                setShowAll(true);
                setPage(pageCount);
              }}
            >
              <EditableCopy k="showMore" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
