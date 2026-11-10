"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, Settings2 } from "lucide-react";
import { SectionTypeMenu } from "@/components/cms/section-type-menu";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { loc, type CatalogSection, type NavLink, type SectionType } from "@/lib/site";

export function StudioNavButtons() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { isAdmin, editing, dirty, saving, startEdit, stopEdit, save, discard } = useEdit();
  if (!isAdmin || pathname.startsWith("/admin")) return null;

  return (
    <div className="pointer-events-none relative z-[70] flex justify-end px-3 py-2 md:absolute md:end-2 md:top-1/2 md:-translate-y-1/2 md:px-0 md:py-0">
      <div className="pointer-events-auto flex max-w-[min(100vw-1.5rem,42rem)] flex-wrap items-center justify-end gap-2">
        {editing ? (
          <>
            <button
              type="button"
              className="h-9 rounded-full bg-oxford px-3.5 text-sm font-semibold text-white disabled:opacity-40"
              onClick={() => void save()}
              disabled={saving || !dirty}
            >
              {saving ? "…" : t("saveChanges")}
            </button>
            <button
              type="button"
              className="h-9 rounded-full bg-white px-3.5 text-sm font-semibold text-oxford ring-1 ring-oxford/10 disabled:opacity-40"
              onClick={discard}
              disabled={!dirty}
            >
              {t("discardChanges")}
            </button>
            <button
              type="button"
              className="h-9 rounded-full bg-cream px-3.5 text-sm font-semibold text-oxford"
              onClick={stopEdit}
            >
              {t("doneEdit")}
            </button>
          </>
        ) : (
          <button type="button" className="h-9 rounded-full bg-oxford px-4 text-sm font-semibold text-white" onClick={startEdit}>
            {t("editSite")}
          </button>
        )}
        <a
          href="/admin/inquiries"
          className="h-9 rounded-full bg-white px-3.5 text-sm font-semibold leading-9 text-oxford ring-1 ring-oxford/10"
        >
          {t("studio")}
        </a>
      </div>
    </div>
  );
}

