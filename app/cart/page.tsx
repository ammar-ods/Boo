"use client";

import Link from "next/link";
import { cartTotal, useCart, useCartHydrated } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { CartLines } from "@/components/shop/cart-lines";

export default function CartPage() {
  const { t, formatPrice } = useI18n();
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const total = cartTotal(items);
  if (!hydrated) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <h1 className="font-heading text-4xl text-oxford lg:text-5xl">{t("cart")}</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          {t("emptyCart")}{" "}
          <Link href="/catalog" className="font-medium text-oxford">
            {t("continue")}
          </Link>
        </p>
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] rtl:lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
          <aside className="order-1 rounded-[16px] bg-[#f5f3ef] p-4 sm:p-5 lg:col-start-2 lg:sticky lg:top-36 rtl:lg:col-start-1">
            <p className="text-xs font-semibold tracking-[0.14em] text-oxford/45 uppercase">{t("yourOrder")}</p>
            <div className="mt-3 max-h-[min(28rem,55vh)] overflow-y-auto lg:max-h-[calc(100dvh-22rem)]">
              <CartLines items={items} editable compact />
            </div>
            <div className="mt-4 hidden justify-between border-t border-oxford/10 pt-3 text-sm font-semibold text-oxford lg:flex">
              <span>{t("total")}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </aside>

          <div className="order-2 hidden rounded-[16px] bg-white p-5 ring-1 ring-oxford/8 lg:col-start-1 lg:row-start-1 lg:block rtl:lg:col-start-2 sm:p-6">
            <h2 className="font-heading text-2xl text-oxford">{t("checkout")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("estimatedTotal")}</p>
            <div className="mt-6 flex items-end justify-between border-t border-oxford/10 pt-4">
              <span className="text-sm font-medium text-oxford/70">{t("total")}</span>
              <span className="font-heading text-3xl font-semibold text-oxford">{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" className="btn-press mt-6 flex w-full text-center">
              {t("proceedCheckout")} — {formatPrice(total)}
            </Link>
            <Link href="/catalog" className="btn-press btn-press-outline mt-3 flex w-full text-center">
              {t("continue")}
            </Link>
          </div>

          <div className="sticky bottom-3 z-10 order-3 flex items-center justify-between gap-3 rounded-[14px] bg-white p-3 shadow-[0_8px_30px_-16px_rgba(10,37,64,0.45)] ring-1 ring-oxford/10 lg:hidden">
            <p className="text-sm font-semibold text-oxford">{formatPrice(total)}</p>
            <Link href="/checkout" className="btn-press px-5 py-2.5 text-sm">
              {t("checkout")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
