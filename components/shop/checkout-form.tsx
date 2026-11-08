"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cartTotal, useCart, useCartHydrated } from "@/lib/cart";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function CheckoutForm({
  embedded,
  onBack,
}: {
  embedded?: boolean;
  onBack?: () => void;
}) {
  const router = useRouter();
  const { t, formatPrice } = useI18n();
  const { site } = useEdit();
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [method, setMethod] = useState<"cod" | "online">("cod");
  const [receiptName, setReceiptName] = useState("");
  const total = cartTotal(items);
  const payPhone = site.chrome.payPhone || "01000000000";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    let receiptUrl = "";
    if (method === "online") {
      const transferPhone = String(data.get("transferPhone") ?? "").trim();
      const receipt = data.get("receipt");
      if (!transferPhone) {
        toast.error(t("transferPhone"));
        return;
      }
      if (!(receipt instanceof File) || receipt.size === 0) {
        toast.error(t("receipt"));
        return;
      }
      receiptUrl = await readFileAsDataUrl(receipt);
    }
    setBusy(true);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        phone: data.get("phone"),
        address: data.get("address"),
        notes: data.get("notes"),
        payment: {
          method,
          transferPhone: method === "online" ? String(data.get("transferPhone") ?? "").trim() : "",
          receiptUrl,
        },
        items: items.map((item) => ({
          slug: item.slug,
          name: item.name,
          quantity: item.quantity,
          color: item.color,
          priceEgp: item.priceEgp,
          image: item.image,
          viewMockups: item.viewMockups,
          uploads: item.uploads,
        })),
      }),
    });
    setBusy(false);
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      toast.error(payload.error || "Checkout failed");
      return;
    }
    const payload = (await response.json()) as { ref: string };
    setPlaced(true);
    clear();
    router.push(`/thanks?ref=${encodeURIComponent(payload.ref)}`);
  }

  useEffect(() => {
    if (!hydrated || items.length > 0 || placed || busy) return;
    if (embedded) {
      onBack?.();
      return;
    }
    router.replace("/cart");
  }, [busy, embedded, hydrated, items.length, onBack, placed, router]);

  if (!hydrated) return null;
  if (items.length === 0) return null;

  return (
    <div className={embedded ? "" : "mx-auto w-full max-w-xl px-5 py-12 sm:px-8"}>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-9 items-center text-sm text-oxford/70 hover:text-oxford"
        >
          ← {t("backDetails")}
        </button>
      ) : null}
      <h1 className={`font-heading text-oxford ${embedded ? "mt-1 text-3xl" : "text-5xl"}`}>
        {t("checkout")}
      </h1>
      <p className={embedded ? "mt-1 text-sm text-muted-foreground" : "mt-2 text-muted-foreground"}>
        {t("total")}: {formatPrice(total)}
      </p>
      <form onSubmit={onSubmit} className={embedded ? "mt-5 space-y-4" : "mt-8 space-y-5"}>
        <label className="block text-sm">
          {t("name")}
          <input required name="name" className="mt-1 h-11 w-full rounded-full border border-border bg-white px-4" />
        </label>
        <label className="block text-sm">
          {t("phone")}
          <input required name="phone" inputMode="tel" className="mt-1 h-11 w-full rounded-full border border-border bg-white px-4" />
        </label>
        <label className="block text-sm">
          {t("address")}
          <input required name="address" className="mt-1 h-11 w-full rounded-full border border-border bg-white px-4" />
        </label>
        <label className="block text-sm">
          {t("notes")}
          <textarea name="notes" rows={3} className="mt-1 w-full rounded-2xl border border-border bg-white px-4 py-3" />
        </label>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-oxford">{t("payment")}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-2xl bg-white p-4 ring-1 transition ${
                method === "cod" ? "ring-2 ring-oxford" : "ring-oxford/10"
              }`}
            >
              <input
                type="radio"
                name="method"
                className="sr-only"
                checked={method === "cod"}
                onChange={() => setMethod("cod")}
              />
              <p className="font-heading text-lg text-oxford">{t("payCod")}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">COD</p>
            </label>
            <label
              className={`cursor-pointer rounded-2xl bg-white p-4 ring-1 transition ${
                method === "online" ? "ring-2 ring-oxford" : "ring-oxford/10"
              }`}
            >
              <input
                type="radio"
                name="method"
                className="sr-only"
                checked={method === "online"}
                onChange={() => setMethod("online")}
              />
              <p className="font-heading text-lg text-oxford">{t("payOnline")}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">InstaPay / wallet</p>
            </label>
          </div>

          {method === "online" ? (
            <div className="pay-online-in rounded-[1.6rem] bg-white p-5 ring-1 ring-oxford/10">
              <p className="text-xs font-semibold tracking-[0.14em] text-oxford/45 uppercase">
                {t("payOnline")}
              </p>
              <p className="mt-2 font-heading text-3xl tracking-wide text-oxford" dir="ltr">
                {payPhone}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("payOnlineHint")}</p>
              <label className="mt-5 block text-sm">
                {t("transferPhone")}
                <input
                  required={method === "online"}
                  name="transferPhone"
                  inputMode="tel"
                  className="mt-1 h-11 w-full rounded-full border border-border bg-cream px-4"
                />
              </label>
              <label className="mt-4 block text-sm">
                {t("receipt")}
                <span className="mt-1 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-oxford/20 bg-cream px-4 py-6 text-center">
                  <span className="font-heading text-oxford">{receiptName || t("receipt")}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{t("receiptHint")}</span>
                </span>
                <input
                  required={method === "online"}
                  name="receipt"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => setReceiptName(event.target.files?.[0]?.name ?? "")}
                />
              </label>
            </div>
          ) : null}
        </fieldset>

        <button type="submit" disabled={busy} className="btn-press w-full">
          {busy ? "…" : t("placeOrder")}
        </button>
      </form>
    </div>
  );
}
