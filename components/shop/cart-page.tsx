"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { EditableCopy, EditableLoc } from "@/components/cms/editable-copy";
import { FreeShippingMeter } from "@/components/shop/free-shipping-meter";
import { SiteCanvas } from "@/components/cms/site-canvas";
import { EnsureCmsPage } from "@/components/cms/ensure-cms-page";
import { cartBreakdown } from "@/lib/commerce";
import { cartTotal, useCart, useCartHydrated } from "@/lib/cart";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { CartLines } from "@/components/shop/cart-lines";
import type { Bundle } from "@/lib/bundles";
import type { Product } from "@/lib/products";

export function CartPage({ products, bundles = [] }: { products: Product[]; bundles?: Bundle[] }) {
  const { t, formatPrice } = useI18n();
  const { site, setCommerce } = useEdit();
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const subtotal = cartTotal(items);
  const breakdown = cartBreakdown(subtotal, site.commerce);
  if (!hydrated) return null;

  return (
    <>
    <EnsureCmsPage slug="cart" title={{ ar: "السلة", en: "Cart" }} />
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <EditableCopy k="cart" as="h1" className="font-heading text-4xl text-oxford lg:text-5xl" />
      {items.length === 0 ? (
        <div className="mt-8 rounded-[20px] bg-white p-10 text-center ring-1 ring-oxford/8">
          <EditableCopy k="emptyCart" as="p" className="text-muted-foreground" />
          <Link href="/catalog" className="btn-press mt-6 inline-flex">
            <EditableCopy k="continue" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <FreeShippingMeter amount={breakdown.subtotal} />
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] rtl:lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
            <section className="rounded-[20px] bg-white p-4 ring-1 ring-oxford/8 sm:p-6 lg:col-start-2 rtl:lg:col-start-1">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <EditableCopy
                  k="yourOrder"
                  as="p"
                  className="text-xs font-semibold tracking-[0.14em] text-oxford/45 uppercase"
                />
                <p className="text-sm text-muted-foreground">
                  {items.length} <EditableCopy k="bagItems" />
                </p>
              </div>
              <CartLines items={items} editable />
            </section>

            <aside className="rounded-[20px] bg-white p-5 ring-1 ring-oxford/8 sm:p-6 lg:sticky lg:top-36 lg:col-start-1 lg:row-start-1 rtl:lg:col-start-2">
              <EditableCopy k="yourBag" as="h2" className="font-heading text-2xl text-oxford" />
              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between text-oxford/80">
                  <dt>
                    <EditableCopy k="subtotal" />
                  </dt>
                  <dd>{formatPrice(breakdown.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-oxford/80">
                  <dt>
                    <EditableLoc
                      value={site.commerce.shippingLabel}
                      fallback={t("shipping")}
                      onChange={(shippingLabel) => setCommerce({ shippingLabel })}
                    />
                  </dt>
                  <dd>
                    {breakdown.shippingFree ? (
                      <EditableCopy k="freeShipping" as="span" className="font-medium text-emerald-600" />
                    ) : (
                      formatPrice(breakdown.shippingCharged)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-oxford/10 pt-3 font-heading text-lg font-semibold text-oxford">
                  <dt>
                    <EditableCopy k="total" />
                  </dt>
                  <dd>{formatPrice(breakdown.total)}</dd>
                </div>
              </dl>
              {site.commerce.shippingDetails ? (
                <EditableLoc
                  className="mt-3 block text-xs leading-relaxed text-muted-foreground"
                  value={site.commerce.shippingDetails}
                  fallback=""
                  onChange={(shippingDetails) => setCommerce({ shippingDetails })}
                />
              ) : null}
              <Link href="/checkout" className="btn-press mt-6 flex w-full items-center justify-center gap-2">
                <Lock className="size-4" />
                <EditableCopy k="proceedCheckout" /> — {formatPrice(breakdown.total)}
              </Link>
              <Link href="/catalog" className="mt-3 flex w-full justify-center text-sm font-medium text-oxford/60 hover:text-oxford">
                <EditableCopy k="continue" />
              </Link>
            </aside>
          </div>
        </div>
      )}
    </div>
    <SiteCanvas products={products} bundles={bundles} />
    </>
  );
}
