"use client";

import { useI18n } from "@/lib/i18n";
import { pick, type ShopFormField } from "@/lib/site";

export function DynamicShopFields({
  fields,
  defaults,
}: {
  fields: ShopFormField[];
  defaults?: Record<string, string>;
}) {
  const { locale } = useI18n();
  return (
    <>
      {fields
        .filter((field) => field.enabled)
        .map((field) => (
          <label key={field.id} className="block text-sm">
            {pick(field.label, locale) || field.key}
            {field.type === "textarea" ? (
              <textarea
                name={field.key}
                required={field.required}
                rows={3}
                defaultValue={defaults?.[field.key] ?? ""}
                className="mt-1 w-full rounded-2xl border border-border bg-white px-4 py-3"
              />
            ) : (
              <input
                name={field.key}
                required={field.required}
                type={field.type === "email" ? "email" : "text"}
                inputMode={field.type === "tel" ? "tel" : undefined}
                defaultValue={defaults?.[field.key] ?? ""}
                className="mt-1 h-11 w-full rounded-full border border-border bg-white px-4"
              />
            )}
          </label>
        ))}
    </>
  );
}
