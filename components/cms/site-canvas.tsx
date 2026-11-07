"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ProductGrid } from "@/components/catalog/product-grid";
import { DisciplineCarousel } from "@/components/home/discipline-carousel";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import { pick, SECTION_TYPES, type Localized, type SiteSection } from "@/lib/site";

export function SiteCanvas({ products }: { products: Product[] }) {
  const { editing, site, selectedId, setSelectedId, patchSection, moveSection, removeSection } = useEdit();
  const { t, formatPrice, locale } = useI18n();
  const visible = editing ? site.sections : site.sections.filter((section) => section.visible);

  return (
    <div>
      {visible.map((section) => (
        <div
          key={section.id}
          className={`relative ${editing && selectedId === section.id ? "ring-4 ring-oxford/30" : ""}`}
          onClick={() => {
            if (editing) setSelectedId(section.id);
          }}
        >
          {editing ? (
            <div className="absolute start-3 top-3 z-30 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="grid size-11 place-items-center rounded-2xl bg-white text-lg font-bold text-oxford shadow-lg ring-1 ring-oxford/10"
                onClick={(event) => {
                  event.stopPropagation();
                  moveSection(section.id, -1);
                }}
                aria-label="Move up"
              >
                <ArrowUp className="size-5" />
              </button>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-2xl bg-white text-lg font-bold text-oxford shadow-lg ring-1 ring-oxford/10"
                onClick={(event) => {
                  event.stopPropagation();
                  moveSection(section.id, 1);
                }}
                aria-label="Move down"
              >
                <ArrowDown className="size-5" />
              </button>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-2xl bg-white shadow-lg ring-1 ring-oxford/10"
                onClick={(event) => {
                  event.stopPropagation();
                  patchSection(section.id, { visible: !section.visible });
                }}
                aria-label={section.visible ? "Hide" : "Show"}
              >
                {section.visible ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
              </button>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-2xl bg-red-50 text-red-700 shadow-lg ring-1 ring-red-200"
                onClick={(event) => {
                  event.stopPropagation();
                  removeSection(section.id);
                }}
                aria-label="Delete section"
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          ) : null}
          <SectionView
            section={section}
            products={products}
            t={t}
            formatPrice={formatPrice}
            locale={locale}
          />
        </div>
      ))}
      {editing && selectedId ? (
        <SectionInspector
          section={site.sections.find((item) => item.id === selectedId) ?? null}
          products={products}
        />
      ) : null}
    </div>
  );
}

function SectionView({
  section,
  products,
  t,
  formatPrice,
  locale,
}: {
  section: SiteSection;
  products: Product[];
  t: (key: string) => string;
  formatPrice: (n: number) => string;
  locale: string;
}) {
  const style = {
    background: section.style.background,
    color: section.style.color,
    paddingTop: section.style.paddingY ?? 48,
    paddingBottom: section.style.paddingY ?? 48,
    textAlign: (section.style.align ?? "center") as "center" | "start",
  };
  const fontSize = section.style.fontSize ?? 36;
  const image = pick(section.content.image, locale);

  function text(key: keyof SiteSection["content"], className: string, as: "h1" | "h2" | "p" = "p") {
    const Tag = as;
    const value = pick(section.content[key] as Localized | undefined, locale);
    if (!value) return null;
    return (
      <Tag className={className} style={as === "h1" || as === "h2" ? { fontSize } : undefined}>
        {value}
      </Tag>
    );
  }

  if (section.type === "collections") {
    return (
      <div style={style}>
        {text("title", "px-4 font-heading text-oxford sm:px-6", "h2")}
        <DisciplineCarousel />
      </div>
    );
  }

  if (section.type === "products") {
    return (
      <section id="creations" className="mx-auto max-w-6xl px-4 sm:px-6" style={style}>
        {text("title", "font-heading text-oxford", "h2")}
        {text("body", "mt-2 text-muted-foreground")}
        <div className="mt-8">
          <ProductGrid products={products} compact />
        </div>
      </section>
    );
  }

  return (
    <section style={style} className="px-4 sm:px-6">
      <div className={`mx-auto max-w-6xl ${section.style.align === "center" ? "text-center" : ""}`}>
        {text("eyebrow", "text-xs font-medium tracking-[0.18em] opacity-70")}
        {text("title", "mt-2 font-heading leading-tight", "h1")}
        {text("body", "mx-auto mt-4 max-w-xl opacity-80")}
        {image ? (
          <div
            className="relative mx-auto mt-6 overflow-hidden rounded-[28px]"
            style={{ height: section.style.imageHeight ?? 280, maxWidth: 720 }}
          >
            {image.startsWith("data:") || image.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <Image src={image} alt="" fill className="object-cover" />
            )}
          </div>
        ) : null}
        <div className={`mt-6 flex flex-wrap gap-3 ${section.style.align === "center" ? "justify-center" : ""}`}>
          {section.content.ctaHref && pick(section.content.ctaLabel, locale) ? (
            <Link href={section.content.ctaHref} className="btn-press">
              {pick(section.content.ctaLabel, locale)}
            </Link>
          ) : null}
          {section.content.secondaryCtaHref && pick(section.content.secondaryCtaLabel, locale) ? (
            <Link href={section.content.secondaryCtaHref} className="btn-press btn-press-outline">
              {pick(section.content.secondaryCtaLabel, locale)}
            </Link>
          ) : null}
        </div>
        {section.type === "hero" ? (
          <dl className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-2xl font-semibold">{formatPrice(100)}</dt>
              <dd className="mt-1 opacity-70">{t("price")}</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold">3</dt>
              <dd className="mt-1 opacity-70">{t("pieces")}</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold">EGP</dt>
              <dd className="mt-1 opacity-70">default</dd>
            </div>
          </dl>
        ) : null}
      </div>
    </section>
  );
}

