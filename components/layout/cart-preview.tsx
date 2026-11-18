"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Minus, Plus, X } from "lucide-react";
import { cartCount, cartTotal, useCart, useCartHydrated } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useStorefrontUi } from "@/lib/storefront-ui";

export function CartPreview() {
  const pathname = usePathname();
  const { t, locale, formatPrice } = useI18n();
  const open = useStorefrontUi((s) => s.cartOpen);
  const setCartOpen = useStorefrontUi((s) => s.setCartOpen);
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const total = cartTotal(items);
  const count = cartCount(items);
  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) return null;

  return (
    <div className={`fixed inset-0 z-[70] ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button
        type="button"
        aria-label="Close cart"
        className={`absolute inset-0 bg-oxford/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setCartOpen(false)}
      />
      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[86vh] w-full flex-col bg-white shadow-[0_-18px_50px_-24px_rgba(10,37,64,0.4)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:inset-x-auto md:inset-y-0 md:end-0 md:max-h-none md:w-[min(34rem,100vw)] md:shadow-2xl ${
          open
            ? "translate-y-0 opacity-100 md:translate-x-0"
            : "pointer-events-none translate-y-6 opacity-0 md:translate-y-0 md:translate-x-full rtl:md:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-oxford/8 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <p className="font-heading text-2xl text-oxford md:text-3xl">{t("yourBag")}</p>
            {hydrated && count > 0 ? (
              <span className="rounded-full bg-[#f4f3f0] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.14em] text-oxford/55 uppercase">
                {count} {t("bagItems")}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full bg-[#f4f3f0] text-oxford"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-8">
          {!hydrated ? null : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("emptyCart")}</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-xl bg-[#f7f6f3] p-3.5">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-chip sm:h-28 sm:w-24">
                    <Image src={item.image} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-heading text-base text-oxford">
                          {locale === "ar" ? item.nameAr : item.name}
                        </p>
                        {item.color ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {t("color")}: <span className="text-oxford">{item.color}</span>
                          </p>
                        ) : null}
                        {item.dimensions?.length || item.dimensions?.width ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {t("dimensions")}:{" "}
                            <span className="text-oxford">
                              {item.dimensions.length || "?"} × {item.dimensions.width || "?"}
                            </span>
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-oxford">{formatPrice(item.priceEgp)}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-lg bg-white px-1.5 py-1">
                        <button
                          type="button"
                          className="grid size-7 place-items-center text-oxford/50 hover:text-oxford"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          aria-label={t("quantity")}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          className="grid size-7 place-items-center text-oxford/50 hover:text-oxford"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          aria-label={t("quantity")}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-[11px] font-semibold tracking-[0.12em] text-oxford/40 uppercase hover:text-red-700"
                        onClick={() => remove(item.id)}
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-oxford/8 px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-8 md:pb-5">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <p className="font-heading text-xl text-oxford">{t("estimatedTotal")}</p>
              <p className="text-[11px] tracking-[0.08em] text-oxford/40 uppercase">{t("shipping")}</p>
            </div>
            <p className="font-heading text-2xl font-semibold text-oxford">{formatPrice(total)}</p>
          </div>
          <Link
            href="/checkout"
            className="btn-press flex w-full items-center justify-center gap-2 text-center"
            onClick={() => setCartOpen(false)}
          >
            <Lock className="size-4" />
            {t("proceedCheckout")} — {formatPrice(total)}
          </Link>
          <Link
            href="/cart"
            className="btn-press btn-press-outline mt-2.5 flex w-full text-center"
            onClick={() => setCartOpen(false)}
          >
            {t("viewCart")}
          </Link>
        </div>
      </div>
    </div>
  );
}