export function StudioChromePanel() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const { isAdmin, editing, dirty, site, setChrome, setNavLinks, addSection } = useEdit();
  const [addOpen, setAddOpen] = useState(false);
  const [chromeTab, setChromeTab] = useState<null | "display" | "nav" | "shop" | "footer">(null);
  if (!isAdmin || !editing || pathname.startsWith("/admin")) return null;

  function pickType(type: SectionType) {
    addSection(type);
    setAddOpen(false);
  }

  return (
    <div className="border-b border-oxford/10 bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-5 py-2.5 sm:px-8">
        <p className="me-auto min-w-0 text-sm text-oxford">
          <span className="font-heading text-base">Editing</span>
          {dirty ? <span className="ms-2 rounded-full bg-oxford/8 px-2 py-0.5 text-[11px]">unsaved</span> : null}
          <span className="ms-2 hidden text-oxford/45 sm:inline">Click a section to edit it.</span>
        </p>
        <div className="relative">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-oxford px-3.5 text-sm font-semibold text-white"
            onClick={() => {
              setAddOpen((value) => !value);
              setChromeTab(null);
            }}
          >
            <Plus className="size-4" />
            {locale === "ar" ? "قسم" : "Add section"}
          </button>
          {addOpen ? (
            <div className="absolute end-0 top-11 z-40">
              <SectionTypeMenu onPick={pickType} />
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold ${
            chromeTab ? "bg-oxford text-white" : "bg-cream text-oxford"
          }`}
          onClick={() => {
            setChromeTab((value) => (value ? null : "display"));
            setAddOpen(false);
          }}
        >
          <Settings2 className="size-4" />
          Page
        </button>
      </div>

      {chromeTab ? (
        <div className="border-t border-oxford/8 bg-cream/50">
          <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
            <div className="mb-3 flex gap-1 rounded-full bg-white p-1 ring-1 ring-oxford/8">
              {(
                [
                  ["display", locale === "ar" ? "عرض" : "Display"],
                  ["nav", locale === "ar" ? "قائمة" : "Nav"],
                  ["shop", locale === "ar" ? "المتجر" : "Shop"],
                  ["footer", locale === "ar" ? "فوتر" : "Footer"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`h-8 flex-1 rounded-full text-sm font-medium ${
                    chromeTab === id ? "bg-oxford text-white" : "text-oxford/60"
                  }`}
                  onClick={() => setChromeTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {chromeTab === "display" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-3">
                  <Toggle
                    label={locale === "ar" ? "شريط الإعلان" : "Announcement bar"}
                    checked={site.chrome.showAnnouncement}
                    onChange={(showAnnouncement) => setChrome({ showAnnouncement })}
                  />
                  <Toggle
                    label={locale === "ar" ? "الهيدر" : "Header"}
                    checked={site.chrome.showHeader}
                    onChange={(showHeader) => setChrome({ showHeader })}
                  />
                  <Toggle
                    label={locale === "ar" ? "قائمة التنقل" : "Navigation"}
                    checked={site.chrome.showNav}
                    onChange={(showNav) => setChrome({ showNav })}
                  />
                  <Toggle
                    label={locale === "ar" ? "الفوتر" : "Footer"}
                    checked={site.chrome.showFooter}
                    onChange={(showFooter) => setChrome({ showFooter })}
                  />
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">
                    Announcement copy
                  </p>
                  <input
                    className="mb-2 h-9 w-full rounded-xl border border-oxford/12 px-3 text-sm"
                    dir="rtl"
                    placeholder="عربي"
                    value={site.chrome.announcement.ar}
                    onChange={(event) =>
                      setChrome({ announcement: { ...site.chrome.announcement, ar: event.target.value } })
                    }
                  />
                  <input
                    className="h-9 w-full rounded-xl border border-oxford/12 px-3 text-sm"
                    placeholder="English"
                    value={site.chrome.announcement.en}
                    onChange={(event) =>
                      setChrome({ announcement: { ...site.chrome.announcement, en: event.target.value } })
                    }
                  />
                  <p className="mb-1 mt-4 text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">
                    WhatsApp
                  </p>
                  <input
                    className="h-9 w-full rounded-xl border border-oxford/12 px-3 text-sm"
                    placeholder="01000000000"
                    value={site.chrome.whatsappPhone}
                    onChange={(event) => setChrome({ whatsappPhone: event.target.value })}
                  />
                </div>
              </div>
            ) : null}

            {chromeTab === "nav" ? <NavEditor links={site.chrome.navLinks} onChange={setNavLinks} /> : null}

            {chromeTab === "shop" ? (
              <CatalogSectionsEditor
                sections={site.chrome.catalogSections ?? []}
                onChange={(catalogSections) => setChrome({ catalogSections })}
              />
            ) : null}

            {chromeTab === "footer" ? (
              <div className="grid gap-2 rounded-2xl bg-white p-3 md:grid-cols-2">
                <label className="text-xs text-oxford/60">
                  <span className="mb-1 block">Tagline · عربي</span>
                  <input
                    className="h-9 w-full rounded-xl border border-oxford/12 px-3 text-sm"
                    dir="rtl"
                    value={site.chrome.footerTagline.ar}
                    onChange={(event) =>
                      setChrome({ footerTagline: { ...site.chrome.footerTagline, ar: event.target.value } })
                    }
                  />
                </label>
                <label className="text-xs text-oxford/60">
                  <span className="mb-1 block">Tagline · English</span>
                  <input
                    className="h-9 w-full rounded-xl border border-oxford/12 px-3 text-sm"
                    value={site.chrome.footerTagline.en}
                    onChange={(event) =>
                      setChrome({ footerTagline: { ...site.chrome.footerTagline, en: event.target.value } })
                    }
                  />
                </label>
                <label className="text-xs text-oxford/60 md:col-span-2">
                  <span className="mb-1 block">Blurb · عربي</span>
                  <input
                    className="h-9 w-full rounded-xl border border-oxford/12 px-3 text-sm"
                    dir="rtl"
                    value={site.chrome.footerBlurb.ar}
                    onChange={(event) =>
                      setChrome({ footerBlurb: { ...site.chrome.footerBlurb, ar: event.target.value } })
                    }
                  />
                </label>
                <label className="text-xs text-oxford/60 md:col-span-2">
                  <span className="mb-1 block">Blurb · English</span>
                  <input
                    className="h-9 w-full rounded-xl border border-oxford/12 px-3 text-sm"
                    value={site.chrome.footerBlurb.en}
                    onChange={(event) =>
                      setChrome({ footerBlurb: { ...site.chrome.footerBlurb, en: event.target.value } })
                    }
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex h-10 items-center justify-between gap-3 border-b border-oxford/6 text-sm last:border-0">
      <span>{label}</span>
      <input type="checkbox" className="size-4 accent-oxford" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function emptyLink(labelAr = "رابط جديد", labelEn = "New link"): NavLink {
  return {
    id: `link-${Math.random().toString(36).slice(2, 7)}`,
    href: "/catalog",
    label: loc(labelAr, labelEn),
    visible: true,
  };
}

function NavEditor({ links, onChange }: { links: NavLink[]; onChange: (links: NavLink[]) => void }) {
  function patch(index: number, next: Partial<NavLink>) {
    onChange(
      links.map((link, i) =>
        i === index
          ? { ...link, ...next, label: { ...link.label, ...next.label }, children: next.children ?? link.children }
          : link,
      ),
    );
  }

  return (
    <div className="rounded-2xl bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">Navbar links</p>
        <button
          type="button"
          className="h-8 rounded-full bg-cream px-3 text-sm font-semibold text-oxford"
          onClick={() => onChange([...links, emptyLink()])}
        >
          + Link
        </button>
      </div>
      <div className="grid gap-3">
        {links.map((link, index) => (
          <div key={link.id} className="rounded-xl bg-cream/70 p-2">
            <NavLinkFields
              link={link}
              onPatch={(next) => patch(index, next)}
              onDelete={() => onChange(links.filter((item) => item.id !== link.id))}
            />
            <div className="mt-2 border-t border-oxford/8 pt-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-oxford/45">Dropdown</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-oxford"
                  onClick={() =>
                    patch(index, { children: [...(link.children ?? []), emptyLink("قسم", "Subsection")] })
                  }
                >
                  + Subsection
                </button>
              </div>
              {(link.children ?? []).map((child, childIndex) => (
                <div key={child.id} className="mb-2 rounded-lg bg-white p-2">
                  <NavLinkFields
                    link={child}
                    onPatch={(next) => {
                      const children = [...(link.children ?? [])];
                      children[childIndex] = {
                        ...child,
                        ...next,
                        label: { ...child.label, ...next.label },
                      };
                      patch(index, { children });
                    }}
                    onDelete={() =>
                      patch(index, {
                        children: (link.children ?? []).filter((item) => item.id !== child.id),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavLinkFields({
  link,
  onPatch,
  onDelete,
}: {
  link: NavLink;
  onPatch: (next: Partial<NavLink>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
      <input
        className="h-9 rounded-xl border border-oxford/12 bg-white px-2.5 text-sm"
        value={link.label.ar}
        placeholder="عربي"
        dir="rtl"
        onChange={(event) => onPatch({ label: { ...link.label, ar: event.target.value } })}
      />
      <input
        className="h-9 rounded-xl border border-oxford/12 bg-white px-2.5 text-sm"
        value={link.label.en}
        placeholder="English"
        onChange={(event) => onPatch({ label: { ...link.label, en: event.target.value } })}
      />
      <input
        className="h-9 rounded-xl border border-oxford/12 bg-white px-2.5 text-sm"
        value={link.href}
        placeholder="/path"
        onChange={(event) => onPatch({ href: event.target.value })}
      />
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            className="accent-oxford"
            checked={link.visible}
            onChange={(event) => onPatch({ visible: event.target.checked })}
          />
          show
        </label>
        <button type="button" className="rounded-lg px-2 py-1 text-xs text-red-700" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

function CatalogSectionsEditor({
  sections,
  onChange,
}: {
  sections: CatalogSection[];
  onChange: (sections: CatalogSection[]) => void;
}) {
  function patch(index: number, next: Partial<CatalogSection>) {
    onChange(sections.map((section, i) => (i === index ? { ...section, ...next } : section)));
  }

  return (
    <div className="rounded-2xl bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">
          Shop sections
        </p>
        <button
          type="button"
          className="h-8 rounded-full bg-cream px-3 text-sm font-semibold text-oxford"
          onClick={() =>
            onChange([
              ...sections,
              {
                id: `section-${Math.random().toString(36).slice(2, 7)}`,
                href: "/catalog",
                image: "/products/white-tee-front.jpg",
                label: loc("قسم جديد", "New section"),
              },
            ])
          }
        >
          + Section
        </button>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        These images appear on the shop page. Clicking one opens that section’s products.
      </p>
      <div className="grid gap-3">
        {sections.map((section, index) => (
          <div key={section.id} className="grid gap-2 rounded-xl bg-cream/70 p-2 md:grid-cols-[96px_1fr_auto]">
            <label className="block overflow-hidden rounded-xl bg-white">
              {section.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={section.image} alt="" className="h-24 w-full object-cover" />
              ) : (
                <span className="grid h-24 place-items-center text-xs">Upload</span>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const data = new FormData();
                  data.set("file", file);
                  const response = await fetch("/api/site/upload", { method: "POST", body: data });
                  const payload = (await response.json()) as { url?: string };
                  if (payload.url) patch(index, { image: payload.url });
                }}
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="h-9 rounded-xl border border-oxford/12 bg-white px-2.5 text-sm"
                value={section.label.ar}
                dir="rtl"
                placeholder="عربي"
                onChange={(event) => patch(index, { label: { ...section.label, ar: event.target.value } })}
              />
              <input
                className="h-9 rounded-xl border border-oxford/12 bg-white px-2.5 text-sm"
                value={section.label.en}
                placeholder="English"
                onChange={(event) => patch(index, { label: { ...section.label, en: event.target.value } })}
              />
              <input
                className="h-9 rounded-xl border border-oxford/12 bg-white px-2.5 text-sm sm:col-span-2"
                value={section.href}
                placeholder="/catalog?collection=apparel"
                onChange={(event) => patch(index, { href: event.target.value })}
              />
            </div>
            <button
              type="button"
              className="self-start text-xs text-red-700"
              onClick={() => onChange(sections.filter((item) => item.id !== section.id))}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
