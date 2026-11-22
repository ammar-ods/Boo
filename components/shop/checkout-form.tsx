"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cartHasCustom, cartTotal, useCart, useCartHydrated } from "@/lib/cart";
import { cartBreakdown, matchPromo } from "@/lib/commerce";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/site";
import { EditableCopy, EditableLoc } from "@/components/cms/editable-copy";
import { BackChevron } from "@/components/ui/back-chevron";
import { CartLines } from "@/components/shop/cart-lines";
import { DynamicShopFields } from "@/components/shop/dynamic-fields";
import { FreeShippingMeter } from "@/components/shop/free-shipping-meter";
import { flashStatus } from "@/components/status-flash";
import { shopReturnPath } from "@/lib/storefront-ui";
import { Banknote, Lock, QrCode } from "lucide-react";

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
  const { t, formatPrice, locale } = useI18n();
  const { site, setCommerce } = useEdit();
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const skipLeaveGuard = useRef(false);
  const popGuardRef = useRef<(() => void) | null>(null);
  const hasCustom = cartHasCustom(items);
  const blockCod = site.commerce.codBlockCustom !== false && hasCustom;
  const [method, setMethod] = useState<"cod" | "online">(blockCod ? "online" : "cod");
  const [receiptName, setReceiptName] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [express, setExpress] = useState(false);
  const subtotal = cartTotal(items);
  const payPhone = site.chrome.payPhone || "01000000000";
  const promo = useMemo(
    () => matchPromo(appliedCode, site.promo.codes ?? []),
    [appliedCode, site.promo.codes],
  );
  const breakdown = cartBreakdown(subtotal, site.commerce, promo, { express });
  const expressOffered = site.commerce.expressEnabled !== false && (site.commerce.expressPrice ?? 0) >= 0;
  const checkoutFields = site.commerce.checkoutFields?.length
    ? site.commerce.checkoutFields
    : [];

  function applyPromo() {
    const found = matchPromo(promoInput, site.promo.codes ?? []);
    if (!found) {
      toast.error(t("promoCode"));
      setAppliedCode("");
      return;
    }
    setAppliedCode(found.code);
    flashStatus(t("applied"), false, "success");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const fields: Record<string, string> = {};
    for (const field of checkoutFields.filter((item) => item.enabled)) {
      fields[field.key] = String(data.get(field.key) ?? "").trim();
      if (field.required && !fields[field.key]) {
        toast.error(pick(field.label, locale) || field.key);
        return;
      }
    }
    let receiptUrl = "";
    if (blockCod && method === "cod") {
      toast.error(t("payCodCustom"));
      return;
    }
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
        name: fields.name || data.get("name"),
        phone: fields.phone || data.get("phone"),
        address: fields.address || data.get("address"),
        email: fields.email || data.get("email"),
        notes: fields.notes || data.get("notes"),
        fields,
        promoCode: appliedCode,
        express,
        shipping: breakdown.shippingCharged,
        shippingFree: breakdown.shippingFree,
        discount: breakdown.discount,
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
          custom: item.custom,
          dimensions: item.dimensions,
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
    skipLeaveGuard.current = true;
    setPlaced(true);
    clear();
    router.push(`/thanks?ref=${encodeURIComponent(payload.ref)}`);
  }

  useEffect(() => {
    if (blockCod && method === "cod") setMethod("online");
  }, [blockCod, method]);

  useEffect(() => {
    window.history.pushState({ booCheckout: true }, "");
    function onPop() {
      if (skipLeaveGuard.current || placed) return;
      window.history.pushState({ booCheckout: true }, "");
      setLeaveOpen(true);
    }
    popGuardRef.current = onPop;
    window.addEventListener("popstate", onPop);
    return () => {
      popGuardRef.current = null;
      window.removeEventListener("popstate", onPop);
    };
  }, [placed]);

  function requestLeave() {
    setLeaveOpen(true);
  }

  function leaveHref() {
    return shopReturnPath();
  }

  function dropLeaveGuard() {
    skipLeaveGuard.current = true;
    const onPop = popGuardRef.current;
    if (onPop) {
      window.removeEventListener("popstate", onPop);
      popGuardRef.current = null;
    }
  }

  function confirmLeave() {
    dropLeaveGuard();
    setLeaveOpen(false);
    if (onBack) {
      if (window.history.state?.booCheckout) window.history.back();
      onBack();
      return;
    }
    const dest = leaveHref();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      router.replace(dest);
    };
    window.addEventListener("popstate", finish, { once: true });
    window.setTimeout(finish, 120);
    window.history.go(-2);
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

  const totals = (
    <dl className="space-y-1 text-sm">
      <div className="flex justify-between">
        <dt>
          <EditableCopy k="subtotal" />
        </dt>
        <dd>{formatPrice(breakdown.subtotal)}</dd>
      </div>
      {breakdown.discount > 0 ? (
        <div className="flex justify-between text-emerald-700">
          <dt>
            <EditableCopy k="discount" />
            {breakdown.promoCode ? ` (${breakdown.promoCode})` : ""}
          </dt>
          <dd>−{formatPrice(breakdown.discount)}</dd>
        </div>
      ) : null}
      {breakdown.expressCharged > 0 ? (
        <div className="flex justify-between">
          <dt>
            <EditableLoc
              value={site.commerce.expressLabel}
              fallback={t("expressOrder")}
              onChange={(expressLabel) => setCommerce({ expressLabel })}
            />
          </dt>
          <dd>{formatPrice(breakdown.expressCharged)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between">
        <dt>
          <EditableLoc
            value={site.commerce.shippingLabel}
            fallback={t("shipping")}
            onChange={(shippingLabel) => setCommerce({ shippingLabel })}
          />
        </dt>
        <dd className="text-end">
          {breakdown.shippingFree ? (
            <>
              <span className="me-2 text-oxford/40 line-through">{formatPrice(breakdown.shipping)}</span>
              <EditableCopy k="freeShipping" as="span" className="font-medium text-emerald-600" />
            </>
          ) : (
            formatPrice(breakdown.shippingCharged)
          )}
        </dd>
      </div>
      <div className="flex justify-between border-t border-oxford/10 pt-2 font-semibold text-oxford">
        <dt>
          <EditableCopy k="total" />
        </dt>
        <dd>{formatPrice(breakdown.total)}</dd>
      </div>
    </dl>
  );

  const bag = (
    <aside className="rounded-[16px] bg-[#f5f3ef] p-4 sm:p-5">
      <EditableCopy k="yourOrder" as="p" className="text-xs font-semibold tracking-[0.14em] text-oxford/45 uppercase" />
      <div className="mt-3 max-h-[min(22rem,50vh)] overflow-y-auto lg:max-h-[calc(100dvh-26rem)]">
        <CartLines items={items} compact />
      </div>
      {expressOffered ? (
        <label className="mt-4 flex cursor-pointer items-start justify-between gap-3 rounded-[12px] bg-white px-4 py-3 text-sm ring-1 ring-oxford/10">
          <span>
            <EditableLoc
              className="block font-medium text-oxford"
              value={site.commerce.expressLabel}
              fallback={t("expressOrder")}
              onChange={(expressLabel) => setCommerce({ expressLabel })}
            />
            <EditableCopy k="expressHint" as="span" className="text-xs text-muted-foreground" />
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xs font-semibold text-oxford">{formatPrice(site.commerce.expressPrice ?? 0)}</span>
            <input
              type="checkbox"
              className="size-4 accent-oxford"
              checked={express}
              onChange={(event) => setExpress(event.target.checked)}
            />
          </span>
        </label>
      ) : null}
      <div className="mt-4 flex gap-2">
        <input
          value={promoInput}
          onChange={(event) => setPromoInput(event.target.value)}
          placeholder={pick(site.commerce.copy.promoCode, locale) || t("promoCode")}
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-white px-4 text-sm"
        />
        <button type="button" className="h-11 rounded-full bg-white px-4 text-sm font-semibold ring-1 ring-oxford/10" onClick={applyPromo}>
          <EditableCopy k="apply" />
        </button>
      </div>
      <div className="mt-4">{totals}</div>
      <EditableLoc
        className="mt-2 block text-xs text-muted-foreground"
        value={site.commerce.shippingDetails}
        fallback=""
        onChange={(shippingDetails) => setCommerce({ shippingDetails })}
      />
    </aside>
  );

  return (
    <div className={embedded ? "" : "mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10"}>
      <button
        type="button"
        onClick={requestLeave}
        className="inline-flex min-h-9 items-center gap-1 text-sm text-oxford/70 hover:text-oxford"
      >
        <BackChevron />
        {onBack ? t("backDetails") : <EditableCopy k="yourBag" />}
      </button>
      <EditableCopy
        k="checkout"
        as="h1"
        className={`font-heading text-oxford ${embedded ? "mt-1 text-3xl" : "text-4xl lg:text-5xl"}`}
      />
      <div className="mt-4">
        <FreeShippingMeter amount={breakdown.subtotal - breakdown.discount} />
      </div>
      <div
        className={
          embedded
            ? "mt-4 space-y-5"
            : "mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] rtl:lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]"
        }
      >
        {embedded ? bag : <div className="order-1 lg:col-start-2 rtl:lg:col-start-1 lg:sticky lg:top-36">{bag}</div>}
        <form
          onSubmit={onSubmit}
          className={
            embedded
              ? "space-y-4"
              : "order-2 space-y-5 lg:col-start-1 rtl:lg:col-start-2 lg:row-start-1"
          }
        >
        <DynamicShopFields fields={checkoutFields} />

        <fieldset className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-oxford" />
              <EditableCopy k="paymentTitle" as="h2" className="font-heading text-lg text-oxford" />
            </div>
            <EditableCopy k="paymentSafe" as="p" className="text-xs text-oxford/50" />
          </div>
          <input type="hidden" name="method" value={method} />
          <div className="space-y-3">
            <div
              className={`overflow-hidden rounded-2xl bg-white ring-1 transition ${
                method === "online" ? "ring-2 ring-oxford" : "ring-oxford/10"
              }`}
            >
              <button
                type="button"
                className="flex w-full items-center gap-3 p-4 text-start"
                onClick={() => setMethod("online")}
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                    method === "online" ? "border-oxford" : "border-oxford/30"
                  }`}
                >
                  {method === "online" ? <span className="size-2.5 rounded-full bg-oxford" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <EditableCopy k="payOnline" as="span" className="font-heading text-base text-oxford sm:text-lg" />
                    <EditableCopy
                      k="payOnlineFast"
                      as="span"
                      className="rounded-full bg-[#f0e092] px-2 py-0.5 text-[10px] font-semibold text-[#6e6322]"
                    />
                  </span>
                  <EditableCopy k="payOnlineBody" as="span" className="mt-1 block text-xs leading-relaxed text-muted-foreground" />
                </span>
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#f4f1ea] text-oxford">
                  <QrCode className="size-6" />
                </span>
              </button>
              {method === "online" ? (
                <div className="pay-online-in space-y-4 border-t border-oxford/8 px-4 pb-4 pt-3">
                  <p className="font-heading text-2xl tracking-wide text-oxford" dir="ltr">
                    {payPhone}
                  </p>
                  <EditableCopy k="payOnlineHint" as="p" className="text-sm leading-relaxed text-muted-foreground" />
                  <label className="block text-sm">
                    <EditableCopy k="transferPhone" />
                    <input
                      required={method === "online"}
                      name="transferPhone"
                      inputMode="tel"
                      className="mt-1 h-11 w-full rounded-full border border-oxford/20 bg-cream px-4"
                    />
                  </label>
                  <label className="block text-sm">
                    <EditableCopy k="receipt" />
                    <span className="mt-1 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-oxford/20 bg-cream px-4 py-6 text-center">
                      <span className="font-heading text-oxford">{receiptName || pick(site.commerce.copy.receipt, locale) || t("receipt")}</span>
                      <EditableCopy k="receiptHint" as="span" className="mt-1 text-xs text-muted-foreground" />
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
            </div>

            <button
              type="button"
              disabled={blockCod}
              onClick={() => {
                if (!blockCod) setMethod("cod");
              }}
              className={`flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-start ring-1 transition ${
                blockCod
                  ? "cursor-not-allowed opacity-45 grayscale ring-oxford/10"
                  : method === "cod"
                    ? "ring-2 ring-oxford"
                    : "ring-oxford/10"
              }`}
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                  method === "cod" ? "border-oxford" : "border-oxford/30"
                }`}
              >
                {method === "cod" ? <span className="size-2.5 rounded-full bg-oxford" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <EditableCopy k="payCod" as="span" className="font-heading text-base text-oxford sm:text-lg" />
                <EditableCopy
                  k={blockCod ? "payCodCustom" : "payCodBody"}
                  as="span"
                  className="mt-1 block text-xs leading-relaxed text-muted-foreground"
                />
              </span>
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#f4f1ea] text-oxford">
                <Banknote className="size-6" />
              </span>
            </button>
          </div>
        </fieldset>

        <button type="submit" disabled={busy} className="btn-press sticky bottom-3 z-10 w-full lg:static">
          {busy ? "…" : <EditableCopy k="placeOrder" />}
        </button>
      </form>
      </div>
      {leaveOpen ? (
        <div className="fixed inset-0 z-[140] grid place-items-center bg-oxford/45 p-4">
          <div className="w-full max-w-sm rounded-[1.6rem] bg-white p-6 text-center shadow-2xl">
            <EditableCopy k="leaveCheckout" as="h2" className="font-heading text-2xl text-oxford" />
            <EditableCopy k="leaveCheckoutBody" as="p" className="mt-2 text-sm leading-relaxed text-muted-foreground" />
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="h-11 flex-1 rounded-full bg-cream text-sm font-semibold text-oxford"
                onClick={() => setLeaveOpen(false)}
              >
                <EditableCopy k="stayCheckout" />
              </button>
              <button type="button" className="h-11 flex-1 rounded-full bg-oxford text-sm font-semibold text-white" onClick={confirmLeave}>
                <EditableCopy k="confirmLeave" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
