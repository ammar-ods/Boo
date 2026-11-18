"use client";

import { useState } from "react";
import type { InquiryRecord } from "@/lib/inquiry-types";
import { orderLineItems, type OrderLineItem } from "@/lib/order-view";

function looksLikeImage(url: string) {
  return (
    /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url) ||
    url.includes("/storage/v1/object/") ||
    url.startsWith("/uploads/") ||
    url.startsWith("/products/") ||
    url.startsWith("data:image")
  );
}

function itemImage(item: OrderLineItem) {
  return item.viewMockups?.find((view) => view.url)?.url || item.image || "";
}

export function OrderProductCards({ inquiry }: { inquiry: InquiryRecord }) {
  const items = orderLineItems(inquiry);
  const [open, setOpen] = useState<OrderLineItem | null>(null);

  return (
    <>
      <div className={`grid gap-3 ${items.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {items.map((item, index) => {
          const image = itemImage(item);
          return (
            <button
              key={`${item.slug || item.name}-${index}`}
              type="button"
              onClick={() => setOpen(item)}
              className="overflow-hidden rounded-[1.2rem] bg-cream/70 text-start ring-1 ring-oxford/8 transition hover:-translate-y-0.5"
            >
              <div className="h-28 bg-[#f6f3ee]">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-muted-foreground">No preview</div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate font-heading text-oxford">{item.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  qty {item.quantity}
                  {item.color ? ` · ${item.color}` : ""}
                  {item.priceEgp ? ` · ${item.priceEgp} EGP` : ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {open ? (
        <div
          className="fixed inset-0 z-[120] grid place-items-center bg-oxford/45 p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.6rem] bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-oxford/45 uppercase">Product</p>
                <h3 className="font-heading text-2xl text-oxford">{open.name}</h3>
              </div>
              <button
                type="button"
                className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-oxford"
                onClick={() => setOpen(null)}
              >
                Close
              </button>
            </div>
            {itemImage(open) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={itemImage(open)} alt="" className="mb-4 max-h-56 w-full rounded-2xl object-contain bg-[#f6f3ee]" />
            ) : null}
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Quantity</dt>
                <dd>{open.quantity}</dd>
              </div>
              {open.color ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Option</dt>
                  <dd>{open.color}</dd>
                </div>
              ) : null}
              {open.dimensions?.length || open.dimensions?.width ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Size</dt>
                  <dd>
                    {open.dimensions?.length || "?"} × {open.dimensions?.width || "?"}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Price</dt>
                <dd>{open.priceEgp * open.quantity} EGP</dd>
              </div>
              {open.custom ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>Custom</dd>
                </div>
              ) : null}
            </dl>
            {(open.viewMockups?.length || open.uploads?.length) ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {(open.viewMockups ?? []).map((view) =>
                  view.url && looksLikeImage(view.url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={view.url} src={view.url} alt={view.label || ""} className="h-20 w-full rounded-xl object-cover" />
                  ) : null,
                )}
                {(open.uploads ?? []).map((file) =>
                  file.url && looksLikeImage(file.url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={file.url} src={file.url} alt={file.name} className="h-20 w-full rounded-xl object-cover" />
                  ) : (
                    <a key={file.url} href={file.url} className="truncate text-xs text-boo-teal" target="_blank" rel="noreferrer">
                      {file.name}
                    </a>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
