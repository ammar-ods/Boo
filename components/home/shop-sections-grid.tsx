"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Baby,
  CupSoda,
  Frame,
  Gift,
  Heart,
  MoonStar,
  Package,
  Plus,
  Shirt,
  Sparkles,
  Trash2,
  Trees,
  type LucideIcon,
} from "lucide-react";
import { removeNavCategory, upsertNavCategory } from "@/lib/categories";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { loc, pageSlugify, pick, type CatalogSection } from "@/lib/site";
import { EditableCopy } from "@/components/cms/editable-copy";

const ICONS: LucideIcon[] = [MoonStar, Heart, Baby, Frame, Gift, Shirt, CupSoda, Trees, Package, Sparkles];

function iconFor(id: string, index: number): LucideIcon {
  const key = id.toLowerCase();
  if (key.includes("apparel") || key.includes("shirt")) return Shirt;
  if (key.includes("drink") || key.includes("mug") || key.includes("cup")) return CupSoda;
  if (key.includes("wood") || key.includes("laser")) return Trees;
  if (key.includes("ramadan") || key.includes("eid")) return MoonStar;
  if (key.includes("newborn") || key.includes("baby") || key.includes("sebou")) return Baby;
  if (key.includes("gift") || key.includes("bundle")) return Gift;
  if (key.includes("wall") || key.includes("decor")) return Frame;
  if (key.includes("book") || key.includes("katb") || key.includes("engage")) return Heart;
  return ICONS[index % ICONS.length];
}

export function ShopSectionsGrid({ embedded = false }: { embedded?: boolean }) {
  const { site, editing, setChrome } = useEdit();
  const { locale } = useI18n();
  const [draftEn, setDraftEn] = useState("");
  const [draftAr, setDraftAr] = useState("");
  const all = site.chrome.catalogSections ?? [];
  const sections = editing ? all : all.filter((section) => section.visible !== false);
  if (!sections.length && !editing) return null;

  function patch(id: string, next: Partial<CatalogSection>) {
    const catalogSections = all.map((section) =>
      section.id === id ? { ...section, ...next, label: next.label ?? section.label } : section,
    );
    const updated = catalogSections.find((section) => section.id === id);
    setChrome({
      catalogSections,
      navLinks: updated ? upsertNavCategory(site.chrome.navLinks, updated) : site.chrome.navLinks,
    });
  }

  function addSection() {
    const en = draftEn.trim() || "New section";
    const ar = draftAr.trim() || en;
    let id = pageSlugify(en) || `section-${Math.random().toString(36).slice(2, 7)}`;
    if (all.some((section) => section.id === id)) id = `${id}-${Math.random().toString(36).slice(2, 4)}`;
    const section: CatalogSection = {
      id,
      href: `/p/${id}`,
      image: "",
      label: loc(ar, en),
      visible: true,
    };
    setChrome({
      catalogSections: [...all, section],
      navLinks: upsertNavCategory(site.chrome.navLinks, section),
    });
    setDraftEn("");
    setDraftAr("");
  }

  function removeSection(id: string) {
    setChrome({
      catalogSections: all.filter((section) => section.id !== id),
      navLinks: removeNavCategory(site.chrome.navLinks, id),
    });
  }

  const grid = (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {sections.map((section, index) => {
        const Icon = iconFor(section.id, index);
        const gold = index % 2 === 0;
        const cardClass = `group relative flex flex-col items-center rounded-[16px] bg-white p-5 text-center shadow-sm transition-all hover:shadow-md ${
          section.visible === false ? "opacity-50" : ""
        }`;
        const body = (
          <>
            <div
              className={`mb-3 grid size-16 place-items-center rounded-full transition-colors ${
                gold
                  ? "bg-[#FBF5E6] text-[#C59B27] group-hover:bg-[#C59B27] group-hover:text-white dark:bg-[#C59B27]/15"
                  : "bg-cream text-foreground group-hover:bg-foreground group-hover:text-background"
              }`}
            >
              <Icon className="size-7" strokeWidth={1.75} />
            </div>
            {editing ? (
              <div className="w-full space-y-1.5" onClick={(event) => event.stopPropagation()}>
                <input
                  className="h-8 w-full rounded-lg border border-oxford/10 bg-[#f7f6f3] px-2 text-center text-sm font-bold text-oxford"
                  value={section.label.en}
                  placeholder="English"
                  onChange={(event) => patch(section.id, { label: { ...section.label, en: event.target.value } })}
                />
                <input
                  dir="rtl"
                  className="h-8 w-full rounded-lg border border-oxford/10 bg-[#f7f6f3] px-2 text-center text-sm font-bold text-oxford"
                  value={section.label.ar}
                  placeholder="عربي"
                  onChange={(event) => patch(section.id, { label: { ...section.label, ar: event.target.value } })}
                />
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1 text-[11px] text-oxford/55">
                    <input
                      type="checkbox"
                      className="accent-oxford"
                      checked={section.visible !== false}
                      onChange={(event) => patch(section.id, { visible: event.target.checked })}
                    />
                    show
                  </label>
                  <button
                    type="button"
                    className="grid size-7 place-items-center rounded-full text-red-700 hover:bg-red-50"
                    aria-label="Remove section"
                    onClick={() => removeSection(section.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <span className="font-heading text-[18px] font-bold leading-7 text-oxford transition-colors group-hover:text-[#C59B27]">
                {pick(section.label, locale)}
              </span>
            )}
          </>
        );
        if (editing) {
          return (
            <div key={section.id} className={cardClass}>
              {body}
            </div>
          );
        }
        return (
          <Link key={section.id} href={section.href} className={cardClass}>
            {body}
          </Link>
        );
      })}
      {editing ? (
        <div className="flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-oxford/20 bg-white/60 p-4 text-center">
          <Plus className="mb-2 size-6 text-oxford/40" />
          <input
            className="mb-1.5 h-8 w-full rounded-lg border border-oxford/10 bg-white px-2 text-center text-sm"
            value={draftEn}
            placeholder="English"
            onChange={(event) => setDraftEn(event.target.value)}
          />
          <input
            dir="rtl"
            className="mb-2 h-8 w-full rounded-lg border border-oxford/10 bg-white px-2 text-center text-sm"
            value={draftAr}
            placeholder="عربي"
            onChange={(event) => setDraftAr(event.target.value)}
          />
          <button
            type="button"
            className="btn-press btn-press-sm h-8 rounded-full px-3 text-xs"
            onClick={addSection}
          >
            {locale === "ar" ? "إضافة قسم" : "Add section"}
          </button>
        </div>
      ) : null}
    </div>
  );

  if (embedded) return grid;

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div className="mb-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <EditableCopy
              k="shopByOccasion"
              as="span"
              className="mb-1 block text-[11px] font-bold tracking-[0.16em] text-[#C59B27] uppercase"
            />
            <EditableCopy
              k="sectionsTitle"
              as="h2"
              className="block min-w-0 text-balance font-heading text-2xl font-bold leading-tight text-oxford sm:text-[32px]"
            />
          </div>
          <EditableCopy k="sectionsBody" as="p" className="min-w-0 max-w-md text-sm text-pretty text-muted-foreground sm:max-w-xs lg:max-w-md" />
        </div>
        {grid}
      </div>
    </div>
  );
}
