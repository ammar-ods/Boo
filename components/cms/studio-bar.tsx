"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Settings2 } from "lucide-react";
import { SectionTypeMenu } from "@/components/cms/section-type-menu";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { FOOTER_ICON_OPTIONS } from "@/components/layout/footer-icons";
import { cmsPagePath, loc, type CatalogSection, type FooterIcon, type NavLink, type SectionType } from "@/lib/site";

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
  const { isAdmin, editing, dirty, site, setChrome, setNavLinks, addSection, pageKey } = useEdit();
  const [addOpen, setAddOpen] = useState(false);
  const [chromeTab, setChromeTab] = useState<null | "display" | "nav" | "pages" | "shop" | "footer">(null);
  const canEditSections = pageKey !== null;
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
          <span className="ms-2 hidden text-oxford/45 sm:inline">
            {canEditSections ? "Click a section to edit it." : "Open a page to add sections, or create a new page."}
          </span>
        </p>
        {canEditSections ? (
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
        ) : null}
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
                  ["pages", locale === "ar" ? "صفحات" : "Pages"],
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
                  <p className="mb-1 mt-4 text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">
                    Logo
                  </p>
                  <ChromeImageField
                    label="Header logo"
                    value={site.chrome.logo}
                    onChange={(logo) => setChrome({ logo, footerLogo: site.chrome.footerLogo || logo })}
                  />
                </div>
              </div>
            ) : null}

            {chromeTab === "pages" ? <PagesEditor /> : null}

            {chromeTab === "nav" ? <NavEditor links={site.chrome.navLinks} onChange={setNavLinks} /> : null}

            {chromeTab === "shop" ? (
              <CatalogSectionsEditor
                sections={site.chrome.catalogSections ?? []}
                onChange={(catalogSections) => setChrome({ catalogSections })}
              />
            ) : null}

            {chromeTab === "footer" ? <FooterEditor /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PagesEditor() {
  const { locale } = useI18n();
  const { site, pageKey, addPage, updatePage, removePage } = useEdit();
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [slug, setSlug] = useState("");
  const [addToNav, setAddToNav] = useState(true);

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_1.2fr]">
      <div className="rounded-2xl bg-white p-3">
        <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">
          New page
        </p>
        <label className="mb-2 block text-xs text-oxford/60">
          <span className="mb-1 block">Title · English</span>
          <input
            className="h-9 w-full rounded-xl border border-oxford/12 px-3 text-sm"
            value={titleEn}
            onChange={(event) => setTitleEn(event.target.value)}
            placeholder="About"
          />
        </label>
        <label className="mb-2 block text-xs text-oxford/60">
          <span className="mb-1 block">Title · عربي</span>
          <input
            className="h-9 w-full rounded-xl border border-oxford/12 px-3 text-sm"
            dir="rtl"
            value={titleAr}
            onChange={(event) => setTitleAr(event.target.value)}
            placeholder="عنّا"
          />
        </label>
        <label className="mb-2 block text-xs text-oxford/60">
          <span className="mb-1 block">URL /p/…</span>
          <input
            className="h-9 w-full rounded-xl border border-oxford/12 px-3 text-sm"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="about"
          />
        </label>
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-oxford" checked={addToNav} onChange={(event) => setAddToNav(event.target.checked)} />
          Add to navbar
        </label>
        <button
          type="button"
          className="h-9 w-full rounded-full bg-oxford text-sm font-semibold text-white"
          onClick={() => {
            const created = addPage({ titleEn, titleAr, slug, addToNav });
            if (created) {
              setTitleEn("");
              setTitleAr("");
              setSlug("");
            }
          }}
        >
          Create page
        </button>
      </div>
      <div className="rounded-2xl bg-white p-3">
        <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">
          Pages
        </p>
        <Link
          href="/"
          className={`mb-2 flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
            pageKey === "home" ? "bg-oxford text-white" : "bg-cream text-oxford"
          }`}
        >
          {locale === "ar" ? "الرئيسية" : "Home"}
          <span className="text-[11px] opacity-70">/</span>
        </Link>
        {site.pages.map((page) => (
          <div key={page.id} className="mb-2 rounded-xl bg-cream/80 p-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <Link
                href={cmsPagePath(page.slug)}
                className={`text-sm font-medium ${pageKey === page.slug ? "text-oxford underline" : "text-oxford"}`}
              >
                {locale === "ar" ? page.title.ar || page.title.en : page.title.en || page.title.ar}
              </Link>
              <button type="button" className="text-xs text-red-700" onClick={() => removePage(page.id)}>
                Delete
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className="h-8 rounded-lg border border-oxford/12 bg-white px-2 text-xs"
                value={page.title.en}
                onChange={(event) => updatePage(page.id, { title: { ...page.title, en: event.target.value } })}
              />
              <input
                className="h-8 rounded-lg border border-oxford/12 bg-white px-2 text-xs"
                dir="rtl"
                value={page.title.ar}
                onChange={(event) => updatePage(page.id, { title: { ...page.title, ar: event.target.value } })}
              />
              <input
                className="h-8 rounded-lg border border-oxford/12 bg-white px-2 text-xs"
                value={page.slug}
                onChange={(event) => updatePage(page.id, { slug: event.target.value })}
              />
            </div>
          </div>
        ))}
        {site.pages.length === 0 ? (
          <p className="text-xs text-muted-foreground">No extra pages yet. Create one, then add sections on it.</p>
        ) : null}
      </div>
    </div>
  );
}

