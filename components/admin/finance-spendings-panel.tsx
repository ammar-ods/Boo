"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { deleteFinanceSpending, saveFinanceSpending } from "@/actions/finance";
import { Field, FinanceDialog, inputClass } from "@/components/admin/finance-dialog";
import { formatEgp, type FinanceDocument, type FinanceSpending, type SpendingType } from "@/lib/finance";
import { cn } from "@/lib/utils";

export function FinanceSpendingsPanel({ doc }: { doc: FinanceDocument }) {
  const [open, setOpen] = useState<FinanceSpending | "new" | null>(null);
  const [type, setType] = useState<"all" | SpendingType>("all");
  const [category, setCategory] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  const categories = doc.settings.spendingCategories;
  const rows = useMemo(() => {
    let next = [...doc.spendings];
    if (type !== "all") next = next.filter((row) => row.type === type);
    if (category !== "all") next = next.filter((row) => row.category === category);
    if (from) next = next.filter((row) => row.date >= from);
    if (to) next = next.filter((row) => row.date <= to);
    next.sort((a, b) => {
      if (sort === "date-asc") return a.date.localeCompare(b.date);
      if (sort === "amount-desc") return b.amount - a.amount;
      if (sort === "amount-asc") return a.amount - b.amount;
      return b.date.localeCompare(a.date);
    });
    return next;
  }, [category, doc.spendings, from, sort, to, type]);

  const typePills = [
    { id: "all", label: "All" },
    { id: "material", label: "Material / products" },
    { id: "operational", label: "Operational" },
  ] as const;
  const categoryPills = [
    { id: "all", label: "All categories" },
    ...categories
      .filter((item) => type === "all" || item.type === type)
      .map((item) => ({ id: item.label, label: item.label })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{rows.length} spendings</p>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-oxford px-4 text-sm font-semibold text-white"
          onClick={() => setOpen("new")}
        >
          <Plus className="size-4" />
          Cost
        </button>
      </div>

      <div className="space-y-3 rounded-[1.4rem] bg-white p-4 ring-1 ring-oxford/8">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {typePills.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setType(item.id);
                setCategory("all");
              }}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em]",
                type === item.id ? "bg-[#f0e092] text-[#6e6322]" : "bg-cream text-oxford/55",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryPills.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold",
                category === item.id ? "bg-oxford text-white" : "bg-cream text-oxford/55",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-oxford/50">
            From
            <input className={`${inputClass} mt-1`} type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label className="text-xs text-oxford/50">
            To
            <input className={`${inputClass} mt-1`} type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
          <label className="text-xs text-oxford/50">
            Sort
            <select
              className={`${inputClass} mt-1`}
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
            >
              <option value="date-desc">Newest date</option>
              <option value="date-asc">Oldest date</option>
              <option value="amount-desc">Highest cost</option>
              <option value="amount-asc">Lowest cost</option>
            </select>
          </label>
        </div>
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
              <p className="mt-1 font-heading text-xl text-oxford">{row.category}</p>
              <p className="mt-1 text-sm capitalize text-muted-foreground">{row.type === "material" ? "Material / products" : "Operational"}</p>
            </div>
            <p className="font-heading text-lg text-oxford">{formatEgp(row.amount)}</p>
          </button>
        ))}
        {rows.length === 0 ? (
          <div className="rounded-[1.6rem] bg-white px-6 py-14 text-center text-muted-foreground ring-1 ring-oxford/8">
            No spendings in this filter.
          </div>
        ) : null}
      </div>

      <FinanceDialog open={open !== null} title={open && open !== "new" ? "Spending" : "New cost"} onClose={() => setOpen(null)}>
        {open ? (
          <SpendingForm
            key={open === "new" ? "new" : open.id}
            spending={open === "new" ? null : open}
            categories={categories}
          />
        ) : null}
      </FinanceDialog>
    </div>
  );
}

function SpendingForm({
  spending,
  categories,
}: {
  spending: FinanceSpending | null;
  categories: FinanceDocument["settings"]["spendingCategories"];
}) {
  const [kind, setKind] = useState<SpendingType>(spending?.type || "operational");
  const options = categories.filter((item) => item.type === kind);

  return (
    <form action={saveFinanceSpending} className="space-y-3">
      {spending ? <input type="hidden" name="id" value={spending.id} /> : null}
      <Field label="Date">
        <input className={inputClass} type="date" name="date" defaultValue={spending?.date || new Date().toISOString().slice(0, 10)} required />
      </Field>
      <div className="flex gap-2">
        {(["material", "operational"] as const).map((item) => (
          <label
            key={item}
            className={cn(
              "flex-1 cursor-pointer rounded-full px-3 py-2 text-center text-sm font-semibold",
              kind === item ? "bg-oxford text-white" : "bg-cream text-oxford/60",
            )}
          >
            <input type="radio" className="sr-only" name="type" value={item} checked={kind === item} onChange={() => setKind(item)} />
            {item === "material" ? "Material / products" : "Operational"}
          </label>
        ))}
      </div>
      <Field label="Category">
        <select key={kind} className={inputClass} name="category" defaultValue={spending?.category || options[0]?.label}>
          {options.map((item) => (
            <option key={item.id} value={item.label}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Cost (EGP)">
        <input className={inputClass} type="number" min="0" step="0.01" name="amount" defaultValue={spending?.amount ?? 0} required />
      </Field>
      <Field label="Notes">
        <input className={inputClass} name="notes" defaultValue={spending?.notes || ""} />
      </Field>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="h-11 flex-1 rounded-full bg-oxford text-sm font-semibold text-white">
          Save
        </button>
        {spending ? (
          <button type="submit" formAction={deleteFinanceSpending} className="h-11 rounded-full bg-red-50 px-4 text-sm font-semibold text-red-700">
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
