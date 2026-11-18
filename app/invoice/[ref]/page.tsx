import { notFound } from "next/navigation";
import { InvoiceActions } from "@/components/shop/invoice-actions";
import { getOrder, getSite } from "@/lib/local-db";
import { orderCustomer, orderLineItems, orderPayload } from "@/lib/order-view";
import { pick } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const inquiry = await getOrder(ref);
  if (!inquiry) notFound();
  const site = await getSite();
  const items = orderLineItems(inquiry);
  const customer = orderCustomer(inquiry);
  const payload = orderPayload(inquiry);
  const commerce = payload.commerce;
  const payment = payload.payment;
  const logo = site.chrome.logo || "/brand/boo-mark.png";
  const code = inquiry.reference_code.replace("#", "");
  const date = inquiry.created_at ? new Date(inquiry.created_at).toLocaleString("en-GB") : "";
  const subtotal = commerce?.subtotal ?? items.reduce((sum, item) => sum + item.priceEgp * item.quantity, 0);
  const discount = commerce?.discount ?? 0;
  const shipping = commerce?.shippingCharged ?? 0;
  const express = commerce?.expressCharged ?? 0;
  const total = commerce?.total ?? inquiry.quoted_price ?? subtotal + shipping + express - discount;

  return (
    <div className="invoice-sheet mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <InvoiceActions title="Download PDF" />
      <article className="mt-6 rounded-[1.6rem] bg-white p-6 text-oxford ring-1 ring-oxford/10 sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-oxford/10 pb-6">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="Boo" className="h-12 w-auto" />
            <p className="mt-3 text-xs tracking-[0.16em] uppercase text-oxford/50">Customer invoice</p>
            <h1 className="mt-1 font-heading text-4xl">Invoice #{code}</h1>
          </div>
          <div className="text-sm text-oxford/70">
            <p>{date}</p>
            <p className="mt-1">Boo Custom Gifts</p>
          </div>
        </header>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-oxford/45">Bill to</p>
            <p className="mt-1 font-heading text-xl">{customer.name}</p>
            <p className="mt-1 text-sm" dir="ltr">
              {customer.phone}
            </p>
            {customer.email ? <p className="text-sm">{customer.email}</p> : null}
            {customer.address ? <p className="mt-2 text-sm leading-relaxed">{customer.address}</p> : null}
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-oxford/45">Order</p>
            <p className="mt-1 text-sm">Reference #{code}</p>
            <p className="text-sm">
              Payment: {payment?.method === "online" ? "Online transfer" : payment?.method === "cod" ? "Cash on delivery" : "—"}
            </p>
            {payload.express ? <p className="text-sm">{pick(site.commerce.expressLabel, "en") || "Express order"}</p> : null}
          </div>
        </section>

        <table className="mt-8 w-full text-start text-sm">
          <thead>
            <tr className="border-b border-oxford/15 text-[11px] uppercase tracking-[0.12em] text-oxford/45">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 font-medium">Details</th>
              <th className="py-2 font-medium">Qty</th>
              <th className="py-2 text-end font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.slug || item.name}-${index}`} className="border-b border-oxford/8">
                <td className="py-3 font-heading">{item.name}</td>
                <td className="py-3 text-oxford/70">
                  {[item.color, item.dimensions?.length || item.dimensions?.width ? `${item.dimensions?.length || "?"}×${item.dimensions?.width || "?"}` : ""]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="py-3">{item.quantity}</td>
                <td className="py-3 text-end">{item.priceEgp * item.quantity} EGP</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ms-auto mt-6 max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{subtotal} EGP</dd>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between">
              <dt>Discount{commerce?.promoCode ? ` (${commerce.promoCode})` : ""}</dt>
              <dd>−{discount} EGP</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt>{pick(site.commerce.shippingLabel, "en") || "Shipping"}</dt>
            <dd>{commerce?.shippingFree ? "Free" : `${shipping} EGP`}</dd>
          </div>
          {express > 0 ? (
            <div className="flex justify-between">
              <dt>{pick(site.commerce.expressLabel, "en") || "Express"}</dt>
              <dd>{express} EGP</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-oxford/15 pt-2 font-heading text-lg">
            <dt>Total</dt>
            <dd>{total} EGP</dd>
          </div>
        </dl>

        {customer.notes ? (
          <p className="mt-8 text-sm text-oxford/70">
            Notes: {customer.notes}
          </p>
        ) : null}
        <p className="mt-8 text-xs text-oxford/45">This is the customer copy of your Boo order invoice.</p>
      </article>
    </div>
  );
}
