"use client";

import type { ShopFormField } from "@/lib/site";

export function FormFieldsEditor({
  fields,
  onChange,
}: {
  fields: ShopFormField[];
  onChange: (fields: ShopFormField[]) => void;
}) {
  function patch(index: number, next: Partial<ShopFormField>) {
    onChange(fields.map((field, i) => (i === index ? { ...field, ...next } : field)));
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-2 rounded-2xl bg-cream/80 p-3 sm:grid-cols-[1fr_1fr_7rem_auto] sm:items-end">
          <label className="block text-xs">
            Label EN
            <input
              value={field.label.en}
              onChange={(event) => patch(index, { label: { ...field.label, en: event.target.value } })}
              className="mt-1 h-9 w-full rounded-full border border-input bg-white px-3 text-sm"
            />
          </label>
          <label className="block text-xs">
            Label AR
            <input
              dir="rtl"
              value={field.label.ar}
              onChange={(event) => patch(index, { label: { ...field.label, ar: event.target.value } })}
              className="mt-1 h-9 w-full rounded-full border border-input bg-white px-3 text-sm"
            />
          </label>
          <label className="block text-xs">
            Type
            <select
              value={field.type}
              onChange={(event) => patch(index, { type: event.target.value as ShopFormField["type"] })}
              className="mt-1 h-9 w-full rounded-full border border-input bg-white px-2 text-sm"
            >
              <option value="text">Text</option>
              <option value="tel">Phone</option>
              <option value="email">Email</option>
              <option value="textarea">Long text</option>
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-3 pb-1 text-xs">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(event) => patch(index, { required: event.target.checked })}
              />
              Required
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={field.enabled}
                onChange={(event) => patch(index, { enabled: event.target.checked })}
              />
              Show
            </label>
            <button type="button" className="text-red-700" onClick={() => onChange(fields.filter((_, i) => i !== index))}>
              Remove
            </button>
          </div>
          <label className="block text-xs sm:col-span-4">
            Field key
            <input
              value={field.key}
              onChange={(event) => patch(index, { key: event.target.value })}
              className="mt-1 h-9 w-full rounded-full border border-input bg-white px-3 font-mono text-sm"
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        className="h-10 rounded-full border border-oxford/15 px-4 text-sm font-semibold"
        onClick={() =>
          onChange([
            ...fields,
            {
              id: crypto.randomUUID(),
              key: `field_${fields.length + 1}`,
              type: "text",
              required: false,
              enabled: true,
              label: { ar: "حقل جديد", en: "New field" },
            },
          ])
        }
      >
        Add field
      </button>
    </div>
  );
}