function SectionInspector({
  section,
  products,
}: {
  section: SiteSection | null;
  products: Product[];
}) {
  const { patchSection, setSelectedId, save, saving, dirty } = useEdit();
  const { t, formatPrice, locale } = useI18n();
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSelectedId]);
  if (!section) return null;
  const meta = SECTION_TYPES.find((item) => item.type === section.type);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-oxford/50 p-3 backdrop-blur-[2px] sm:p-6"
      onClick={() => setSelectedId(null)}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-background shadow-[0_24px_80px_-28px_rgba(10,37,64,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-oxford/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-oxford/50 uppercase">
              {meta?.labelAr} · {meta?.label}
            </p>
            <h3 className="font-heading text-2xl text-oxford">Edit section</h3>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-press btn-press-sm" onClick={() => void save()} disabled={saving || !dirty}>
              {saving ? "…" : "Save"}
            </button>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-2xl bg-cream"
              onClick={() => setSelectedId(null)}
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden overflow-y-auto bg-cream lg:block">
            <p className="px-4 pt-4 text-xs font-semibold tracking-[0.14em] text-oxford/45 uppercase">Live preview</p>
            <div className="origin-top scale-[0.92] p-2">
              <SectionView
                section={section}
                products={products}
                t={t}
                formatPrice={formatPrice}
                locale={locale}
              />
            </div>
          </div>
          <div className="overflow-y-auto p-5">
      <div className="mt-4 grid grid-cols-2 gap-3">
        <NumberField
          label="Font size"
          value={section.style.fontSize ?? 36}
          onChange={(fontSize) => patchSection(section.id, { style: { fontSize } })}
        />
        <NumberField
          label="Padding"
          value={section.style.paddingY ?? 48}
          onChange={(paddingY) => patchSection(section.id, { style: { paddingY } })}
        />
        <ColorField
          label="Background"
          value={section.style.background ?? "#f6f3ea"}
          onChange={(background) => patchSection(section.id, { style: { background } })}
        />
        <ColorField
          label="Text color"
          value={section.style.color ?? "#0a2540"}
          onChange={(color) => patchSection(section.id, { style: { color } })}
        />
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <span className="w-24 text-oxford/70">Align</span>
        <select
          className="h-10 flex-1 rounded-xl border border-oxford/15 bg-cream px-3"
          value={section.style.align ?? "center"}
          onChange={(event) =>
            patchSection(section.id, { style: { align: event.target.value as "start" | "center" } })
          }
        >
          <option value="start">Start</option>
          <option value="center">Center</option>
        </select>
      </label>
      <BilingualField
        label="Eyebrow"
        value={section.content.eyebrow}
        onChange={(eyebrow) => patchSection(section.id, { content: { eyebrow } })}
      />
      <BilingualField
        label="Title"
        value={section.content.title}
        onChange={(title) => patchSection(section.id, { content: { title } })}
      />
      <BilingualField
        label="Body"
        value={section.content.body}
        multiline
        onChange={(body) => patchSection(section.id, { content: { body } })}
      />
      <BilingualField
        label="Button"
        value={section.content.ctaLabel}
        onChange={(ctaLabel) => patchSection(section.id, { content: { ctaLabel } })}
      />
      <label className="mt-3 block text-sm">
        <span className="mb-1 block text-oxford/70">Button link</span>
        <input
          className="h-10 w-full rounded-xl border border-oxford/15 bg-cream px-3"
          value={section.content.ctaHref ?? ""}
          onChange={(event) => patchSection(section.id, { content: { ctaHref: event.target.value } })}
        />
      </label>
      <BilingualField
        label="Second button"
        value={section.content.secondaryCtaLabel}
        onChange={(secondaryCtaLabel) => patchSection(section.id, { content: { secondaryCtaLabel } })}
      />
      <label className="mt-3 block text-sm">
        <span className="mb-1 block text-oxford/70">Second button link</span>
        <input
          className="h-10 w-full rounded-xl border border-oxford/15 bg-cream px-3"
          value={section.content.secondaryCtaHref ?? ""}
          onChange={(event) =>
            patchSection(section.id, { content: { secondaryCtaHref: event.target.value } })
          }
        />
      </label>
      <div className="mt-4 rounded-2xl border border-dashed border-oxford/20 p-3">
        <p className="mb-2 flex items-center gap-2 font-medium text-oxford">
          <ImagePlus className="size-4" /> Banner image
        </p>
        <ImageUpload
          label="Arabic image"
          value={section.content.image?.ar}
          onChange={(url) =>
            patchSection(section.id, {
              content: { image: { ar: url, en: section.content.image?.en || url } },
            })
          }
        />
        <ImageUpload
          label="English image"
          value={section.content.image?.en}
          onChange={(url) =>
            patchSection(section.id, {
              content: { image: { ar: section.content.image?.ar || url, en: url } },
            })
          }
        />
        <NumberField
          label="Image height"
          value={section.style.imageHeight ?? 280}
          onChange={(imageHeight) => patchSection(section.id, { style: { imageHeight } })}
        />
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-oxford/70">{label}</span>
      <input
        type="number"
        className="h-10 w-full rounded-xl border border-oxford/15 bg-cream px-3"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-oxford/70">{label}</span>
      <div className="flex h-10 items-center gap-2 rounded-xl border border-oxford/15 bg-cream px-2">
        <input
          type="color"
          className="size-7 cursor-pointer rounded"
          value={value.startsWith("#") ? value : "#0a2540"}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          className="w-full bg-transparent outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

function BilingualField({
  label,
  value,
  multiline,
  onChange,
}: {
  label: string;
  value?: Localized;
  multiline?: boolean;
  onChange: (value: Localized) => void;
}) {
  const current = value ?? { ar: "", en: "" };
  const Field = multiline ? "textarea" : "input";
  return (
    <div className="mt-3">
      <p className="mb-1 text-sm text-oxford/70">{label}</p>
      <div className="grid gap-2">
        <Field
          className="w-full rounded-xl border border-oxford/15 bg-cream px-3 py-2"
          placeholder={`${label} · عربي`}
          value={current.ar}
          rows={multiline ? 3 : undefined}
          onChange={(event) => onChange({ ...current, ar: event.currentTarget.value })}
        />
        <Field
          className="w-full rounded-xl border border-oxford/15 bg-cream px-3 py-2"
          placeholder={`${label} · English`}
          value={current.en}
          rows={multiline ? 3 : undefined}
          onChange={(event) => onChange({ ...current, en: event.currentTarget.value })}
        />
      </div>
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
}) {
  return (
    <label className="mb-3 block text-sm">
      <span className="mb-1 block text-oxford/70">{label}</span>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mb-2 h-24 w-full rounded-xl object-cover" />
      ) : null}
      <input
        type="file"
        accept="image/*"
        className="block w-full text-sm"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const data = new FormData();
          data.set("file", file);
          const response = await fetch("/api/site/upload", { method: "POST", body: data });
          const payload = (await response.json()) as { url?: string; error?: string };
          if (!response.ok || !payload.url) {
            toast.error(payload.error || "Could not upload image");
            return;
          }
          onChange(payload.url);
        }}
      />
    </label>
  );
}
