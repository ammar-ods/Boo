"use client";

import { useState, type ReactNode } from "react";
import type { Product, ProductView } from "@/lib/products";
import { normalizeCategoryId, productViews } from "@/lib/products";
import { Label } from "@/components/ui/label";

export function ProductForm({
  product,
  action,
  error,
  categories = [],
  defaultCategory,
}: {
  product?: Product;
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  categories?: { id: string; label: string }[];
  defaultCategory?: string;
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
  const [customizable, setCustomizable] = useState(product?.customizable !== false);
  const [gallery, setGallery] = useState<{ id: string; src: string }[]>(
    (product?.gallery ?? []).map((src, index) => ({ id: `gallery-${index}`, src })),
  );

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
          <label className="flex items-start gap-3 rounded-2xl bg-cream px-4 py-3 text-sm ring-1 ring-oxford/10">
            <input
              type="checkbox"
              name="customizable_preview"
              checked={customizable}
              onChange={(event) => setCustomizable(event.target.checked)}
              className="mt-0.5 size-4 accent-oxford"
            />
            <span>
              <span className="block font-medium text-oxford">Customizable</span>
              <span className="text-xs text-muted-foreground">
                On = customer uploads artwork. Off = + on the card adds the item to the cart.
              </span>
            </span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name · English" name="name" defaultValue={product?.name} required />
            <Field label="Name · عربي" name="nameAr" defaultValue={product?.nameAr} dir="rtl" />
          </div>
          <Field label="Slug" name="slug" defaultValue={product?.slug} placeholder="classic-tee" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tagline · English" name="tagline" defaultValue={product?.tagline} />
            <Field label="Tagline · عربي" name="taglineAr" defaultValue={product?.taglineAr} dir="rtl" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="description">Description · English</Label>
              <textarea
                id="description"
                name="description"
                defaultValue={product?.description}
                className="min-h-24 w-full rounded-lg border border-input px-2.5 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descriptionAr">Description · عربي</Label>
              <textarea
                id="descriptionAr"
                name="descriptionAr"
                dir="rtl"
                defaultValue={product?.descriptionAr}
                className="min-h-24 w-full rounded-lg border border-input px-2.5 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue={normalizeCategoryId(product?.category || defaultCategory)}
              className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
            >
              <option value="">Unassigned</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Manage the list in{" "}
              <a href="/admin/categories" className="underline">
                Categories
              </a>
              .
            </p>
          </div>
          <OptionEditor product={product} />
        </section>

        <section className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
          <div>
            <h2 className="font-heading text-xl text-oxford">Photos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {customizable
                ? "Click a card to upload. The shop thumbnail is the catalog card. Mockups are the blank product photos customers print on."
                : "Ready-made pieces use a photo gallery — angles, colors, or close-ups of the same item. No print mockup needed."}
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
            {customizable ? (
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
            ) : (
              <input type="hidden" name="primary_label" value={primary?.label ?? "Front"} />
            )}
          </div>

          {customizable && wrap ? (
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

          {customizable ? (
            <>
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
            </>
          ) : (
            <>
              <input type="hidden" name="gallery_enabled" value="on" />
              {extraViews.map((view) => (
                <div key={view.id} className="hidden">
                  <input type="hidden" name="extra_id" value={view.id} />
                  <input type="hidden" name="extra_existing" value={view.mockup} />
                  <input type="hidden" name="extra_label" value={view.label} />
                  <input type="hidden" name="extra_left" value={view.safe_zone_bounds.left} />
                  <input type="hidden" name="extra_top" value={view.safe_zone_bounds.top} />
                  <input type="hidden" name="extra_width" value={view.safe_zone_bounds.width} />
                  <input type="hidden" name="extra_height" value={view.safe_zone_bounds.height} />
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-oxford">Gallery</p>
                <button
                  type="button"
                  className="rounded-full bg-oxford px-3 py-1.5 text-sm text-white"
                  onClick={() =>
                    setGallery((current) => [...current, { id: `gallery-${current.length + 1}`, src: "" }])
                  }
                >
                  Add photo
                </button>
              </div>
              {gallery.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {gallery.map((item, index) => (
                    <GalleryCard
                      key={item.id}
                      existing={item.src}
                      onRemove={() => setGallery((current) => current.filter((_, i) => i !== index))}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Add front, side, back, or any other shots of this piece.
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <div className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10 lg:sticky lg:top-6 h-fit">
        <h2 className="font-heading text-xl">{customizable ? "Print area" : "Selling"}</h2>
        <PriceEditor product={product} />
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="customizable"
            value="on"
            checked={customizable}
            onChange={(event) => setCustomizable(event.target.checked)}
            className="mt-0.5 size-4 accent-oxford"
          />
          <span>
            <span className="block font-medium text-oxford">Customizable</span>
            <span className="text-xs text-muted-foreground">
              Off = ready-made item. The catalog + button adds it to the cart.
            </span>
          </span>
        </label>
        {customizable ? (
          <>
            <p className="text-xs text-muted-foreground">Dashed box on the first mockup. 800×800 canvas.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Left" name="safe_left" type="number" defaultValue={safe.left} />
              <Field label="Top" name="safe_top" type="number" defaultValue={safe.top} />
              <Field label="Width" name="safe_width" type="number" defaultValue={safe.width} />
              <Field label="Height" name="safe_height" type="number" defaultValue={safe.height} />
            </div>
          </>
        ) : (
          <>
            <input type="hidden" name="safe_left" value={safe.left} />
            <input type="hidden" name="safe_top" value={safe.top} />
            <input type="hidden" name="safe_width" value={safe.width} />
            <input type="hidden" name="safe_height" value={safe.height} />
          </>
        )}
        <div className="space-y-3 border-t border-oxford/8 pt-4">
          {customizable ? (
            <>
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
            </>
          ) : (
            <Toggle name="is_laser_cut" defaultChecked={product?.is_laser_cut} label="Laser / engraving" />
          )}
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

function GalleryCard({ existing, onRemove }: { existing: string; onRemove: () => void }) {
  const [preview, setPreview] = useState(existing);
  return (
    <div className="space-y-2">
      <input type="hidden" name="gallery_existing" value={existing} />
      <ImageCard
        name="gallery_file"
        label="Gallery photo"
        hint="Angle or variation"
        preview={preview}
        onFile={(file) => setPreview(URL.createObjectURL(file))}
      >
        <button type="button" className="text-xs text-red-700" onClick={onRemove}>
          Remove
        </button>
      </ImageCard>
    </div>
  );
}

function ImageCard({
  name,
  label,
  hint,
  preview,
  clearName,
  onFile,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  preview?: string;
  clearName?: string;
  onFile?: (file: File) => void;
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
        <input
          name={name}
          type="file"
          accept="image/*,.svg"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile?.(file);
          }}
        />
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

function PriceEditor({ product }: { product?: Product }) {
  const [price, setPrice] = useState(String(product?.priceEgp ?? 100));
  const [discounted, setDiscounted] = useState(Boolean(product?.discounted));
  const [percent, setPercent] = useState(String(product?.discountPercent || ""));
  const [sale, setSale] = useState(String(product?.saleEgp || ""));
  const list = Math.max(0, Number(price) || 0);

  function fromPercent(next: string) {
    setPercent(next);
    const value = Math.min(99, Math.max(0, Number(next) || 0));
    if (list && value > 0) setSale(String(Math.round(list * (1 - value / 100))));
  }

  function fromSale(next: string) {
    setSale(next);
    const value = Math.max(0, Number(next) || 0);
    if (list && value > 0 && value < list) setPercent(String(Math.round((1 - value / list) * 100)));
  }

  return (
    <div className="space-y-3">
      <label className="space-y-1.5 text-sm">
        <span>Price (EGP)</span>
        <input
          name="priceEgp"
          type="number"
          min={0}
          step="1"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="discounted"
          value="on"
          checked={discounted}
          onChange={(event) => setDiscounted(event.target.checked)}
          className="mt-0.5 size-4 accent-oxford"
        />
        <span>
          <span className="block font-medium text-oxford">Discounted</span>
          <span className="text-xs text-muted-foreground">Show the old price crossed out, the sale price, and the % off.</span>
        </span>
      </label>
      {discounted ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5 text-sm">
            <span>Percent off</span>
            <input
              name="discountPercent"
              type="number"
              min={0}
              max={99}
              value={percent}
              onChange={(event) => fromPercent(event.target.value)}
              className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span>Sale price</span>
            <input
              name="saleEgp"
              type="number"
              min={0}
              value={sale}
              onChange={(event) => fromSale(event.target.value)}
              className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function OptionEditor({ product }: { product?: Product }) {
  const initial =
    (product?.optionChoices?.length ? product.optionChoices : product?.materials ?? ["White"]).map((label) => ({
      id: `opt-${label}-${Math.random().toString(36).slice(2, 6)}`,
      label,
      image: product?.optionImages?.[label] || "",
      preview: product?.optionImages?.[label] || "",
    })) ?? [];
  const [labelEn, setLabelEn] = useState(product?.optionLabel?.en || "Color");
  const [labelAr, setLabelAr] = useState(product?.optionLabel?.ar || "اللون");
  const [rows, setRows] = useState(initial.length ? initial : [{ id: "opt-1", label: "", image: "", preview: "" }]);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-oxford">Customer option</p>
      <p className="text-xs text-muted-foreground">
        Buttons on the product page. Each choice can have its own preview photo.
      </p>
      <div className="flex flex-wrap gap-2">
        {[
          { en: "Color", ar: "اللون" },
          { en: "Size", ar: "المقاس" },
          { en: "Material", ar: "الخامة" },
        ].map((preset) => (
          <button
            key={preset.en}
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              labelEn === preset.en ? "bg-oxford text-white" : "bg-cream text-oxford ring-1 ring-oxford/10"
            }`}
            onClick={() => {
              setLabelEn(preset.en);
              setLabelAr(preset.ar);
            }}
          >
            {preset.en}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="optionLabelEn">Label · English</Label>
          <input
            id="optionLabelEn"
            name="optionLabelEn"
            value={labelEn}
            onChange={(event) => setLabelEn(event.target.value)}
            className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="optionLabelAr">Label · عربي</Label>
          <input
            id="optionLabelAr"
            name="optionLabelAr"
            dir="rtl"
            value={labelAr}
            onChange={(event) => setLabelAr(event.target.value)}
            className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
          />
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="flex items-center gap-3 rounded-2xl bg-cream p-2 ring-1 ring-oxford/8">
            <label className="relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-white ring-1 ring-oxford/10">
              {row.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full place-items-center px-1 text-center text-[10px] text-muted-foreground">
                  Photo
                </span>
              )}
              <input type="hidden" name="optionImageExisting" value={row.image} />
              <input
                type="file"
                name="optionImage"
                accept="image/*"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const preview = URL.createObjectURL(file);
                  setRows((current) => current.map((item, i) => (i === index ? { ...item, preview } : item)));
                }}
              />
            </label>
            <input
              name="optionChoice"
              value={row.label}
              onChange={(event) =>
                setRows((current) => current.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))
              }
              placeholder="White"
              className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-white px-2.5 text-sm"
            />
            <button
              type="button"
              className="text-xs text-red-700"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="h-9 rounded-full bg-oxford px-4 text-sm font-heading text-white"
          onClick={() =>
            setRows((current) => [...current, { id: `opt-${Date.now()}`, label: "", image: "", preview: "" }])
          }
        >
          Add choice
        </button>
      </div>
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
  dir,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
  dir?: "rtl" | "ltr";
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
        dir={dir}
        className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
      />
    </div>
  );
}
