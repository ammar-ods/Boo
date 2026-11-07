"use client";

import Image from "next/image";
import Link from "next/link";
import { cartTotal, useCart, useCartHydrated } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export default function CartPage() {
  const { t, locale, formatPrice } = useI18n();
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const total = cartTotal(items);
  if (!hydrated) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-5xl text-oxford">{t("cart")}</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          {t("emptyCart")}{" "}
          <Link href="/catalog" className="font-medium text-oxford">
            {t("continue")}
          </Link>
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="surface-card flex gap-4 p-4">
              <div className="relative size-24 overflow-hidden rounded-2xl bg-chip">
                <Image src={item.image} alt="" fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-xl text-oxford">{locale === "ar" ? item.nameAr : item.name}</p>
                <p className="text-sm text-muted-foreground">{item.color}</p>
                <p className="mt-1 font-medium">{formatPrice(item.priceEgp)}</p>
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <button type="button" onClick={() => setQuantity(item.id, item.quantity - 1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => setQuantity(item.id, item.quantity + 1)}>
                    +
                  </button>
                  <button type="button" className="ms-auto text-muted-foreground" onClick={() => remove(item.id)}>
                    {t("remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-4">
            <p className="text-lg font-semibold">
              {t("total")}: {formatPrice(total)}
            </p>
            <Link href="/checkout" className="btn-press">
              {t("checkout")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
