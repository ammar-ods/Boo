"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { BooLogo } from "@/components/brand/boo-logo";
import { FooterIconRow } from "@/components/layout/footer-icons";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick, type NavLink } from "@/lib/site";

export function SiteFooter() {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const { site } = useEdit();
  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) return null;
  if (!site.chrome.showFooter) return null;

  const links = site.chrome.navLinks.filter((link) => link.visible);

  return (
    <footer className="mt-8 rounded-t-[28px] bg-[#121214] text-white sm:rounded-t-[32px]">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-8 sm:py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:gap-8">
        <div>
          <BooLogo onDark src={site.chrome.footerLogo || site.chrome.logo} />
          <p className="font-script mt-4 text-2xl text-white/80">{pick(site.chrome.footerTagline, locale)}</p>
          <p className="mt-2 max-w-sm text-sm text-white/60">{pick(site.chrome.footerBlurb, locale)}</p>
          <FooterIconRow items={site.chrome.footerIcons ?? []} locale={locale} />
        </div>
        <FooterAccordion title={pick(site.chrome.footerShopTitle, locale) || t("shop")}>
          {links.map((link) => (
            <FooterLinkTree key={link.id} link={link} locale={locale} />
          ))}
        </FooterAccordion>
        <FooterAccordion title={pick(site.chrome.footerMetaTitle, locale) || "Boo"}>
          {(site.chrome.footerMetaLines ?? []).map((line, index) => (
            <p key={`${line.en}-${index}`} className="py-1.5 text-sm text-white/70">
              {pick(line, locale)}
            </p>
          ))}
          {site.chrome.footerShowStudio !== false ? (
            <a href="/admin/login" className="mt-2 inline-block py-1.5 text-sm text-white/40 hover:text-white">
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
    <div className="border-t border-white/10 md:border-0">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between text-start font-medium text-white md:pointer-events-none md:min-h-0 md:mb-3"
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
        <div className="overflow-hidden text-sm text-white/70">{children}</div>
      </div>
    </div>
  );
}

function FooterLinkTree({ link, locale }: { link: NavLink; locale: string }) {
  const children = (link.children ?? []).filter((child) => child.visible);
  const [open, setOpen] = useState(false);

  if (!children.length) {
    return (
      <Link href={link.href} className="flex min-h-11 items-center hover:text-white">
        {pick(link.label, locale)}
      </Link>
    );
  }

  return (
    <div>
      <div className="flex min-h-11 items-center gap-1">
        <Link href={link.href} className="flex-1 hover:text-white">
          {pick(link.label, locale)}
        </Link>
        <button
          type="button"
          className="grid size-9 place-items-center text-white/70"
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
            <Link
              key={child.id}
              href={child.href}
              className="flex min-h-10 items-center ps-3 text-white/55 hover:text-white"
            >
              {pick(child.label, locale)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
