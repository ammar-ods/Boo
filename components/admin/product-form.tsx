"use client";

import { useState } from "react";
import type { Product, ProductView } from "@/lib/products";
import { CATEGORIES, productViews } from "@/lib/products";
import { Label } from "@/components/ui/label";

export function ProductForm({
  product,
  action,
  error,
}: {
  product?: Product;
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
}) {
  const initialViews = product ? productViews(product) : [];
  const primary = initialViews[0];
  const safe = primary?.safe_zone_bounds ?? product?.safe_zone_bounds ?? {
    left: 220,
    top: 200,
    width: 360,
    height: 360,
  };
  const [extraViews, setExtraViews] = useState<ProductView[]>(initialViews.slice(1));

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {product ? <input type="hidden" name="originalSlug" value={product.slug} /> : null}
      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 lg:col-span-2">
          {error}
        </div>
      ) : null}
      <div className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" name="name" defaultValue={product?.name} required />
          <Field label="Slug" name="slug" defaultValue={product?.slug} placeholder="classic-tee" />
        </div>
        <Field label="Tagline" name="tagline" defaultValue={product?.tagline} />
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={product?.description}
            className="min-h-24 w-full rounded-lg border border-input px-2.5 py-2 text-sm"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue={product?.category ?? "Apparel"}
              className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
            >
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accent">Accent</Label>
            <select
              id="accent"
              name="accent"
              defaultValue={product?.accent ?? "teal"}
              className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
            >
              <option value="teal">teal</option>
              <option value="pink">pink</option>
              <option value="orange">orange</option>
            </select>
          </div>
        </div>
        <Field
          label="Materials (comma separated)"
          name="materials"
          defaultValue={product?.materials.join(", ")}
        />
        <div className="space-y-1.5">
          <Label htmlFor="primary_label">First side label</Label>
          <input
            id="primary_label"
            name="primary_label"
            defaultValue={primary?.label ?? "Front"}
            className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mockup">First side image (front / wrap)</Label>
          <input id="mockup" name="mockup" type="file" accept="image/*,.svg" />
          {product?.mockup ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.mockup} alt="" className="mt-2 h-40 rounded-xl object-cover" />
          ) : null}
        </div>
        <div className="space-y-3 rounded-2xl bg-[#efe8de] p-4">
          <p className="font-heading text-base">Mug wrap</p>
          <p className="text-xs text-muted-foreground">
            Used when “wrap around a mug” is on. The mug photo is the rotatable 3D preview.
            Orders get the unfolded print layout, not the side view.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="mug_photo">3D mug photo</Label>
            <input id="mug_photo" name="mug_photo" type="file" accept="image/*,.svg" />
            {product?.mugPhoto || product?.mockup ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product?.mugPhoto || product?.mockup}
                alt=""
                className="mt-2 h-32 rounded-xl bg-white object-contain"
              />
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wrap_template">Unfolded print layout (optional)</Label>
            <input id="wrap_template" name="wrap_template" type="file" accept="image/*,.svg" />
            <p className="text-xs text-muted-foreground">
              Leave empty to keep the built-in cylinder unwrap (seam → front → seam).
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-secondary/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg">More sides</h3>
              <p className="text-xs text-muted-foreground">
                Add a back print, extra angle, or another mockup. Each side gets its own
                customizer tab and is included in the inquiry.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full bg-boo-ink px-3 py-1.5 text-sm text-white"
              onClick={() =>
                setExtraViews((current) => [
                  ...current,
                  {
                    id: `side-${current.length + 2}`,
                    label: current.length === 0 ? "Back" : `Side ${current.length + 2}`,
                    mockup: "",
                    safe_zone_bounds: safe,
                  },
                ])
              }
            >
              Add side
            </button>
          </div>
          {extraViews.map((view, index) => (
            <div key={view.id} className="space-y-2 rounded-xl bg-white p-3 ring-1 ring-foreground/10">
              <input type="hidden" name="extra_id" value={view.id} />
              <input type="hidden" name="extra_existing" value={view.mockup} />
              <div className="flex items-center justify-between">
                <Field label="Label" name="extra_label" defaultValue={view.label} />
                <button
                  type="button"
                  className="ml-3 text-xs text-destructive"
                  onClick={() => setExtraViews((current) => current.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
              <div className="space-y-1.5">
                <Label>Image</Label>
                <input name="extra_mockup" type="file" accept="image/*,.svg" />
                {view.mockup ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={view.mockup} alt="" className="mt-2 h-28 rounded-xl object-cover" />
                ) : null}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Field label="Left" name="extra_left" type="number" defaultValue={view.safe_zone_bounds.left} />
                <Field label="Top" name="extra_top" type="number" defaultValue={view.safe_zone_bounds.top} />
                <Field label="Width" name="extra_width" type="number" defaultValue={view.safe_zone_bounds.width} />
                <Field label="Height" name="extra_height" type="number" defaultValue={view.safe_zone_bounds.height} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
        <h2 className="font-heading text-xl">Print / etch border</h2>
        <p className="text-xs text-muted-foreground">
          Coordinates are on an 800×800 canvas. This dashed box is what customers see while
          placing artwork on the first side.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Left" name="safe_left" type="number" defaultValue={safe.left} />
          <Field label="Top" name="safe_top" type="number" defaultValue={safe.top} />
          <Field label="Width" name="safe_width" type="number" defaultValue={safe.width} />
          <Field label="Height" name="safe_height" type="number" defaultValue={safe.height} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="showSafeZone"
            defaultChecked={product?.showSafeZone !== false}
          />
          Show dashed safe-zone while editing
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_laser_cut" defaultChecked={product?.is_laser_cut} />
          Laser / engraving product
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="wrapPreview"
            defaultChecked={Boolean(product?.wrapPreview) || product?.category === "Drinkware"}
          />
          Wrap artwork around a mug / cylinder in preview
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="archived" defaultChecked={product?.archived} />
          Hide from catalog
        </label>
        <button
          type="submit"
          className="h-9 w-full rounded-full bg-boo-teal font-heading text-white"
        >
          Save product
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
      />
    </div>
  );
}
