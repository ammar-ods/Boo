"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { CatalogSection } from "@/lib/site";
import { normalizeCategoryId, productThumbnail, type Product } from "@/lib/products";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 rounded-full bg-oxford px-6 font-heading text-white">
      {pending ? "Saving…" : label}
    </button>
  );
}

export function CategoryForm({
  section,
  products,
  action,
  error,
}: {
  section?: CatalogSection;
  products: Product[];
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
}) {
  const [imageUrl, setImageUrl] = useState(section?.image || "");
  const selected = new Set(
    products.filter((product) => normalizeCategoryId(product.category) === section?.id).map((product) => product.slug),
  );
  const [picked, setPicked] = useState<string[]>([...selected]);

  function toggle(slug: string) {
    setPicked((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  }

  return (
    <form action={action} className="space-y-6">
      {section ? <input type="hidden" name="id" value={section.id} /> : null}
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <section className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
        <h2 className="font-heading text-xl text-oxford">Details</h2>
        <label className="flex h-12 items-center justify-between gap-3 rounded-2xl bg-cream px-4 text-sm">
          <span>Visible on the shop, nav, and Discipline menu</span>
          <input type="checkbox" name="visible" defaultChecked={section?.visible !== false} className="size-4 accent-oxford" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Name · English
            <input
              name="titleEn"
              required
              defaultValue={section?.label.en}
              className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
            />
          </label>
          <label className="block text-sm">
            Name · عربي
            <input
              name="titleAr"
              dir="rtl"
              defaultValue={section?.label.ar}
              className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
            />
          </label>
        </div>
        {section ? null : (
          <label className="block text-sm">
            Slug
            <input
              name="slug"
              placeholder="eid"
              className="mt-1 h-11 w-full rounded-full border border-input px-4 text-sm"
            />
          </label>
        )}
        <div className="text-sm">
          <p className="mb-2">Thumbnail</p>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="mb-3 h-40 w-32 rounded-2xl object-cover" />
          ) : (
            <div className="mb-3 grid h-40 w-32 place-items-center rounded-2xl bg-cream text-xs text-muted-foreground">
              No image
            </div>
          )}
          <input type="file" name="image" accept="image/*" className="block w-full text-xs" />
        </div>
      </section>

      <section className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl text-oxford">Products in this category</h2>
            <p className="text-sm text-muted-foreground">Tick pieces to show them here. You can also add a new one.</p>
          </div>
          {section ? (
            <Link
              href={`/admin/products/new?category=${encodeURIComponent(section.id)}`}
              className="rounded-full bg-oxford px-4 py-2 text-sm font-heading text-white"
            >
              New product
            </Link>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {products.map((product) => {
            const on = picked.includes(product.slug);
            return (
              <label
                key={product.slug}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl p-2 ring-1 ${
                  on ? "bg-cream ring-oxford/20" : "bg-white ring-oxford/8"
                }`}
              >
                <input
                  type="checkbox"
                  name="productSlug"
                  value={product.slug}
                  checked={on}
                  onChange={() => toggle(product.slug)}
                  className="size-4 accent-oxford"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productThumbnail(product)} alt="" className="size-14 rounded-xl object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-oxford">{product.name}</span>
                  <span className="text-xs text-muted-foreground">{product.category || "Unassigned"}</span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <Submit label={section ? "Save category" : "Create category"} />
    </form>
  );
}
