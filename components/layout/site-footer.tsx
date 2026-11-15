"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { BooLogo } from "@/components/brand/boo-logo";
import { FooterIconRow } from "@/components/layout/footer-icons";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { isLightColor } from "@/lib/color";
import { NavAnchor } from "@/components/layout/nav-anchor";
import { pick, type NavLink } from "@/lib/site";

export function SiteFooter() {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const { site } = useEdit();
  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) return null;
  if (!site.chrome.showFooter) return null;

  const links = site.chrome.navLinks.filter((link) => link.visible);
  const showNav = site.chrome.footerShowNav !== false;
  const bg = site.chrome.footerBg || "#121214";
  const fg = site.chrome.footerText || "#ffffff";

  return (
    <footer
      className="mt-8 rounded-t-[28px] sm:rounded-t-[32px]"
      style={{ background: bg, color: fg }}
    >
      <div
        className={`mx-auto grid max-w-6xl gap-6 px-5 py-10 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-8 sm:py-14 md:gap-8 md:pb-14 ${
          showNav ? "md:grid-cols-[1.2fr_0.8fr_0.8fr]" : "md:grid-cols-[1.2fr_0.8fr]"
        }`}
      >
        <div>
          <BooLogo onDark={!isLightColor(bg)} src={site.chrome.footerLogo || site.chrome.logo} />
          <p className="font-script mt-4 text-2xl opacity-80">{pick(site.chrome.footerTagline, locale)}</p>
          <p className="mt-2 max-w-sm text-sm opacity-60">{pick(site.chrome.footerBlurb, locale)}</p>
          <FooterIconRow items={site.chrome.footerIcons ?? []} locale={locale} />
        </div>
        {showNav ? (
          <FooterAccordion title={pick(site.chrome.footerShopTitle, locale) || t("shop")}>
            {links.map((link) => (
              <FooterLinkTree key={link.id} link={link} locale={locale} />
            ))}
          </FooterAccordion>
        ) : null}
        <FooterAccordion title={pick(site.chrome.footerMetaTitle, locale) || "Boo"}>
          {(site.chrome.footerMetaLines ?? []).map((line, index) => (
            <p key={`${line.en}-${index}`} className="py-1.5 text-sm text-white/70">
              {pick(line, locale)}
            </p>
          ))}
          {site.chrome.footerShowStudio !== false ? (
            <a href="/admin/login" className="mt-2 inline-block py-1.5 text-sm opacity-40 hover:opacity-100">
              {t("studio")}
            </a>
          ) : null}
        </FooterAccordion>
      </div>
    </footer>
  );
}

function FooterAccordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-black/10 md:border-0">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between text-start font-medium md:pointer-events-none md:min-h-0 md:mb-3"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={`size-4 opacity-70 transition duration-500 md:hidden ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:!grid-rows-[1fr] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden text-sm opacity-70">{children}</div>
      </div>
    </div>
  );
}

function FooterLinkTree({ link, locale }: { link: NavLink; locale: string }) {
  const children = (link.children ?? []).filter((child) => child.visible);
  const [open, setOpen] = useState(false);

  if (!children.length) {
    return (
      <NavAnchor link={link} className="flex min-h-11 items-center hover:opacity-100">
        {pick(link.label, locale)}
      </NavAnchor>
    );
  }

  return (
    <div>
      <div className="flex min-h-11 items-center gap-1">
        <NavAnchor link={link} className="flex-1 hover:opacity-100">
          {pick(link.label, locale)}
        </NavAnchor>
        <button
          type="button"
          className="grid size-9 place-items-center opacity-70"
          aria-expanded={open}
          aria-label={pick(link.label, locale)}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown className={`size-4 transition duration-300 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {children.map((child) => (
            <div key={child.id} className="ps-3">
              <FooterLinkTree link={child} locale={locale} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
