"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveShopSettings } from "@/actions/admin";
import { flashStatus } from "@/components/status-flash";
import { FontFields } from "@/components/cms/font-fields";
import type { Commerce } from "@/lib/site";

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
  showDiscipline,
  fontEn,
  fontAr,
}: {
  commerce: Commerce;
  whatsappPhone: string;
  payPhone: string;
  showDiscipline: boolean;
  fontEn: string;
  fontAr: string;
}) {
  const router = useRouter();
  const [englishFont, setEnglishFont] = useState(fontEn);
  const [arabicFont, setArabicFont] = useState(fontAr);

  return (
    <form
      action={async (formData) => {
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
        <h2 className="font-heading text-2xl text-oxford">Typography</h2>
        <p className="text-sm text-muted-foreground">
          These fonts apply to the whole storefront. Arabic text uses the Arabic font; English uses the Latin font.
        </p>
        <FontFields fontEn={englishFont} fontAr={arabicFont} onEn={setEnglishFont} onAr={setArabicFont} />
      </section>
      <section className="space-y-4 rounded-[1.6rem] bg-white p-6 ring-1 ring-oxford/8">
        <h2 className="font-heading text-2xl text-oxford">Shop</h2>
        <label className="flex h-12 items-center justify-between gap-3 rounded-2xl bg-cream px-4 text-sm">
          <span>Show Discipline menu next to product cards</span>
          <input type="checkbox" name="showDiscipline" defaultChecked={showDiscipline} className="size-4 accent-oxford" />
        </label>
        <label className="flex items-start justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-sm">
          <span>
            <span className="block">Custom orders must pay online</span>
            <span className="text-xs text-muted-foreground">
              If the cart has a custom print (uploaded artwork), cash on delivery is greyed out.
            </span>
          </span>
          <input
            type="checkbox"
            name="codBlockCustom"
            defaultChecked={commerce.codBlockCustom !== false}
            className="mt-0.5 size-4 accent-oxford"
          />
        </label>
      </section>
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
        <label className="flex items-start justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-sm">
          <span>
            <span className="block">Offer express order at checkout</span>
            <span className="text-xs text-muted-foreground">Adds a paid rush option on the checkout form.</span>
          </span>
          <input
            type="checkbox"
            name="expressEnabled"
            defaultChecked={commerce.expressEnabled !== false}
            className="mt-0.5 size-4 accent-oxford"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            Express fee (EGP)
            <input
              name="expressPrice"
              type="number"
              min={0}
              defaultValue={commerce.expressPrice ?? 120}
              className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
            />
          </label>
          <label className="block text-sm">
            Express label · عربي
            <input
              name="expressLabelAr"
              dir="rtl"
              defaultValue={commerce.expressLabel?.ar ?? "طلب سريع"}
              className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
            />
          </label>
          <label className="block text-sm">
            Express label · English
            <input
              name="expressLabelEn"
              defaultValue={commerce.expressLabel?.en ?? "Express order"}
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

      <Submit label="Save settings" />
    </form>
  );
}
