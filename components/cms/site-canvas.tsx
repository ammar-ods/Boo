"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ProductGrid } from "@/components/catalog/product-grid";
import { DisciplineCarousel } from "@/components/home/discipline-carousel";
import type { Product } from "@/lib/products";
import { newSection, SECTION_TYPES, type SiteSection, type SectionType } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export function SiteCanvas({
  initial,
  products,
  isAdmin,
}: {
  initial: { sections: SiteSection[] };
  products: Product[];
  isAdmin: boolean;
}) {
  const params = useSearchParams();
  const { t, formatPrice } = useI18n();
  const [sections, setSections] = useState(initial.sections);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.get("edit") === "1" && isAdmin) {
      setEditing(true);
      window.sessionStorage.setItem("boo-edit", "1");
    } else if (window.sessionStorage.getItem("boo-edit") === "1" && isAdmin) {
      setEditing(true);
    }
  }, [isAdmin, params]);

  const visible = useMemo(
    () => (editing ? sections : sections.filter((section) => section.visible)),
    [editing, sections],
  );

  function patch(id: string, next: Partial<SiteSection> | { content: Partial<SiteSection["content"]>; style?: Partial<SiteSection["style"]> }) {
    setSections((current) =>
      current.map((section) => {
        if (section.id !== id) return section;
        return {
          ...section,
          ...next,
          content: { ...section.content, ...(next as { content?: SiteSection["content"] }).content },
          style: { ...section.style, ...(next as { style?: SiteSection["style"] }).style },
        };
      }),
    );
  }

  async function save() {
    setSaving(true);
    const response = await fetch("/api/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
    });
    setSaving(false);
    if (!response.ok) {
      toast.error("Could not save");
      return;
    }
    toast.success("Saved");
  }

  function add(type: SectionType, afterId?: string) {
    const section = newSection(type);
    setSections((current) => {
      if (!afterId) return [...current, section];
      const index = current.findIndex((item) => item.id === afterId);
      const next = [...current];
      next.splice(index + 1, 0, section);
      return next;
    });
  }

  function move(id: string, dir: -1 | 1) {
    setSections((current) => {
      const index = current.findIndex((item) => item.id === id);
      const nextIndex = index + dir;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [row] = next.splice(index, 1);
      next.splice(nextIndex, 0, row);
      return next;
    });
  }

  return (
    <div>
      {isAdmin && editing ? (
        <div className="fixed end-4 top-40 z-50 surface-card flex flex-col gap-2 p-3 text-sm">
          <button type="button" className="btn-press btn-press-sm" onClick={save} disabled={saving}>
            {saving ? "…" : "Save"}
          </button>
          <button
            type="button"
            className="rounded-full px-3 py-1"
            onClick={() => {
              setEditing(false);
              window.sessionStorage.setItem("boo-edit", "0");
            }}
          >
            {t("doneEdit")}
          </button>
          <select
            className="rounded-full border border-border bg-white px-2 py-1"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) add(event.target.value as SectionType);
              event.target.value = "";
            }}
          >
            <option value="">+ section</option>
            {SECTION_TYPES.map((item) => (
              <option key={item.type} value={item.type}>
                {item.labelAr}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {visible.map((section) => (
        <div key={section.id} className="relative">
          {editing ? (
            <div className="absolute start-2 top-2 z-20 flex flex-wrap gap-1 rounded-full bg-white/95 p-1 text-xs shadow">
              <button type="button" onClick={() => move(section.id, -1)}>↑</button>
              <button type="button" onClick={() => move(section.id, 1)}>↓</button>
              <button type="button" onClick={() => patch(section.id, { visible: !section.visible })}>
                {section.visible ? "hide" : "show"}
              </button>
              <button type="button" onClick={() => setSections((current) => current.filter((item) => item.id !== section.id))}>
                delete
              </button>
            </div>
          ) : null}
          <SectionView
            section={section}
            products={products}
            editing={editing}
            t={t}
            formatPrice={formatPrice}
            onChange={(content, style) => patch(section.id, { content, style })}
          />
        </div>
      ))}
    </div>
  );
}

function SectionView({
  section,
  products,
  editing,
  t,
  formatPrice,
  onChange,
}: {
  section: SiteSection;
  products: Product[];
  editing: boolean;
  t: (key: string) => string;
  formatPrice: (n: number) => string;
  onChange: (content: SiteSection["content"], style?: SiteSection["style"]) => void;
}) {
  const style = {
    background: section.style.background,
    color: section.style.color,
    paddingTop: section.style.paddingY ?? 48,
    paddingBottom: section.style.paddingY ?? 48,
    textAlign: (section.style.align ?? "center") as "center" | "start",
  };
  const fontSize = section.style.fontSize ?? 36;

  function field(key: keyof SiteSection["content"], className: string, as: "h1" | "h2" | "p" | "span" = "p") {
    const Tag = as;
    const value = section.content[key] ?? "";
    const headingStyle = as === "h1" || as === "h2" ? { fontSize } : undefined;
    if (!editing) {
      return value ? (
        <Tag className={className} style={headingStyle}>
          {value}
        </Tag>
      ) : null;
    }
    return (
      <Tag
        className={`${className} outline-dashed outline-1 outline-oxford/20`}
        style={headingStyle}
        contentEditable
        suppressContentEditableWarning
        onBlur={(event) => onChange({ [key]: event.currentTarget.textContent ?? "" })}
      >
        {value}
      </Tag>
    );
  }

  if (section.type === "collections") {
    return (
      <div style={style}>
        {field("title", "font-heading text-oxford", "h2")}
        <DisciplineCarousel />
      </div>
    );
  }

  if (section.type === "products") {
    return (
      <section id="creations" className="mx-auto max-w-6xl px-4 sm:px-6" style={style}>
        {field("title", "font-heading text-oxford", "h2")}
        {field("body", "mt-2 text-muted-foreground")}
        <div className="mt-8">
          <ProductGrid products={products} compact />
        </div>
      </section>
    );
  }

  return (
    <section style={style} className="px-4 sm:px-6">
      <div className={`mx-auto max-w-6xl ${section.style.align === "center" ? "text-center" : ""}`}>
        {editing ? (
          <div className="mb-4 flex flex-wrap gap-2 text-xs text-oxford">
            <label>
              bg
              <input
                className="ms-1 w-24 rounded border px-1"
                defaultValue={section.style.background}
                onBlur={(event) => onChange({}, { background: event.target.value })}
              />
            </label>
            <label>
              color
              <input
                className="ms-1 w-24 rounded border px-1"
                defaultValue={section.style.color}
                onBlur={(event) => onChange({}, { color: event.target.value })}
              />
            </label>
            <label>
              size
              <input
                type="number"
                className="ms-1 w-16 rounded border px-1"
                defaultValue={section.style.fontSize}
                onBlur={(event) => onChange({}, { fontSize: Number(event.target.value) })}
              />
            </label>
            <label>
              pad
              <input
                type="number"
                className="ms-1 w-16 rounded border px-1"
                defaultValue={section.style.paddingY}
                onBlur={(event) => onChange({}, { paddingY: Number(event.target.value) })}
              />
            </label>
            {section.content.image !== undefined ? (
              <label>
                image
                <input
                  type="file"
                  accept="image/*"
                  className="ms-1"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const data = new FormData();
                    data.set("file", file);
                    const response = await fetch("/api/site/upload", { method: "POST", body: data });
                    const payload = (await response.json()) as { url?: string };
                    if (payload.url) onChange({ image: payload.url });
                  }}
                />
              </label>
            ) : null}
          </div>
        ) : null}
        {field("eyebrow", "text-xs font-medium tracking-[0.18em] opacity-70", "p")}
        {field("title", "mt-2 font-heading leading-tight", "h1")}
        {field("body", "mx-auto mt-4 max-w-xl opacity-80")}
        {section.content.image ? (
          <div
            className="relative mx-auto mt-6 overflow-hidden rounded-[28px]"
            style={{ height: section.style.imageHeight ?? 280, maxWidth: 720 }}
          >
            <Image src={section.content.image} alt="" fill className="object-cover" />
          </div>
        ) : null}
        <div className={`mt-6 flex flex-wrap gap-3 ${section.style.align === "center" ? "justify-center" : ""}`}>
          {section.content.ctaHref && section.content.ctaLabel ? (
            <Link href={section.content.ctaHref} className="btn-press">
              {section.content.ctaLabel}
            </Link>
          ) : null}
          {section.content.secondaryCtaHref && section.content.secondaryCtaLabel ? (
            <Link href={section.content.secondaryCtaHref} className="btn-press btn-press-outline">
              {section.content.secondaryCtaLabel}
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
