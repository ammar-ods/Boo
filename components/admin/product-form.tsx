"use client";

import { useState, type ReactNode } from "react";
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
  const [wrap, setWrap] = useState(Boolean(product?.wrapPreview) || product?.category === "Drinkware");

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {product ? <input type="hidden" name="originalSlug" value={product.slug} /> : null}
      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 lg:col-span-2">
          {error}
        </div>
      ) : null}

      <div className="space-y-6">
        <section className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
          <h2 className="font-heading text-xl text-oxford">Details</h2>
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
            <Field
              label="Materials"
              name="materials"
              defaultValue={product?.materials.join(", ")}
              placeholder="White, Black"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
          <div>
            <h2 className="font-heading text-xl text-oxford">Photos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Click a card to upload. The shop thumbnail is what customers see in the catalog.
              Mockups are the blank product photos used on the product page.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ImageCard
              name="thumbnail"
              label="Shop thumbnail"
              hint="Catalog card"
              preview={product?.thumbnail}
              clearName={product?.thumbnail ? "thumbnail_clear" : undefined}
            />
            <ImageCard
              name="mockup"
              label="Front mockup"
              hint="Blank product photo"
              preview={primary?.mockup || product?.mockup}
            >
              <input
                name="primary_label"
                defaultValue={primary?.label ?? "Front"}
                className="h-8 w-full rounded-lg border-0 bg-white/90 px-2 text-xs outline-none"
                placeholder="Front"
              />
            </ImageCard>
          </div>

          {wrap ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageCard
                name="mug_photo"
                label="Mug photo"
                hint="3D / rotatable view"
                preview={product?.mugPhoto || product?.mockup}
              />
              <ImageCard
                name="wrap_template"
                label="Print wrap"
                hint="Unfolded layout, optional"
                preview={product?.wrapTemplate}
              />
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-oxford">More sides</p>
            <button
              type="button"
              className="rounded-full bg-oxford px-3 py-1.5 text-sm text-white"
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
          {extraViews.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {extraViews.map((view, index) => (
                <div key={view.id} className="space-y-2">
                  <input type="hidden" name="extra_id" value={view.id} />
                  <input type="hidden" name="extra_existing" value={view.mockup} />
                  <input type="hidden" name="extra_left" value={view.safe_zone_bounds.left} />
                  <input type="hidden" name="extra_top" value={view.safe_zone_bounds.top} />
                  <input type="hidden" name="extra_width" value={view.safe_zone_bounds.width} />
                  <input type="hidden" name="extra_height" value={view.safe_zone_bounds.height} />
                  <ImageCard name="extra_mockup" label={view.label || "Side"} preview={view.mockup}>
                    <div className="flex items-center gap-2">
                      <input
                        name="extra_label"
                        defaultValue={view.label}
                        className="h-8 min-w-0 flex-1 rounded-lg border-0 bg-white/90 px-2 text-xs outline-none"
                      />
                      <button
                        type="button"
                        className="text-xs text-red-700"
                        onClick={() => setExtraViews((current) => current.filter((_, i) => i !== index))}
                      >
                        Remove
                      </button>
                    </div>
                  </ImageCard>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No extra sides yet. Add a back print if the piece needs one.</p>
          )}
        </section>
      </div>

      <div className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10 lg:sticky lg:top-6 h-fit">
        <h2 className="font-heading text-xl">Print area</h2>
        <p className="text-xs text-muted-foreground">Dashed box on the first mockup. 800×800 canvas.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Left" name="safe_left" type="number" defaultValue={safe.left} />
          <Field label="Top" name="safe_top" type="number" defaultValue={safe.top} />
          <Field label="Width" name="safe_width" type="number" defaultValue={safe.width} />
          <Field label="Height" name="safe_height" type="number" defaultValue={safe.height} />
        </div>
        <div className="space-y-3 border-t border-oxford/8 pt-4">
          <Toggle name="showSafeZone" defaultChecked={product?.showSafeZone !== false} label="Show safe-zone" />
          <Toggle name="is_laser_cut" defaultChecked={product?.is_laser_cut} label="Laser / engraving" />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="wrapPreview"
              checked={wrap}
              onChange={(event) => setWrap(event.target.checked)}
            />
            Mug / cylinder wrap
          </label>
          <Toggle name="archived" defaultChecked={product?.archived} label="Hide from catalog" />
        </div>
        <input type="hidden" name="accent" value={product?.accent ?? "teal"} />
        <button type="submit" className="h-11 w-full rounded-full bg-oxford font-heading text-white">
          Save product
        </button>
      </div>
    </form>
  );
}

function Toggle({
  name,
  defaultChecked,
  label,
}: {
  name: string;
  defaultChecked?: boolean;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

function ImageCard({
  name,
  label,
  hint,
  preview,
  clearName,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  preview?: string;
  clearName?: string;
  children?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[1.4rem] bg-[#f3eee4] ring-1 ring-oxford/8">
      <label className="relative block aspect-square cursor-pointer">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center px-4 text-center">
            <span>
              <span className="block font-heading text-lg text-oxford">{label}</span>
              {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
              <span className="mt-2 block text-xs font-semibold text-oxford/70">Upload</span>
            </span>
          </span>
        )}
        {preview ? (
          <span className="absolute inset-x-0 bottom-0 bg-oxford/75 px-3 py-2 text-center text-xs font-medium text-white">
            {label} · Replace
          </span>
        ) : null}
        <input name={name} type="file" accept="image/*,.svg" className="sr-only" />
      </label>
      {children || clearName ? (
        <div className="space-y-2 p-3">
          {children}
          {clearName ? (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" name={clearName} />
              Remove
            </label>
          ) : null}
        </div>
      ) : null}
    </div>
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
