"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useShopNavItems } from "@/components/shop/shop-sidebar";
import { upsertNavCategory } from "@/lib/categories";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { loc, pageSlugify, type CatalogSection } from "@/lib/site";
import { cn } from "@/lib/utils";

export function ShopFilterBar({
  collection,
  query,
}: {
  collection?: string;
  query?: string;
}) {
  const { locale } = useI18n();
  const { editing, site, setChrome } = useEdit();
  const items = useShopNavItems();
  const [draftEn, setDraftEn] = useState("");
  const [draftAr, setDraftAr] = useState("");

  function patchSection(id: string, next: Partial<CatalogSection>) {
    const catalogSections = (site.chrome.catalogSections ?? []).map((section) =>
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
    if ((site.chrome.catalogSections ?? []).some((section) => section.id === id)) {
      id = `${id}-${Math.random().toString(36).slice(2, 4)}`;
    }
    const section: CatalogSection = {
      id,
      href: `/catalog?collection=${id}`,
      image: "",
      label: loc(ar, en),
      visible: true,
    };
    setChrome({
      catalogSections: [...(site.chrome.catalogSections ?? []), section],
      navLinks: upsertNavCategory(site.chrome.navLinks, section),
    });
    setDraftEn("");
    setDraftAr("");
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2.5">
          <label className="flex min-w-[8rem] flex-col gap-1 rounded-2xl bg-[#f0e092] px-3 py-2 text-[11px] font-semibold text-[#6e6322]">
            {locale === "ar" ? "الكل" : "All"}
            <input
              className="h-8 rounded-lg border-0 bg-white px-2 text-sm text-oxford"
              value={site.chrome.shopAllLabel?.en ?? "All"}
              onChange={(event) =>
                setChrome({
                  shopAllLabel: {
                    ar: site.chrome.shopAllLabel?.ar || "الكل",
                    en: event.target.value,
                  },
                })
              }
              placeholder="All"
            />
            <input
              dir="rtl"
              className="h-8 rounded-lg border-0 bg-white px-2 text-sm text-oxford"
              value={site.chrome.shopAllLabel?.ar ?? "الكل"}
              onChange={(event) =>
                setChrome({
                  shopAllLabel: {
                    ar: event.target.value,
                    en: site.chrome.shopAllLabel?.en || "All",
                  },
                })
              }
              placeholder="الكل"
            />
          </label>
          {(site.chrome.catalogSections ?? []).map((section) => (
            <div
              key={section.id}
              className={`flex min-w-[9rem] flex-col gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold ${
                section.visible === false ? "bg-white/70 text-oxford/40" : "bg-white text-oxford shadow-sm"
              }`}
            >
              <input
                className="h-8 rounded-lg border border-oxford/10 bg-white px-2 text-sm text-oxford"
                value={section.label.en}
                onChange={(event) =>
                  patchSection(section.id, { label: { ...section.label, en: event.target.value } })
                }
                placeholder="English"
              />
              <input
                dir="rtl"
                className="h-8 rounded-lg border border-oxford/10 bg-white px-2 text-sm text-oxford"
                value={section.label.ar}
                onChange={(event) =>
                  patchSection(section.id, { label: { ...section.label, ar: event.target.value } })
                }
                placeholder="عربي"
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="flex items-center gap-1 text-[11px] font-medium text-oxford/60">
                  <input
                    type="checkbox"
                    className="accent-oxford"
                    checked={section.visible !== false}
                    onChange={(event) => patchSection(section.id, { visible: event.target.checked })}
                  />
                  show
                </label>
                <button
                  type="button"
                  className="text-red-700"
                  aria-label="Remove filter"
                  onClick={() =>
                    setChrome({
                      catalogSections: (site.chrome.catalogSections ?? []).filter((item) => item.id !== section.id),
                    })
                  }
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2 rounded-2xl bg-white p-3 shadow-sm">
          <label className="text-xs text-oxford/60">
            English
            <input
              className="mt-1 h-9 w-40 rounded-xl border border-oxford/12 px-3 text-sm"
              value={draftEn}
              onChange={(event) => setDraftEn(event.target.value)}
              placeholder="Apparel"
            />
          </label>
          <label className="text-xs text-oxford/60">
            عربي
            <input
              dir="rtl"
              className="mt-1 h-9 w-40 rounded-xl border border-oxford/12 px-3 text-sm"
              value={draftAr}
              onChange={(event) => setDraftAr(event.target.value)}
              placeholder="ملابس"
            />
          </label>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-oxford px-4 text-sm font-semibold text-white"
            onClick={addSection}
          >
            <Plus className="size-4" />
            {locale === "ar" ? "خيار جديد" : "Add option"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1">
      {items.map((item) => {
        const active =
          (item.id === "all" && !collection && !query) || (collection != null && item.id === collection);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-5 py-2.5 text-[12px] font-semibold tracking-[0.08em] uppercase transition",
              active ? "bg-[#f0e092] text-[#6e6322] shadow-sm" : "bg-white text-oxford/55 shadow-sm hover:text-oxford",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
