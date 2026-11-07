"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cartTotal, useCart, useCartHydrated } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export default function CheckoutPage() {
  const router = useRouter();
  const { t, formatPrice } = useI18n();
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);
  const total = cartTotal(items);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;
    setBusy(true);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        phone: data.get("phone"),
        email: data.get("email"),
        address: data.get("address"),
        notes: data.get("notes"),
        items: items.map((item) => ({
          slug: item.slug,
          name: item.name,
          quantity: item.quantity,
          color: item.color,
          priceEgp: item.priceEgp,
        })),
      }),
    });
    setBusy(false);
    if (!response.ok) {
      toast.error("Checkout failed");
      return;
    }
    const payload = (await response.json()) as { ref: string };
    setPlaced(true);
    clear();
    router.push(`/thanks?ref=${encodeURIComponent(payload.ref)}`);
  }

  useEffect(() => {
    if (hydrated && items.length === 0 && !placed && !busy) router.replace("/cart");
  }, [busy, hydrated, items.length, placed, router]);

  if (!hydrated) return null;

  if (items.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-5xl text-oxford">{t("checkout")}</h1>
      <p className="mt-2 text-muted-foreground">
        {t("total")}: {formatPrice(total)}
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          {t("name")}
          <input required name="name" className="mt-1 h-11 w-full rounded-full border border-border bg-white px-4" />
        </label>
        <label className="block text-sm">
          {t("phone")}
          <input required name="phone" className="mt-1 h-11 w-full rounded-full border border-border bg-white px-4" />
        </label>
        <label className="block text-sm">
          {t("email")}
          <input name="email" type="email" className="mt-1 h-11 w-full rounded-full border border-border bg-white px-4" />
        </label>
        <label className="block text-sm">
          {t("address")}
          <input required name="address" className="mt-1 h-11 w-full rounded-full border border-border bg-white px-4" />
        </label>
        <label className="block text-sm">
          {t("notes")}
          <textarea name="notes" rows={3} className="mt-1 w-full rounded-2xl border border-border bg-white px-4 py-3" />
        </label>
        <button type="submit" disabled={busy} className="btn-press w-full">
          {t("placeOrder")}
        </button>
      </form>
    </div>
  );
}
