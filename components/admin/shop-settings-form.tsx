"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveShopSettings } from "@/actions/admin";
import { flashStatus } from "@/components/status-flash";
import type { Commerce, ShopFormField } from "@/lib/site";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 rounded-full bg-oxford px-6 font-heading text-white">
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ShopSettingsForm({
  commerce,
  whatsappPhone,
  payPhone,
}: {
  commerce: Commerce;
  whatsappPhone: string;
  payPhone: string;
}) {
  const router = useRouter();
  const [contactFields, setContactFields] = useState(commerce.contactFields);
  const [checkoutFields, setCheckoutFields] = useState(commerce.checkoutFields);

  return (
    <form
      action={async (formData) => {
        formData.set("contactFields", JSON.stringify(contactFields));
        formData.set("checkoutFields", JSON.stringify(checkoutFields));
        try {
          await saveShopSettings(formData);
          router.refresh();
          flashStatus("Saved");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save");
        }
      }}
      className="mt-8 space-y-8"
    >
      <section className="space-y-4 rounded-[1.6rem] bg-white p-6 ring-1 ring-oxford/8">
        <h2 className="font-heading text-2xl text-oxford">Contact & shipping</h2>
        <label className="block text-sm">
          WhatsApp number
          <input
            name="whatsappPhone"
            defaultValue={whatsappPhone}
            dir="ltr"
            className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
          />
        </label>
        <label className="block text-sm">
          Online transfer number
          <input
            name="payPhone"
            defaultValue={payPhone}
            dir="ltr"
            className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
          />
        </label>
        <label className="block text-sm">
          Contact form email
          <input
            name="contactEmail"
            type="email"
            defaultValue={commerce.contactEmail}
            className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Shipping price (EGP)
            <input
              name="shippingPrice"
              type="number"
              min={0}
              defaultValue={commerce.shippingPrice}
              className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
            />
          </label>
          <label className="block text-sm">
            Free shipping from (EGP)
            <input
              name="freeShippingMin"
              type="number"
              min={0}
              defaultValue={commerce.freeShippingMin}
              className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Shipping label · عربي
            <input
              name="shippingLabelAr"
              dir="rtl"
              defaultValue={commerce.shippingLabel.ar}
              className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
            />
          </label>
          <label className="block text-sm">
            Shipping label · English
            <input
              name="shippingLabelEn"
              defaultValue={commerce.shippingLabel.en}
              className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm">
          Shipping details · عربي
          <textarea
            name="shippingDetailsAr"
            dir="rtl"
            rows={2}
            defaultValue={commerce.shippingDetails.ar}
            className="mt-1 w-full rounded-2xl border border-input px-4 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          Shipping details · English
          <textarea
            name="shippingDetailsEn"
            rows={2}
            defaultValue={commerce.shippingDetails.en}
            className="mt-1 w-full rounded-2xl border border-input px-4 py-2 text-sm"
          />
        </label>
      </section>

      <section className="space-y-4 rounded-[1.6rem] bg-white p-6 ring-1 ring-oxford/8">
        <h2 className="font-heading text-2xl text-oxford">Contact form</h2>
        <p className="text-sm text-muted-foreground">Shown on the contact page. Submissions still land in Orders.</p>
        <FieldEditor fields={contactFields} onChange={setContactFields} />
      </section>

      <section className="space-y-4 rounded-[1.6rem] bg-white p-6 ring-1 ring-oxford/8">
        <h2 className="font-heading text-2xl text-oxford">Checkout form</h2>
        <p className="text-sm text-muted-foreground">Fields and required flags on the checkout page.</p>
        <FieldEditor fields={checkoutFields} onChange={setCheckoutFields} />
      </section>

      <Submit label="Save settings" />
    </form>
  );
}

function FieldEditor({
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
              onChange={(event) =>
                patch(index, { type: event.target.value as ShopFormField["type"] })
              }
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
            <button
              type="button"
              className="text-red-700"
              onClick={() => onChange(fields.filter((_, i) => i !== index))}
            >
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
