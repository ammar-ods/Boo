"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cartTotal, useCart, useCartHydrated } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useStorefrontUi } from "@/lib/storefront-ui";

export function CartPreview() {
  const pathname = usePathname();
  const { t, locale, formatPrice } = useI18n();
  const open = useStorefrontUi((s) => s.cartOpen);
  const setCartOpen = useStorefrontUi((s) => s.setCartOpen);
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const total = cartTotal(items);
  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) return null;

  return (
    <div className={`fixed inset-0 z-[70] ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button
        type="button"
        aria-label="Close cart"
        className={`absolute inset-0 bg-oxford/25 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setCartOpen(false)}
      />
      <div
        className={`absolute inset-x-3 bottom-[4.9rem] w-auto origin-bottom rounded-[1.6rem] bg-background p-4 shadow-[0_24px_70px_-28px_rgba(10,37,64,0.45)] ring-1 ring-oxford/10 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:inset-x-auto md:end-8 md:top-[4.75rem] md:bottom-auto md:w-[min(22rem,calc(100vw-1.5rem))] md:origin-top ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-95 opacity-0 md:translate-y-0 md:-translate-y-2"
        }`}
      >
        <p className="font-heading text-2xl text-oxford">{t("cart")}</p>
        {!hydrated ? null : items.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("emptyCart")}</p>
        ) : (
          <div className="mt-3 max-h-[min(50vh,22rem)] space-y-3 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative size-14 overflow-hidden rounded-xl bg-chip">
                  <Image src={item.image} alt="" fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-oxford">{locale === "ar" ? item.nameAr : item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatPrice(item.priceEgp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 border-t border-oxford/10 pt-3">
          <p className="text-sm font-semibold text-oxford">
            {t("total")}: {formatPrice(total)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/cart"
              className="btn-press btn-press-outline btn-press-sm text-center"
              onClick={() => setCartOpen(false)}
            >
              {t("viewCart")}
            </Link>
            <Link
              href="/checkout"
              className="btn-press btn-press-sm text-center"
              onClick={() => setCartOpen(false)}
            >
              {t("checkoutNow")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
