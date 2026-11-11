"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { savePromo } from "@/actions/admin";
import { PromoDialog } from "@/components/promo-popup";
import { flashStatus } from "@/components/status-flash";
import { useI18n } from "@/lib/i18n";
import type { PromoCode } from "@/lib/site";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 w-full rounded-full bg-oxford font-heading text-white">
      {pending ? "Saving…" : "Save promo"}
    </button>
  );
}

export function PromoForm({
  live,
  textAr,
  textEn,
  image,
  payPhone,
  codes,
}: {
  live: boolean;
  textAr: string;
  textEn: string;
  image: string;
  payPhone: string;
  codes: PromoCode[];
}) {
  const router = useRouter();
  const { locale } = useI18n();
  const [imageUrl, setImageUrl] = useState(image);
  const [textArValue, setTextArValue] = useState(textAr);
  const [textEnValue, setTextEnValue] = useState(textEn);
  const [showPreview, setShowPreview] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(codes);
  const previewText = locale === "en" ? textEnValue.trim() || textArValue.trim() : textArValue.trim() || textEnValue.trim();

  return (
    <form
      action={async (formData) => {
        formData.set("codes", JSON.stringify(promoCodes));
        try {
          await savePromo(formData);
          router.refresh();
          flashStatus("Saved");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save");
        }
      }}
      className="mt-8 space-y-5 rounded-[1.6rem] bg-white p-6 ring-1 ring-oxford/8"
    >
      <label className="flex h-12 items-center justify-between gap-3 rounded-2xl bg-cream px-4 text-sm">
        <span>Live on the website</span>
        <input type="checkbox" name="live" defaultChecked={live} className="size-4 accent-oxford" />
      </label>
      <label className="block text-sm">
        Arabic text
        <textarea
          name="textAr"
          rows={3}
          value={textArValue}
          onChange={(event) => setTextArValue(event.target.value)}
          dir="rtl"
          className="mt-1 w-full rounded-2xl border border-input px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        English text
        <textarea
          name="textEn"
          rows={3}
          value={textEnValue}
          onChange={(event) => setTextEnValue(event.target.value)}
          className="mt-1 w-full rounded-2xl border border-input px-3 py-2 text-sm"
        />
      </label>
      <div className="text-sm">
        <p className="mb-1">Icon or image (optional)</p>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mb-2 size-20 rounded-2xl object-cover" />
        ) : null}
        <input type="hidden" name="image" value={imageUrl} />
        <input
          type="file"
          accept="image/*"
          className="block w-full text-xs"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const data = new FormData();
            data.set("file", file);
            const response = await fetch("/api/site/upload", { method: "POST", body: data });
            const payload = (await response.json()) as { url?: string; error?: string };
            if (!response.ok || !payload.url) {
              toast.error(payload.error || "Could not upload");
              return;
            }
            setImageUrl(payload.url);
          }}
        />
        {imageUrl ? (
          <button type="button" className="mt-2 text-xs font-semibold text-red-700" onClick={() => setImageUrl("")}>
            Remove image
          </button>
        ) : null}
      </div>
      <label className="block text-sm">
        Online transfer number (shown at checkout)
        <input
          name="payPhone"
          defaultValue={payPhone}
          dir="ltr"
          className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
        />
      </label>
      <div className="space-y-3">
        <p className="text-sm font-medium">Promo codes</p>
        {promoCodes.map((item, index) => (
          <div key={item.id} className="grid gap-2 rounded-2xl bg-cream/80 p-3 sm:grid-cols-[1fr_5rem_auto_auto]">
            <input
              value={item.code}
              onChange={(event) =>
                setPromoCodes((rows) =>
                  rows.map((row, i) => (i === index ? { ...row, code: event.target.value.toUpperCase() } : row)),
                )
              }
              placeholder="CODE"
              className="h-10 rounded-full border border-input bg-white px-3 font-mono text-sm"
            />
            <input
              type="number"
              min={1}
              max={100}
              value={item.percent}
              onChange={(event) =>
                setPromoCodes((rows) =>
                  rows.map((row, i) => (i === index ? { ...row, percent: Number(event.target.value) || 0 } : row)),
                )
              }
              className="h-10 rounded-full border border-input bg-white px-3 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.active}
                onChange={(event) =>
                  setPromoCodes((rows) =>
                    rows.map((row, i) => (i === index ? { ...row, active: event.target.checked } : row)),
                  )
                }
              />
              Active
            </label>
            <button
              type="button"
              className="text-sm text-red-700"
              onClick={() => setPromoCodes((rows) => rows.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="h-10 rounded-full border border-oxford/15 px-4 text-sm font-semibold"
          onClick={() =>
            setPromoCodes((rows) => [
              ...rows,
              { id: crypto.randomUUID(), code: "", percent: 10, active: true },
            ])
          }
        >
          Add promo code
        </button>
        <p className="text-xs text-muted-foreground">Percent off the cart subtotal at checkout.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="h-11 w-full rounded-full border border-oxford/15 font-heading text-oxford hover:bg-cream"
          onClick={() => {
            if (!previewText) {
              toast.error("Add promo text first");
              return;
            }
            setShowPreview(true);
          }}
        >
          Preview
        </button>
        <Submit />
      </div>
      {showPreview ? (
        <PromoDialog text={previewText} image={imageUrl} onClose={() => setShowPreview(false)} />
      ) : null}
    </form>
  );
}
