"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { useShopNavItems } from "@/components/shop/shop-sidebar";
import { normalizeCategoryId, sellingPrice, type Product, type ProductCategory } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
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
}: {
  products: Product[];
  initialCategory?: ProductCategory;
  collection?: string;
  query?: string;
  compact?: boolean;
}) {
  const [inStock, setInStock] = useState(false);
  const { t, locale } = useI18n();
  const [sort, setSort] = useState<"featured" | "name" | "price-asc">("featured");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const mapped = collection ? COLLECTIONS[collection] : undefined;
  const shopItems = useShopNavItems();

  const items = useMemo(() => {
    let next = products;
    if (mapped === "staff") {
      next = products.slice(0, 3);
    } else if (collection) {
      next = products.filter((product) => normalizeCategoryId(product.category) === collection);
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
  }, [collection, inStock, mapped, products, query, sort]);

  useEffect(() => {
    setPage(1);
    setShowAll(false);
  }, [collection, inStock, query, sort]);

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const shownCount = showAll ? items.length : Math.min(items.length, page * PAGE_SIZE);
  const visible = items.slice(0, shownCount);

  const grid = (
    <div
      className={
        layout === "list"
          ? "grid gap-4"
          : "grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8"
      }
    >
      {visible.map((product) => (
        <ProductCard key={product.slug} product={product} layout={layout} />
      ))}
    </div>
  );

  if (compact) {
    return grid;
  }

  const showingLabel = t("showingPieces")
    .replace("{shown}", String(shownCount))
    .replace("{total}", String(items.length));

  return (
    <div className="space-y-8">
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {shopItems.map((item) => {
          const active =
            (item.id === "all" && !collection && !query) || (collection != null && item.id === collection);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-5 py-2.5 text-[12px] font-semibold tracking-[0.08em] uppercase transition",
                active ? "bg-[#f0e092] text-[#6e6322] shadow-sm" : "bg-white text-oxford/55 shadow-sm hover:text-oxford",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-xl bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-lg bg-[#f4f3f0] px-3.5 py-2 text-[12px] font-semibold tracking-[0.08em] text-oxford uppercase">
            <input
              type="checkbox"
              className="size-3.5 accent-oxford"
              checked={inStock}
              onChange={(event) => setInStock(event.target.checked)}
            />
            {t("readyToShip")}
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] text-oxford/45 uppercase">
            {t("sortBy")}
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "featured" | "name" | "price-asc")}
              className="h-9 rounded-lg border-0 bg-[#f4f3f0] px-3 text-[12px] font-semibold tracking-[0.04em] text-oxford"
            >
              <option value="featured">{t("sortFeatured")}</option>
              <option value="name">{t("sortName")}</option>
              <option value="price-asc">{t("sortPriceLow")}</option>
            </select>
          </label>
          <div className="flex rounded-lg bg-[#f4f3f0] p-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
            <button
              type="button"
              onClick={() => setLayout("grid")}
              className={cn("rounded-md px-3 py-1.5", layout === "grid" && "bg-oxford text-white")}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setLayout("list")}
              className={cn("rounded-md px-3 py-1.5", layout === "list" && "bg-oxford text-white")}
            >
              List
            </button>
          </div>
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
            <p className="text-[10px] font-semibold tracking-[0.16em] text-oxford/45 uppercase">{showingLabel}</p>
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
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              >
                <ChevronRight className={`size-4 ${locale === "ar" ? "rotate-180" : ""}`} />
              </button>
            ) : null}
          </div>
          {!showAll && shownCount < items.length ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#f4f3f0] px-8 py-3 text-[12px] font-semibold tracking-[0.14em] text-oxford uppercase transition hover:bg-chip"
              onClick={() => setShowAll(true)}
            >
              {t("loadRemaining")}
              <ChevronDown className="size-4" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
