"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { cartBreakdown } from "@/lib/commerce";
import { cartTotal, useCart, useCartHydrated } from "@/lib/cart";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/site";
import { CartLines } from "@/components/shop/cart-lines";

export default function CartPage() {
  const { t, formatPrice, locale } = useI18n();
  const { site } = useEdit();
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const subtotal = cartTotal(items);
  const breakdown = cartBreakdown(subtotal, site.commerce);
  if (!hydrated) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <h1 className="font-heading text-4xl text-oxford lg:text-5xl">{t("cart")}</h1>
      {items.length === 0 ? (
        <div className="mt-8 rounded-[20px] bg-white p-10 text-center ring-1 ring-oxford/8">
          <p className="text-muted-foreground">{t("emptyCart")}</p>
          <Link href="/catalog" className="btn-press mt-6 inline-flex">
            {t("continue")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] rtl:lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
          <section className="rounded-[20px] bg-white p-4 ring-1 ring-oxford/8 sm:p-6 lg:col-start-2 rtl:lg:col-start-1">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.14em] text-oxford/45 uppercase">{t("yourOrder")}</p>
              <p className="text-sm text-muted-foreground">
                {items.length} {t("bagItems")}
              </p>
            </div>
            <CartLines items={items} editable />
          </section>

          <aside className="rounded-[20px] bg-white p-5 ring-1 ring-oxford/8 sm:p-6 lg:sticky lg:top-36 lg:col-start-1 lg:row-start-1 rtl:lg:col-start-2">
            <h2 className="font-heading text-2xl text-oxford">{t("yourBag")}</h2>
            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between text-oxford/80">
                <dt>{t("subtotal")}</dt>
                <dd>{formatPrice(breakdown.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-oxford/80">
                <dt>{pick(site.commerce.shippingLabel, locale) || t("shipping")}</dt>
                <dd>
                  {breakdown.shippingFree ? (
                    <span className="font-medium text-emerald-600">{t("freeShipping")}</span>
                  ) : (
                    formatPrice(breakdown.shippingCharged)
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t border-oxford/10 pt-3 font-heading text-lg font-semibold text-oxford">
                <dt>{t("total")}</dt>
                <dd>{formatPrice(breakdown.total)}</dd>
              </div>
            </dl>
            {pick(site.commerce.shippingDetails, locale) ? (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {pick(site.commerce.shippingDetails, locale)}
              </p>
            ) : null}
            <Link href="/checkout" className="btn-press mt-6 flex w-full items-center justify-center gap-2">
              <Lock className="size-4" />
              {t("proceedCheckout")} — {formatPrice(breakdown.total)}
            </Link>
            <Link href="/catalog" className="mt-3 flex w-full justify-center text-sm font-medium text-oxford/60 hover:text-oxford">
              {t("continue")}
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
