"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveFinanceSettings } from "@/actions/finance";
import { Field, inputClass } from "@/components/admin/finance-dialog";
import { catalogCostRows, type FinanceDocument, type SpendingCategory, type SpendingType } from "@/lib/finance";
import type { Product } from "@/lib/products";

export function FinanceSettingsForm({
  doc,
  products,
}: {
  doc: FinanceDocument;
  products: Product[];
}) {
  const rows = catalogCostRows(products, doc);
  const [categories, setCategories] = useState<SpendingCategory[]>(doc.settings.spendingCategories);

  return (
    <form action={saveFinanceSettings} className="space-y-8">
      <section className="rounded-[1.6rem] bg-white p-6 ring-1 ring-oxford/8">
        <h2 className="font-heading text-2xl text-oxford">General</h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">Starting capital feeds Free cash on the dashboard.</p>
        <Field label="Starting capital (EGP)">
          <input className={inputClass} type="number" min="0" step="0.01" name="startingCapital" defaultValue={doc.settings.startingCapital} />
        </Field>
      </section>

      <section className="rounded-[1.6rem] bg-white p-6 ring-1 ring-oxford/8">
        <h2 className="font-heading text-2xl text-oxford">Product costs</h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          Default cost per unit. A sale can still override this when the real cost differs.
        </p>
        <div className="grid gap-2">
          {rows.map((row) => (
            <label key={row.slug} className="flex items-center justify-between gap-4 rounded-2xl bg-cream/50 px-4 py-3">
              <span className="min-w-0 truncate text-sm font-medium text-oxford">{row.name}</span>
              <input type="hidden" name="costSlug" value={row.slug} />
              <input
                className="h-10 w-28 rounded-xl border border-oxford/12 bg-white px-3 text-end text-sm"
                type="number"
                min="0"
                step="0.01"
                name="costValue"
                defaultValue={row.cost}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[1.6rem] bg-white p-6 ring-1 ring-oxford/8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl text-oxford">Spending categories</h2>
            <p className="mt-1 text-sm text-muted-foreground">Used on the Spendings page for material vs operational costs.</p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1 rounded-full bg-oxford px-3 text-sm text-white"
            onClick={() =>
              setCategories((current) => [
                ...current,
                { id: `cat-${Date.now()}`, label: "", type: "operational" },
              ])
            }
          >
            <Plus className="size-4" />
            Category
          </button>
        </div>
        <div className="grid gap-2">
          {categories.map((item, index) => (
            <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-cream/50 p-3">
              <input type="hidden" name="categoryId" value={item.id} />
              <input
                className="h-10 min-w-40 flex-1 rounded-xl border border-oxford/12 bg-white px-3 text-sm"
                name="categoryLabel"
                value={item.label}
                placeholder="Category name"
                onChange={(event) =>
                  setCategories((current) =>
                    current.map((row, i) => (i === index ? { ...row, label: event.target.value } : row)),
                  )
                }
              />
              <select
                className="h-10 rounded-xl border border-oxford/12 bg-white px-2 text-sm"
                name="categoryType"
                value={item.type}
                onChange={(event) =>
                  setCategories((current) =>
                    current.map((row, i) =>
                      i === index ? { ...row, type: event.target.value as SpendingType } : row,
                    ),
                  )
                }
              >
                <option value="material">Material / products</option>
                <option value="operational">Operational</option>
              </select>
              <button
                type="button"
                className="grid size-10 place-items-center text-red-700"
                onClick={() => setCategories((current) => current.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <button type="submit" className="h-11 w-full rounded-full bg-oxford font-heading text-white sm:w-auto sm:px-8">
        Save settings
      </button>
    </form>
  );
}
