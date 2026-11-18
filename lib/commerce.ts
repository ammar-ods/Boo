import type { Commerce, PromoCode } from "@/lib/site";

export function matchPromo(code: string | undefined, codes: PromoCode[]) {
  const needle = (code || "").trim().toUpperCase();
  if (!needle) return null;
  return codes.find((item) => item.active && item.code.toUpperCase() === needle) ?? null;
}

export function cartBreakdown(
  subtotal: number,
  commerce: Commerce,
  promo?: PromoCode | null,
  options?: { express?: boolean },
) {
  const discount = promo ? Math.min(subtotal, Math.round((subtotal * promo.percent) / 100)) : 0;
  const afterPromo = Math.max(0, subtotal - discount);
  const shipping = commerce.shippingPrice || 0;
  const free = commerce.freeShippingMin > 0 && afterPromo >= commerce.freeShippingMin;
  const shippingCharged = free ? 0 : shipping;
  const expressOn = Boolean(options?.express && commerce.expressEnabled !== false);
  const expressCharged = expressOn ? Math.max(0, Number(commerce.expressPrice) || 0) : 0;
  return {
    subtotal,
    discount,
    promoPercent: promo?.percent ?? 0,
    promoCode: promo?.code ?? "",
    shipping,
    shippingFree: free,
    shippingCharged,
    express: expressOn,
    expressCharged,
    total: afterPromo + shippingCharged + expressCharged,
  };
}
