"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { deleteFinanceAsset, saveFinanceAsset } from "@/actions/finance";
import { Field, FinanceDialog, inputClass, useFinanceBusy } from "@/components/admin/finance-dialog";
import { formatEgp, type FinanceAsset, type FinanceDocument } from "@/lib/finance";

export function FinanceAssetsPanel({ doc }: { doc: FinanceDocument }) {
  const [open, setOpen] = useState<FinanceAsset | "new" | null>(null);
  const rows = [...doc.assets].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{rows.length} assets</p>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-oxford px-4 text-sm font-semibold text-white"
          onClick={() => setOpen("new")}
        >
          <Plus className="size-4" />
          Asset
        </button>
      </div>
      <div className="grid gap-3">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setOpen(row)}
            className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] bg-white p-5 text-start shadow-sm ring-1 ring-oxford/8 hover:bg-cream/60"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-oxford/40 uppercase">{row.date}</p>
              <p className="mt-1 font-heading text-xl text-oxford">{row.name}</p>
              {row.notes ? <p className="mt-1 text-sm text-muted-foreground">{row.notes}</p> : null}
            </div>
            <p className="font-heading text-lg text-oxford">{formatEgp(row.cost)}</p>
          </button>
        ))}
        {rows.length === 0 ? (
          <div className="rounded-[1.6rem] bg-white px-6 py-14 text-center text-muted-foreground ring-1 ring-oxford/8">
            No assets yet. Add machines, tools, or anything the studio owns.
          </div>
        ) : null}
      </div>
      <FinanceDialog open={open !== null} title={open && open !== "new" ? "Asset" : "New asset"} onClose={() => setOpen(null)}>
        {open ? <AssetForm key={open === "new" ? "new" : open.id} asset={open === "new" ? null : open} /> : null}
      </FinanceDialog>
    </div>
  );
}

function AssetForm({ asset }: { asset: FinanceAsset | null }) {
  const { busy, onSubmit } = useFinanceBusy();
  return (
    <form action={saveFinanceAsset} className="space-y-3" onSubmit={onSubmit}>
      {asset ? <input type="hidden" name="id" value={asset.id} /> : null}
      <Field label="Name">
        <input className={inputClass} name="name" defaultValue={asset?.name || ""} required />
      </Field>
      <Field label="Date">
        <input className={inputClass} type="date" name="date" defaultValue={asset?.date || new Date().toISOString().slice(0, 10)} />
      </Field>
      <Field label="Cost (EGP)">
        <input className={inputClass} type="number" min="0" step="0.01" name="cost" defaultValue={asset?.cost ?? 0} required />
      </Field>
      <Field label="Notes">
        <input className={inputClass} name="notes" defaultValue={asset?.notes || ""} />
      </Field>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={busy} className="h-11 flex-1 rounded-full bg-oxford text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "…" : "Save"}
        </button>
        {asset ? (
          <button type="submit" formAction={deleteFinanceAsset} disabled={busy} className="h-11 rounded-full bg-red-50 px-4 text-sm font-semibold text-red-700 disabled:opacity-60">
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
