"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { deleteFinanceSale, saveFinanceSale } from "@/actions/finance";
import { Field, FinanceDialog, inputClass, useFinanceBusy } from "@/components/admin/finance-dialog";
import {
  CUSTOM_PRODUCT_SLUG,
  formatEgp,
  saleCost,
  saleProfit,
  type FinanceDocument,
  type FinanceSale,
} from "@/lib/finance";
import type { Product } from "@/lib/products";

export function FinanceSalesPanel({
  doc,
  products,
}: {
  doc: FinanceDocument;
  products: Product[];
}) {
  const [open, setOpen] = useState<FinanceSale | "new" | null>(null);
  const sales = useMemo(
    () => [...doc.sales].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [doc.sales],
  );
  const editing = open && open !== "new" ? open : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{sales.length} sales · fulfilled website orders plus anything you add</p>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-oxford px-4 text-sm font-semibold text-white"
          onClick={() => setOpen("new")}
        >
          <Plus className="size-4" />
          Sale
        </button>
      </div>
      <div className="grid gap-3">
        {sales.map((sale) => {
          const cost = saleCost(doc, sale);
          const profit = saleProfit(doc, sale);
          return (
            <button
              key={sale.id}
              type="button"
              onClick={() => setOpen(sale)}
              className="flex w-full flex-col rounded-[1.5rem] bg-white p-5 text-start shadow-sm ring-1 ring-oxford/8 transition hover:bg-cream/60 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.12em] text-oxford/40 uppercase">{sale.date}</p>
                <p className="mt-1 truncate font-heading text-xl text-oxford">{sale.productName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sale.source === "order" ? `Website · ${sale.orderRef || "order"}` : "Manual"} · qty {sale.quantity}
                </p>
                {sale.notes ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{sale.notes}</p> : null}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 sm:mt-0 sm:text-end">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-oxford/40 uppercase">Revenue</p>
                  <p className="mt-0.5 text-sm font-semibold text-oxford">{formatEgp(sale.revenue)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-oxford/40 uppercase">Cost</p>
                  <p className="mt-0.5 text-sm text-oxford/70">{sale.cost == null ? `${formatEgp(cost)} preset` : formatEgp(cost)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-oxford/40 uppercase">Profit</p>
                  <p className={`mt-0.5 text-sm font-semibold ${profit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {formatEgp(profit)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
        {sales.length === 0 ? (
          <div className="rounded-[1.6rem] bg-white px-6 py-14 text-center text-muted-foreground ring-1 ring-oxford/8">
            No sales yet. Fulfilled website orders appear here automatically.
          </div>
        ) : null}
      </div>

      <FinanceDialog
        open={open !== null}
        title={editing ? "Sale" : "New sale"}
        onClose={() => setOpen(null)}
      >
        {open ? <SaleForm key={editing?.id || "new"} sale={editing} products={products} doc={doc} /> : null}
      </FinanceDialog>
    </div>
  );
}

function SaleForm({
  sale,
  products,
  doc,
}: {
  sale: FinanceSale | null;
  products: Product[];
  doc: FinanceDocument;
}) {
  const [slug, setSlug] = useState(sale?.productSlug || products[0]?.slug || CUSTOM_PRODUCT_SLUG);
  const product = products.find((item) => item.slug === slug);
  const name = slug === CUSTOM_PRODUCT_SLUG ? "Custom" : product?.name || sale?.productName || "Custom";
  const preset = (doc.settings.productCosts[slug] || 0) * (sale?.quantity || 1);
  const { busy, onSubmit } = useFinanceBusy();

  return (
    <form action={saveFinanceSale} className="space-y-3" onSubmit={onSubmit}>
      {sale ? <input type="hidden" name="id" value={sale.id} /> : null}
      <input type="hidden" name="productName" value={name} />
      <Field label="Date">
        <input className={inputClass} type="date" name="date" defaultValue={sale?.date || new Date().toISOString().slice(0, 10)} required />
      </Field>
      <Field label="Product">
        <select
          className={inputClass}
          name="productSlug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        >
          {products.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
          <option value={CUSTOM_PRODUCT_SLUG}>Custom</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Quantity">
          <input className={inputClass} type="number" min="1" name="quantity" defaultValue={sale?.quantity ?? 1} />
        </Field>
        <Field label="Revenue (EGP)">
          <input className={inputClass} type="number" min="0" step="0.01" name="revenue" defaultValue={sale?.revenue ?? 0} required />
        </Field>
      </div>
      <Field label={`Cost (EGP) · preset ${preset || 0}`}>
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          name="cost"
          defaultValue={sale?.cost ?? ""}
          placeholder={String(preset || 0)}
        />
      </Field>
      <Field label="Notes">
        <input className={inputClass} name="notes" defaultValue={sale?.notes || ""} />
      </Field>
      {sale?.source === "order" ? (
        <p className="text-xs text-muted-foreground">From website order {sale.orderRef}. Cost can still be edited.</p>
      ) : null}
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={busy} className="h-11 flex-1 rounded-full bg-oxford text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "…" : "Save"}
        </button>
        {sale ? (
          <button
            type="submit"
            formAction={deleteFinanceSale}
            disabled={busy}
            className="h-11 rounded-full bg-red-50 px-4 text-sm font-semibold text-red-700 disabled:opacity-60"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
