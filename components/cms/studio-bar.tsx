"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { SECTION_TYPES, loc, type NavLink } from "@/lib/site";

export function StudioNavButtons() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { isAdmin, editing, dirty, saving, startEdit, stopEdit, save, discard } = useEdit();
  if (!isAdmin || pathname.startsWith("/admin")) return null;

  return (
    <div className="pointer-events-none absolute end-2 top-1/2 z-[70] flex -translate-y-1/2 items-center gap-2">
      <div className="pointer-events-auto flex max-w-[min(100vw-1rem,42rem)] flex-wrap items-center justify-end gap-2">
        {editing ? (
          <>
            <button
              type="button"
              className="btn-press btn-press-sm"
              onClick={() => void save()}
              disabled={saving || !dirty}
            >
              {saving ? "…" : t("saveChanges")}
            </button>
            <button
              type="button"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-oxford shadow ring-1 ring-oxford/10"
              onClick={discard}
              disabled={!dirty}
            >
              {t("discardChanges")}
            </button>
            <button
              type="button"
              className="rounded-full bg-oxford px-4 py-2 text-sm font-semibold text-white"
              onClick={stopEdit}
            >
              {t("doneEdit")}
            </button>
          </>
        ) : (
          <button type="button" className="btn-press btn-press-sm" onClick={startEdit}>
            {t("editSite")}
          </button>
        )}
        <a
          href="/admin/inquiries"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-oxford shadow ring-1 ring-oxford/10"
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
  const [open, setOpen] = useState(false);
  if (!isAdmin || !editing || pathname.startsWith("/admin")) return null;

  return (
        <div className="border-b border-oxford/10 bg-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <p className="me-auto font-heading text-lg text-oxford">
                {locale === "ar" ? "تحرير هذه الصفحة" : "Editing this page"}
                {dirty ? <span className="ms-2 text-sm font-normal text-oxford/50">unsaved</span> : null}
                <span className="mt-1 block text-sm font-normal text-oxford/50">
                  {locale === "ar" ? "اضغط على أي قسم لفتح نافذة التعديل." : "Click a section to open its editor."}
                </span>
              </p>
              <button
                type="button"
                className="h-11 rounded-2xl bg-cream px-4 text-sm font-semibold text-oxford"
                onClick={() => setOpen((value) => !value)}
              >
                {open ? "Hide header / footer" : "Header, nav & footer"}
              </button>
              <select
                className="h-11 rounded-2xl border border-oxford/15 bg-cream px-3 text-sm"
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value) addSection(event.target.value as (typeof SECTION_TYPES)[number]["type"]);
                  event.target.value = "";
                }}
              >
                <option value="">{locale === "ar" ? "+ أضف قسم" : "+ Add section"}</option>
                {SECTION_TYPES.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {open ? (
              <>
            <div className="grid gap-3 rounded-[24px] bg-cream p-4 md:grid-cols-2">
              <Toggle
                label={locale === "ar" ? "شريط الإعلان العلوي" : "Top announcement"}
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
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm text-oxford/70">
                  {locale === "ar" ? "نص الإعلان · عربي" : "Announcement · Arabic"}
                </span>
                <input
                  className="h-10 w-full rounded-xl border border-oxford/15 bg-white px-3"
                  value={site.chrome.announcement.ar}
                  onChange={(event) =>
                    setChrome({ announcement: { ...site.chrome.announcement, ar: event.target.value } })
                  }
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm text-oxford/70">Announcement · English</span>
                <input
                  className="h-10 w-full rounded-xl border border-oxford/15 bg-white px-3"
                  value={site.chrome.announcement.en}
                  onChange={(event) =>
                    setChrome({ announcement: { ...site.chrome.announcement, en: event.target.value } })
                  }
                />
              </label>
            </div>

            <NavEditor links={site.chrome.navLinks} onChange={setNavLinks} />

            <div className="grid gap-3 rounded-[24px] bg-cream p-4 md:grid-cols-2">
              <label>
                <span className="mb-1 block text-sm text-oxford/70">Footer tagline · عربي</span>
                <input
                  className="h-10 w-full rounded-xl border border-oxford/15 bg-white px-3"
                  value={site.chrome.footerTagline.ar}
                  onChange={(event) =>
                    setChrome({ footerTagline: { ...site.chrome.footerTagline, ar: event.target.value } })
                  }
                />
              </label>
              <label>
                <span className="mb-1 block text-sm text-oxford/70">Footer tagline · English</span>
                <input
                  className="h-10 w-full rounded-xl border border-oxford/15 bg-white px-3"
                  value={site.chrome.footerTagline.en}
                  onChange={(event) =>
                    setChrome({ footerTagline: { ...site.chrome.footerTagline, en: event.target.value } })
                  }
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm text-oxford/70">Footer blurb · عربي</span>
                <input
                  className="h-10 w-full rounded-xl border border-oxford/15 bg-white px-3"
                  value={site.chrome.footerBlurb.ar}
                  onChange={(event) =>
                    setChrome({ footerBlurb: { ...site.chrome.footerBlurb, ar: event.target.value } })
                  }
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm text-oxford/70">Footer blurb · English</span>
                <input
                  className="h-10 w-full rounded-xl border border-oxford/15 bg-white px-3"
                  value={site.chrome.footerBlurb.en}
                  onChange={(event) =>
                    setChrome({ footerBlurb: { ...site.chrome.footerBlurb, en: event.target.value } })
                  }
                />
              </label>
            </div>
              </>
            ) : null}
          </div>
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
    <label className="flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-white px-3 text-sm">
      <span>{label}</span>
      <input type="checkbox" className="size-5" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function NavEditor({ links, onChange }: { links: NavLink[]; onChange: (links: NavLink[]) => void }) {
  function patch(index: number, next: Partial<NavLink>) {
    onChange(links.map((link, i) => (i === index ? { ...link, ...next, label: { ...link.label, ...next.label } } : link)));
  }

  return (
    <div className="rounded-[24px] bg-cream p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-heading text-oxford">Navbar links</p>
        <button
          type="button"
          className="rounded-full bg-white px-3 py-2 text-sm font-semibold ring-1 ring-oxford/10"
          onClick={() =>
            onChange([
              ...links,
              {
                id: `link-${Math.random().toString(36).slice(2, 7)}`,
                href: "/catalog",
                label: loc("رابط جديد", "New link"),
                visible: true,
              },
            ])
          }
        >
          + Add link
        </button>
      </div>
      <div className="grid gap-3">
        {links.map((link, index) => (
          <div key={link.id} className="grid gap-2 rounded-2xl bg-white p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <input
              className="h-10 rounded-xl border border-oxford/15 px-3 text-sm"
              value={link.label.ar}
              placeholder="Label عربي"
              onChange={(event) => patch(index, { label: { ...link.label, ar: event.target.value } })}
            />
            <input
              className="h-10 rounded-xl border border-oxford/15 px-3 text-sm"
              value={link.label.en}
              placeholder="Label English"
              onChange={(event) => patch(index, { label: { ...link.label, en: event.target.value } })}
            />
            <input
              className="h-10 rounded-xl border border-oxford/15 px-3 text-sm"
              value={link.href}
              placeholder="/path"
              onChange={(event) => patch(index, { href: event.target.value })}
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={link.visible}
                  onChange={(event) => patch(index, { visible: event.target.checked })}
                />
                show
              </label>
              <button
                type="button"
                className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
                onClick={() => onChange(links.filter((item) => item.id !== link.id))}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
