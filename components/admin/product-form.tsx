import type { Product } from "@/lib/products";
import { CATEGORIES } from "@/lib/products";
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
  const safe = product?.safe_zone_bounds ?? {
    left: 220,
    top: 200,
    width: 360,
    height: 360,
  };

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
          <Label htmlFor="mockup">Product preview image</Label>
          <input id="mockup" name="mockup" type="file" accept="image/*,.svg" />
          {product?.mockup ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.mockup} alt="" className="mt-2 h-40 rounded-xl object-cover" />
          ) : null}
        </div>
      </div>

      <div className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
        <h2 className="font-heading text-xl">Print / etch border</h2>
        <p className="text-xs text-muted-foreground">
          Coordinates are on an 800×800 canvas. This dashed box is what customers see while
          placing artwork.
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
