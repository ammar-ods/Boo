"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ProductGrid } from "@/components/catalog/product-grid";
import { DisciplineCarousel } from "@/components/home/discipline-carousel";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import { AutoScroller } from "@/components/cms/auto-scroller";
import {
  pick,
  SECTION_TYPES,
  sectionSurface,
  type GalleryItem,
  type ImagePlacement,
  type Localized,
  type SiteSection,
} from "@/lib/site";

export function SiteCanvas({ products }: { products: Product[] }) {
  const { editing, site, selectedId, setSelectedId, patchSection, moveSection, removeSection, addSection } = useEdit();
  const { locale } = useI18n();
  const [insertFor, setInsertFor] = useState<string | null>(null);
  const visible = editing ? site.sections : site.sections.filter((section) => section.visible);

  useEffect(() => {
    if (!insertFor) return;
    const close = () => setInsertFor(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [insertFor]);

  function animateMove(id: string, dir: -1 | 1) {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-section-id]"));
    const before = new Map(nodes.map((node) => [node.dataset.sectionId ?? "", node.getBoundingClientRect()]));
    flushSync(() => moveSection(id, dir));
    requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>("[data-section-id]").forEach((node) => {
        const prev = before.get(node.dataset.sectionId ?? "");
        if (!prev) return;
        const next = node.getBoundingClientRect();
        const dy = prev.top - next.top;
        if (Math.abs(dy) < 1) return;
        node.animate([{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }], {
          duration: 480,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        });
      });
    });
  }

  return (
    <div>
      {visible.map((section) => (
        <div
          key={section.id}
          data-section-id={section.id}
          className={`relative ${editing && selectedId === section.id ? "ring-4 ring-oxford/30" : ""}`}
          onClick={() => {
            if (editing) setSelectedId(section.id);
          }}
        >
          {editing ? (
            <div className="absolute start-2 top-2 z-30 flex max-w-[calc(100%-1rem)] flex-wrap items-center gap-1.5 sm:start-3 sm:top-3 sm:gap-2">
              <button
                type="button"
                className="grid size-9 place-items-center rounded-2xl bg-white text-lg font-bold text-oxford shadow-lg ring-1 ring-oxford/10 sm:size-11"
                onClick={(event) => {
                  event.stopPropagation();
                  animateMove(section.id, -1);
                }}
                aria-label="Move up"
              >
                <ArrowUp className="size-5" />
              </button>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-2xl bg-white text-lg font-bold text-oxford shadow-lg ring-1 ring-oxford/10 sm:size-11"
                onClick={(event) => {
                  event.stopPropagation();
                  animateMove(section.id, 1);
                }}
                aria-label="Move down"
              >
                <ArrowDown className="size-5" />
              </button>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-2xl bg-white shadow-lg ring-1 ring-oxford/10 sm:size-11"
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
                className="grid size-9 place-items-center rounded-2xl bg-red-50 text-red-700 shadow-lg ring-1 ring-red-200 sm:size-11"
                onClick={(event) => {
                  event.stopPropagation();
                  removeSection(section.id);
                }}
                aria-label="Delete section"
              >
                <Trash2 className="size-5" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-2xl bg-oxford text-white shadow-lg sm:size-11"
                  onClick={(event) => {
                    event.stopPropagation();
                    setInsertFor((current) => (current === section.id ? null : section.id));
                  }}
                  aria-label="Add section above"
                >
                  <Plus className="size-5" />
                </button>
                {insertFor === section.id ? (
                  <div
                    className="absolute start-0 top-12 z-40 w-52 overflow-hidden rounded-2xl bg-white py-1 shadow-xl ring-1 ring-oxford/10"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <p className="px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-oxford/50 uppercase">
                      Insert above
                    </p>
                    {SECTION_TYPES.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        className="block w-full px-3 py-2 text-start text-sm text-oxford hover:bg-cream"
                        onClick={() => {
                          addSection(item.type, section.id);
                          setInsertFor(null);
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <SectionView
            section={section}
            products={products}
            locale={locale}
            index={visible.indexOf(section)}
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

function SectionMedia({
  src,
  height,
  widthPct,
  bleed,
  rounded,
}: {
  src: string;
  height: number;
  widthPct: number;
  bleed?: boolean;
  rounded?: boolean;
}) {
  const inset = bleed && rounded;
  return (
    <div
      className={`mx-auto ${inset ? "px-4 sm:px-6" : ""}`}
      style={{
        width: bleed ? "100%" : `${Math.min(100, Math.max(20, widthPct))}%`,
        maxWidth: "100%",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={`mx-auto block h-auto max-w-full object-contain object-top ${
          rounded ? "rounded-[28px]" : ""
        }`}
        style={{ maxHeight: Math.max(48, height), height: "auto" }}
      />
    </div>
  );
}

function SectionShell({
  section,
  index,
  children,
  className = "",
  cover,
}: {
  section: SiteSection;
  index: number;
  children: React.ReactNode;
  className?: string;
  cover?: { src: string; height: number };
}) {
  const surface = sectionSurface(section.style);
  const pad = Math.max(0, section.style.paddingY ?? 48);
  const width = Math.min(100, Math.max(20, section.style.blockWidth ?? 100));
  const minHeight = Math.max(0, section.style.minHeight ?? 0);
  const marginX = Math.max(0, section.style.marginX ?? 0);
  const marginY = Math.max(0, section.style.marginY ?? 0);
  const rounded = Boolean(section.style.rounded);
  return (
    <div
      style={{
        paddingLeft: marginX,
        paddingRight: marginX,
        paddingTop: marginY,
        paddingBottom: marginY,
      }}
    >
      <section
        className={`reveal relative overflow-hidden ${rounded ? "rounded-[22px] sm:rounded-[28px]" : ""} ${className}`}
        style={{
          background: cover ? undefined : surface.background,
          color: surface.color,
          width: `${width}%`,
          maxWidth: "100%",
          marginInline: "auto",
          paddingTop: pad,
          paddingBottom: pad,
          minHeight: cover ? Math.max(minHeight, cover.height) : minHeight || undefined,
          animationDelay: `${index * 80}ms`,
        }}
      >
        {cover ? (
          <>
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover.src} alt="" className="h-full w-full object-cover object-top" />
            </div>
            <div className="absolute inset-0 bg-oxford/35" />
          </>
        ) : null}
        {children}
      </section>
    </div>
  );
}

function SectionView({
  section,
  products,
  locale,
  index = 0,
}: {
  section: SiteSection;
  products: Product[];
  locale: string;
  index?: number;
}) {
  const fontSize = section.style.fontSize ?? 36;
  const image = pick(section.content.image, locale);
  const placement: ImagePlacement =
    section.style.imagePlacement ?? (image ? "below" : "hidden");
  const showImage = placement !== "hidden" && Boolean(image);
  const widthPct = section.style.imageWidth ?? (placement === "bleed" || placement === "cover" ? 100 : 70);
  const height = section.style.imageHeight ?? 280;
  const rounded =
    section.style.imageRounded ?? (placement === "below" || placement === "start" || placement === "end");
  const showPrimary =
    section.style.showPrimaryCta !== false && Boolean(pick(section.content.ctaLabel, locale));
  const showSecondary =
    section.style.showSecondaryCta !== false && Boolean(pick(section.content.secondaryCtaLabel, locale));

  function text(key: keyof SiteSection["content"], className: string, as: "h1" | "h2" | "p" = "p") {
    const Tag = as;
    const value = pick(section.content[key] as Localized | undefined, locale);
    if (!value) return null;
    const min = Math.min(22, Math.round(fontSize * 0.42));
    return (
      <Tag
        className={className}
        style={as === "h1" || as === "h2" ? { fontSize: `clamp(${min}px, 6.2vw, ${fontSize}px)` } : undefined}
      >
        {value}
      </Tag>
    );
  }

  const copy = (
    <>
      {text("eyebrow", "text-xs font-medium tracking-[0.18em] opacity-70")}
      {text("title", "mt-2 font-heading leading-tight", "h1")}
      {text("body", "mx-auto mt-3 max-w-xl text-pretty text-[15px] leading-relaxed opacity-80 sm:mt-4 sm:text-base")}
    </>
  );
  const actions = showPrimary || showSecondary ? (
    <div className={`mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap ${section.style.align === "center" ? "sm:justify-center" : ""}`}>
      {showPrimary ? (
        <Link href={section.content.ctaHref || "/catalog"} className="btn-press w-full sm:w-auto">
          {pick(section.content.ctaLabel, locale)}
        </Link>
      ) : null}
      {showSecondary ? (
        <Link href={section.content.secondaryCtaHref || "/bundles"} className="btn-press btn-press-outline w-full sm:w-auto">
          {pick(section.content.secondaryCtaLabel, locale)}
        </Link>
      ) : null}
    </div>
  ) : null;

  if (section.type === "marquee") {
    return (
      <SectionShell section={section} index={index}>
        {text("title", "mb-4 px-4 font-heading sm:px-6", "h2")}
        <AutoScroller
          items={section.content.gallery ?? []}
          height={height}
          rounded={section.style.imageRounded !== false}
        />
      </SectionShell>
    );
  }

  if (section.type === "collections") {
    return (
      <SectionShell section={section} index={index}>
        {text("title", "px-4 font-heading sm:px-6", "h2")}
        <DisciplineCarousel />
      </SectionShell>
    );
  }

  if (section.type === "products") {
    return (
      <SectionShell section={section} index={index} className="mx-auto max-w-6xl px-4 sm:px-6">
        <div id="creations">
          {text("title", "font-heading", "h2")}
          {text("body", "mt-2 text-muted-foreground")}
          <div className="mt-6 sm:mt-8">
            <ProductGrid products={products} compact />
          </div>
        </div>
      </SectionShell>
    );
  }

  if (placement === "cover" && showImage) {
    return (
      <SectionShell section={section} index={index} cover={{ src: image, height }}>
        <div className={`relative z-10 mx-auto max-w-6xl px-4 sm:px-6 ${section.style.align === "center" ? "text-center" : ""}`}>
          {copy}
          {actions}
        </div>
      </SectionShell>
    );
  }

  if ((placement === "start" || placement === "end") && showImage) {
    const imageCol = (
      <SectionMedia src={image} height={height} widthPct={100} rounded={rounded} />
    );
    return (
      <SectionShell section={section} index={index} className="px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-5 lg:grid-cols-2 lg:gap-8">
          {placement === "start" ? imageCol : null}
          <div className={section.style.align === "center" ? "text-center" : ""}>
            {copy}
            {actions}
          </div>
          {placement === "end" ? imageCol : null}
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell section={section} index={index} className={placement === "bleed" && showImage ? "" : "px-4 sm:px-6"}>
      {placement === "bleed" && showImage ? (
        <SectionMedia src={image} height={height} widthPct={100} bleed rounded={rounded} />
      ) : null}
      <div className={`mx-auto max-w-6xl ${placement === "bleed" && showImage ? "px-4 sm:px-6" : ""} ${section.style.align === "center" ? "text-center" : ""}`}>
        {copy}
        {placement === "below" && showImage ? (
          <div className={`mt-5 ${section.style.align === "center" ? "flex justify-center" : ""} sm:mt-6`}>
            <SectionMedia src={image} height={height} widthPct={widthPct} rounded={rounded} />
          </div>
        ) : null}
        {actions}
      </div>
    </SectionShell>
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
  const { locale } = useI18n();
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
        className="flex max-h-[min(92vh,920px)] w-full max-w-5xl flex-col overflow-hidden rounded-[22px] bg-background shadow-[0_24px_80px_-28px_rgba(10,37,64,0.55)] sm:rounded-[28px]"
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
          <div className="max-h-48 overflow-y-auto bg-cream lg:max-h-none">
            <p className="px-4 pt-4 text-xs font-semibold tracking-[0.14em] text-oxford/45 uppercase">Live preview</p>
            <div className="origin-top p-2 lg:scale-[0.92]">
              <SectionView
                section={section}
                products={products}
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
          onChange={(paddingY) => patchSection(section.id, { style: { paddingY: Math.max(0, paddingY) } })}
        />
        <NumberField
          label="Section width %"
          value={section.style.blockWidth ?? 100}
          onChange={(blockWidth) =>
            patchSection(section.id, { style: { blockWidth: Math.min(100, Math.max(20, blockWidth)) } })
          }
        />
        <NumberField
          label="Min height (0 = auto)"
          value={section.style.minHeight ?? 0}
          onChange={(minHeight) => patchSection(section.id, { style: { minHeight: Math.max(0, minHeight) } })}
        />
        <NumberField
          label="Margin left / right"
          value={section.style.marginX ?? 0}
          onChange={(marginX) => patchSection(section.id, { style: { marginX: Math.max(0, marginX) } })}
        />
        <NumberField
          label="Margin top / bottom"
          value={section.style.marginY ?? 0}
          onChange={(marginY) => patchSection(section.id, { style: { marginY: Math.max(0, marginY) } })}
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
      <label className="mt-3 flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-cream px-3 text-sm">
        <span>Rounded corners</span>
        <input
          type="checkbox"
          className="size-5"
          checked={Boolean(section.style.rounded)}
          onChange={(event) => patchSection(section.id, { style: { rounded: event.target.checked } })}
        />
      </label>
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
      <label className="mt-3 flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-cream px-3 text-sm">
        <span>Show primary button</span>
        <input
          type="checkbox"
          className="size-5"
          checked={section.style.showPrimaryCta !== false}
          onChange={(event) => patchSection(section.id, { style: { showPrimaryCta: event.target.checked } })}
        />
      </label>
      <label className="mt-3 flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-cream px-3 text-sm">
        <span>Show second button</span>
        <input
          type="checkbox"
          className="size-5"
          checked={section.style.showSecondaryCta !== false}
          onChange={(event) => patchSection(section.id, { style: { showSecondaryCta: event.target.checked } })}
        />
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
        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-oxford/70">Image layout</span>
          <select
            className="h-10 w-full rounded-xl border border-oxford/15 bg-cream px-3"
            value={section.style.imagePlacement ?? (section.content.image ? "below" : "hidden")}
            onChange={(event) =>
              patchSection(section.id, { style: { imagePlacement: event.target.value as ImagePlacement } })
            }
          >
            <option value="hidden">No image</option>
            <option value="below">Below text, inset</option>
            <option value="bleed">Full-width strip</option>
            <option value="cover">Fill the whole section</option>
            <option value="start">Half, image first</option>
            <option value="end">Half, image last</option>
          </select>
        </label>
        <NumberField
          label="Image width % (inset layout)"
          value={section.style.imageWidth ?? 70}
          onChange={(imageWidth) => patchSection(section.id, { style: { imageWidth } })}
        />
        <NumberField
          label="Max image height"
          value={section.style.imageHeight ?? 280}
          onChange={(imageHeight) => patchSection(section.id, { style: { imageHeight } })}
        />
        <label className="mt-3 flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-cream px-3 text-sm">
          <span>Rounded images</span>
          <input
            type="checkbox"
            className="size-5"
            checked={
              section.style.imageRounded ??
              (section.style.imagePlacement === "below" ||
                section.style.imagePlacement === "start" ||
                section.style.imagePlacement === "end")
            }
            onChange={(event) => patchSection(section.id, { style: { imageRounded: event.target.checked } })}
          />
        </label>
        <ImageUpload
          label="Arabic image"
          value={section.content.image?.ar}
          onChange={(url) =>
            patchSection(section.id, {
              content: { image: { ar: url, en: section.content.image?.en || url } },
              style: { imagePlacement: section.style.imagePlacement === "hidden" ? "below" : section.style.imagePlacement },
            })
          }
          onClear={() =>
            patchSection(section.id, {
              content: { image: { ar: "", en: section.content.image?.en || "" } },
            })
          }
        />
        <ImageUpload
          label="English image"
          value={section.content.image?.en}
          onChange={(url) =>
            patchSection(section.id, {
              content: { image: { ar: section.content.image?.ar || url, en: url } },
              style: { imagePlacement: section.style.imagePlacement === "hidden" ? "below" : section.style.imagePlacement },
            })
          }
          onClear={() =>
            patchSection(section.id, {
              content: { image: { ar: section.content.image?.ar || "", en: "" } },
            })
          }
        />
        <button
          type="button"
          className="mt-2 w-full rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
          onClick={() =>
            patchSection(section.id, {
              content: { image: { ar: "", en: "" } },
              style: { imagePlacement: "hidden" },
            })
          }
        >
          Remove all images
        </button>
      </div>
      {section.type === "marquee" ? (
        <GalleryEditor
          items={section.content.gallery ?? []}
          onChange={(gallery) => patchSection(section.id, { content: { gallery } })}
        />
      ) : null}
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

function GalleryEditor({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-oxford/20 p-3">
      <p className="mb-2 font-medium text-oxford">Scrolling images</p>
      {items.map((item, index) => (
        <div key={`${item.src}-${index}`} className="mb-3 rounded-2xl bg-cream p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt="" className="mb-2 max-h-24 w-full object-contain" />
          <input
            className="mb-2 h-10 w-full rounded-xl border border-oxford/15 bg-white px-3 text-sm"
            placeholder="Link (optional) e.g. /product/white-tee"
            value={item.href ?? ""}
            onChange={(event) =>
              onChange(items.map((row, i) => (i === index ? { ...row, href: event.target.value } : row)))
            }
          />
          <button
            type="button"
            className="text-xs font-semibold text-red-700"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <ImageUpload label="Add image" onChange={(url) => onChange([...items, { src: url }])} />
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
}) {
  return (
    <div className="mb-3 text-sm">
      <p className="mb-1 text-oxford/70">{label}</p>
      {value ? (
        <div className="mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="max-h-28 w-full rounded-xl object-contain object-top" />
          {onClear ? (
            <button type="button" className="mt-1 text-xs font-semibold text-red-700" onClick={onClear}>
              Remove this image
            </button>
          ) : null}
        </div>
      ) : null}
      <label>
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
    </div>
  );
}
