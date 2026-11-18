import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaLightbox } from "@/components/admin/media-lightbox";
import { OrderProductCards } from "@/components/admin/order-product-cards";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { OrderSaveForm } from "@/components/admin/order-save-form";
import { Label } from "@/components/ui/label";
import { getOrder } from "@/lib/local-db";
import { orderCustomer, orderLineItems, orderPayload } from "@/lib/order-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

function looksLikeImage(url: string) {
  return (
    /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url) ||
    url.includes("/storage/v1/object/") ||
    url.startsWith("/uploads/") ||
    url.startsWith("/products/") ||
    url.startsWith("data:image")
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-oxford/8 py-2.5 last:border-0">
      <dt className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-end text-sm text-oxford">{value}</dd>
    </div>
  );
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getOrder(id);
  if (!inquiry) notFound();

  const payload = orderPayload(inquiry);
  const items = orderLineItems(inquiry);
  const customer = orderCustomer(inquiry);
  const payment = payload.payment;
  const commerce = payload.commerce;
  const extras = (inquiry.production_paths ?? []).filter(
    (path) => path !== inquiry.mockup_path && path !== payment?.receiptUrl,
  );
  const labeledViews = (payload.views ?? []).filter((item) => item.url);
  const previewImages = (
    labeledViews.length
      ? labeledViews.map((item) => item.url as string)
      : [inquiry.mockup_path, ...extras]
  ).filter((path): path is string => typeof path === "string" && looksLikeImage(path));
  const uploadFiles = (payload.uploads ?? []).filter((item) => item.url);
  const otherFiles = extras.filter((path) => !looksLikeImage(path));
  const subtotal = commerce?.subtotal ?? items.reduce((sum, item) => sum + item.priceEgp * item.quantity, 0);
  const discount = commerce?.discount ?? 0;
  const shipping = commerce?.shippingCharged ?? 0;
  const express = commerce?.expressCharged ?? 0;
  const total = commerce?.total ?? inquiry.quoted_price ?? subtotal + shipping + express - discount;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <Link href="/admin/inquiries" className="inline-flex min-h-10 items-center text-sm text-oxford/70 hover:text-oxford">
        ← All orders
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-heading text-base text-boo-teal">#{inquiry.reference_code.replace("#", "")}</p>
          <h1 className="font-heading text-4xl text-oxford">{customer.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : ""}
          </p>
        </div>
        <Link
          href={`/admin/inquiries/${inquiry.id}/invoice`}
          className="rounded-full bg-oxford px-4 py-2 font-heading text-sm text-white"
        >
          Download invoice PDF
        </Link>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="font-heading text-xl text-oxford">Products</h2>
          <p className="text-xs text-muted-foreground">Click a card for full details</p>
        </div>
        <OrderProductCards inquiry={inquiry} compact />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <div>
            <h2 className="font-heading text-xl text-oxford">Submitted preview</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              For mugs, the large card is the unfolded wrap — seam to seam — so you can see print placement.
            </p>
          </div>
          {previewImages.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previewImages.map((file, index) => (
                <article
                  key={file}
                  className={`overflow-hidden rounded-2xl bg-white ring-1 ring-foreground/10 ${
                    index === 0 ? "col-span-2 sm:col-span-2" : ""
                  }`}
                >
                  <MediaLightbox src={file} label={labeledViews[index]?.label || "Preview"}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file}
                      alt={labeledViews[index]?.label || (index === 0 ? "Front preview" : "Order preview")}
                      className={`w-full bg-[#f6f3ee] object-contain ${index === 0 ? "h-56" : "h-28"}`}
                    />
                  </MediaLightbox>
                  {labeledViews[index]?.label ? (
                    <p className="px-2.5 pt-2 text-xs font-semibold">{labeledViews[index]?.label}</p>
                  ) : null}
                  <div className="flex items-center justify-between gap-2 px-2.5 py-2 text-xs">
                    <MediaLightbox src={file} label={labeledViews[index]?.label || "Preview"}>
                      <span className="font-heading text-boo-teal">View</span>
                    </MediaLightbox>
                    <a className="font-heading text-boo-orange" href={file} download>
                      Download
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] bg-white px-6 py-12 text-center text-sm text-muted-foreground ring-1 ring-oxford/8">
              No mockup preview is stored on this order yet.
            </div>
          )}

          <div>
            <h2 className="mb-3 font-heading text-xl text-oxford">Customer uploads</h2>
            <ul className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {uploadFiles.map((file) => (
                <li key={file.url} className="overflow-hidden rounded-2xl bg-white ring-1 ring-foreground/10">
                  {looksLikeImage(file.url || "") ? (
                    <MediaLightbox src={file.url || ""} label={file.name || "Upload"}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file.url} alt={file.name || ""} className="h-28 w-full bg-[#f6f3ee] object-contain" />
                    </MediaLightbox>
                  ) : null}
                  <div className="px-3 py-2">
                    <p className="truncate text-xs text-muted-foreground">{file.name || file.url?.split("/").pop()}</p>
                    <div className="mt-2 flex gap-3 text-xs">
                      {looksLikeImage(file.url || "") ? (
                        <MediaLightbox src={file.url || ""} label={file.name || "Upload"}>
                          <span className="font-heading text-boo-teal">View</span>
                        </MediaLightbox>
                      ) : (
                        <a className="font-heading text-boo-teal" href={file.url} target="_blank" rel="noreferrer">
                          View
                        </a>
                      )}
                      <a className="font-heading text-boo-orange" href={file.url} download>
                        Download
                      </a>
                    </div>
                  </div>
                </li>
              ))}
              {otherFiles.map((file) => (
                <li key={file} className="rounded-2xl bg-white px-3 py-3 ring-1 ring-foreground/10">
                  <p className="truncate text-xs text-muted-foreground">{file.split("/").pop()}</p>
                  <div className="mt-2 flex gap-3 text-xs">
                    <a className="font-heading text-boo-teal" href={file} target="_blank" rel="noreferrer">
                      View
                    </a>
                    <a className="font-heading text-boo-orange" href={file} download>
                      Download
                    </a>
                  </div>
                </li>
              ))}
              {previewImages.length === 0 && otherFiles.length === 0 && uploadFiles.length === 0 ? (
                <li className="col-span-full rounded-[1.4rem] bg-white px-6 py-8 text-center text-muted-foreground ring-1 ring-oxford/8">
                  No files were attached to this inquiry.
                </li>
              ) : otherFiles.length === 0 && uploadFiles.length === 0 ? (
                <li className="col-span-full rounded-[1.4rem] bg-white px-6 py-6 text-center text-muted-foreground ring-1 ring-oxford/8">
                  Artwork is in the preview images above.
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
            <h2 className="font-heading text-lg text-oxford">Customer</h2>
            <dl className="mt-2">
              <Row label="Name" value={customer.name} />
              <Row label="Phone" value={<span dir="ltr">{inquiry.customer_phone}</span>} />
              {customer.email ? <Row label="Email" value={customer.email} /> : null}
              {customer.address ? <Row label="Address" value={<span className="block max-w-[14rem] text-end">{customer.address}</span>} /> : null}
            </dl>
          </section>

          <section className="rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
            <h2 className="font-heading text-lg text-oxford">Payment</h2>
            <dl className="mt-2">
              <Row
                label="Method"
                value={
                  payment?.method === "online"
                    ? "Online transfer"
                    : payment?.method === "cod"
                      ? "Cash on delivery"
                      : "—"
                }
              />
              {payment?.method === "online" ? (
                <Row label="From" value={<span dir="ltr">{payment.transferPhone || "—"}</span>} />
              ) : null}
            </dl>
            {payment?.receiptUrl ? (
              <div className="mt-3">
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Receipt</p>
                <MediaLightbox src={payment.receiptUrl} label="Receipt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={payment.receiptUrl}
                    alt="Receipt"
                    className="h-28 w-full rounded-xl bg-[#f6f3ee] object-contain"
                  />
                </MediaLightbox>
              </div>
            ) : null}
          </section>

          <section className="rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
            <h2 className="font-heading text-lg text-oxford">Totals</h2>
            <dl className="mt-2">
              <Row label="Items" value={items.length} />
              <Row label="Quantity" value={inquiry.quantity} />
              <Row label="Subtotal" value={`${subtotal} EGP`} />
              {discount > 0 ? (
                <Row
                  label={commerce?.promoCode ? `Discount (${commerce.promoCode})` : "Discount"}
                  value={`−${discount} EGP`}
                />
              ) : null}
              <Row label="Shipping" value={commerce?.shippingFree ? "Free" : `${shipping} EGP`} />
              {express > 0 ? <Row label="Express" value={`${express} EGP`} /> : null}
              <div className="flex items-center justify-between gap-4 pt-3">
                <dt className="font-heading text-oxford">Total</dt>
                <dd className="font-heading text-lg text-oxford">{total} EGP</dd>
              </div>
            </dl>
          </section>

          {customer.notes ? (
            <section className="rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
              <h2 className="font-heading text-lg text-oxford">Customer notes</h2>
              <p className="mt-2 text-sm leading-relaxed text-oxford">{customer.notes}</p>
            </section>
          ) : null}

          <OrderSaveForm>
            <input type="hidden" name="id" value={inquiry.id} />
            <div className="space-y-1.5">
              <Label htmlFor="quoted_price">Quoted price (EGP)</Label>
              <input
                id="quoted_price"
                name="quoted_price"
                type="number"
                step="0.01"
                defaultValue={inquiry.quoted_price ?? total ?? ""}
                className="h-11 w-full rounded-xl border border-input px-3 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={inquiry.status}
                className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
              >
                <option value="pending">pending</option>
                <option value="quoted">quoted</option>
                <option value="fulfilled">fulfilled</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Fulfilled or cancelled keeps mockups and uploads on file. Use Delete order to remove the record and
              its images.
            </p>
          </OrderSaveForm>
          <div className="rounded-[1.4rem] bg-white p-5 ring-1 ring-oxford/8">
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              Permanently remove this order from the dashboard, database, and storage.
            </p>
            <DeleteOrderButton id={inquiry.id} reference={inquiry.reference_code} />
          </div>
        </div>
      </div>
    </div>
  );
}