async function uploadChromeFile(file: File) {
  const data = new FormData();
  data.set("file", file);
  const response = await fetch("/api/site/upload", { method: "POST", body: data });
  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) {
    toast.error(payload.error || "Could not upload image");
    return "";
  }
  return payload.url;
}

function ChromeImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
}) {
  return (
    <label className="mt-2 block text-xs text-oxford/60">
      <span className="mb-1 block">{label}</span>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mb-2 max-h-16 w-auto rounded-lg bg-cream object-contain" />
      ) : null}
      <input
        type="file"
        accept="image/*"
        className="block w-full text-xs"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const url = await uploadChromeFile(file);
          if (url) onChange(url);
        }}
      />
    </label>
  );
}

function FooterEditor() {
  const { site, setChrome } = useEdit();
  const icons = site.chrome.footerIcons ?? [];
  const lines = site.chrome.footerMetaLines ?? [];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-3 rounded-2xl bg-white p-3">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">Brand</p>
        <ChromeImageField
          label="Footer logo"
          value={site.chrome.footerLogo || site.chrome.logo}
          onChange={(footerLogo) => setChrome({ footerLogo })}
        />
        <BilingualInputs
          label="Tagline"
          ar={site.chrome.footerTagline.ar}
          en={site.chrome.footerTagline.en}
          onAr={(ar) => setChrome({ footerTagline: { ...site.chrome.footerTagline, ar } })}
          onEn={(en) => setChrome({ footerTagline: { ...site.chrome.footerTagline, en } })}
        />
        <BilingualInputs
          label="Blurb"
          ar={site.chrome.footerBlurb.ar}
          en={site.chrome.footerBlurb.en}
          onAr={(ar) => setChrome({ footerBlurb: { ...site.chrome.footerBlurb, ar } })}
          onEn={(en) => setChrome({ footerBlurb: { ...site.chrome.footerBlurb, en } })}
        />
      </div>
      <div className="space-y-3 rounded-2xl bg-white p-3">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">Columns</p>
        <BilingualInputs
          label="Shop column title"
          ar={site.chrome.footerShopTitle.ar}
          en={site.chrome.footerShopTitle.en}
          onAr={(ar) => setChrome({ footerShopTitle: { ...site.chrome.footerShopTitle, ar } })}
          onEn={(en) => setChrome({ footerShopTitle: { ...site.chrome.footerShopTitle, en } })}
        />
        <BilingualInputs
          label="Right column title"
          ar={site.chrome.footerMetaTitle.ar}
          en={site.chrome.footerMetaTitle.en}
          onAr={(ar) => setChrome({ footerMetaTitle: { ...site.chrome.footerMetaTitle, ar } })}
          onEn={(en) => setChrome({ footerMetaTitle: { ...site.chrome.footerMetaTitle, en } })}
        />
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs text-oxford/60">Right column lines</p>
            <button
              type="button"
              className="text-xs font-semibold text-oxford"
              onClick={() => setChrome({ footerMetaLines: [...lines, loc("", "")] })}
            >
              + Line
            </button>
          </div>
          {lines.map((line, index) => (
            <div key={index} className="mb-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                className="h-8 rounded-lg border border-oxford/12 px-2 text-xs"
                dir="rtl"
                value={line.ar}
                onChange={(event) =>
                  setChrome({
                    footerMetaLines: lines.map((item, i) => (i === index ? { ...item, ar: event.target.value } : item)),
                  })
                }
              />
              <input
                className="h-8 rounded-lg border border-oxford/12 px-2 text-xs"
                value={line.en}
                onChange={(event) =>
                  setChrome({
                    footerMetaLines: lines.map((item, i) => (i === index ? { ...item, en: event.target.value } : item)),
                  })
                }
              />
              <button
                type="button"
                className="text-xs text-red-700"
                onClick={() => setChrome({ footerMetaLines: lines.filter((_, i) => i !== index) })}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-oxford"
            checked={site.chrome.footerShowStudio !== false}
            onChange={(event) => setChrome({ footerShowStudio: event.target.checked })}
          />
          Studio login link
        </label>
      </div>
      <div className="rounded-2xl bg-white p-3 md:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">
            Icon row
          </p>
          <button
            type="button"
            className="h-8 rounded-full bg-cream px-3 text-sm font-semibold text-oxford"
            onClick={() =>
              setChrome({
                footerIcons: [
                  ...icons,
                  {
                    id: `icon-${Math.random().toString(36).slice(2, 7)}`,
                    icon: "instagram",
                    href: "",
                    label: loc("", ""),
                  } satisfies FooterIcon,
                ],
              })
            }
          >
            + Icon
          </button>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          A row under the blurb. Each item can have an icon, optional text, and a link.
        </p>
        {icons.map((item, index) => (
          <div key={item.id} className="mb-2 grid gap-2 rounded-xl bg-cream/70 p-2 sm:grid-cols-[9rem_1fr_1fr_1fr_auto]">
            <select
              className="h-8 rounded-lg border border-oxford/12 bg-white px-2 text-xs"
              value={item.icon}
              onChange={(event) =>
                setChrome({
                  footerIcons: icons.map((row, i) => (i === index ? { ...row, icon: event.target.value } : row)),
                })
              }
            >
              {FOOTER_ICON_OPTIONS.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <input
              className="h-8 rounded-lg border border-oxford/12 bg-white px-2 text-xs"
              placeholder="عربي"
              dir="rtl"
              value={item.label.ar}
              onChange={(event) =>
                setChrome({
                  footerIcons: icons.map((row, i) =>
                    i === index ? { ...row, label: { ...row.label, ar: event.target.value } } : row,
                  ),
                })
              }
            />
            <input
              className="h-8 rounded-lg border border-oxford/12 bg-white px-2 text-xs"
              placeholder="English"
              value={item.label.en}
              onChange={(event) =>
                setChrome({
                  footerIcons: icons.map((row, i) =>
                    i === index ? { ...row, label: { ...row.label, en: event.target.value } } : row,
                  ),
                })
              }
            />
            <input
              className="h-8 rounded-lg border border-oxford/12 bg-white px-2 text-xs"
              placeholder="https://…"
              value={item.href}
              onChange={(event) =>
                setChrome({
                  footerIcons: icons.map((row, i) => (i === index ? { ...row, href: event.target.value } : row)),
                })
              }
            />
            <button
              type="button"
              className="text-xs text-red-700"
              onClick={() => setChrome({ footerIcons: icons.filter((row) => row.id !== item.id) })}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BilingualInputs({
  label,
  ar,
  en,
  onAr,
  onEn,
}: {
  label: string;
  ar: string;
  en: string;
  onAr: (value: string) => void;
  onEn: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-oxford/60">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className="h-9 rounded-xl border border-oxford/12 px-3 text-sm"
          dir="rtl"
          placeholder="عربي"
          value={ar}
          onChange={(event) => onAr(event.target.value)}
        />
        <input
          className="h-9 rounded-xl border border-oxford/12 px-3 text-sm"
          placeholder="English"
          value={en}
          onChange={(event) => onEn(event.target.value)}
        />
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
