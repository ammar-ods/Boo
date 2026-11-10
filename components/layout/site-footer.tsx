"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BooLogo } from "@/components/brand/boo-logo";
import { FooterIconRow } from "@/components/layout/footer-icons";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/site";

export function SiteFooter() {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const { site } = useEdit();
  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) return null;
  if (!site.chrome.showFooter) return null;

  const links = site.chrome.navLinks.filter((link) => link.visible);

  return (
    <footer className="mt-8 rounded-t-[28px] bg-[#121214] text-white sm:rounded-t-[32px]">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <BooLogo onDark src={site.chrome.footerLogo || site.chrome.logo} />
          <p className="font-script mt-4 text-2xl text-white/80">{pick(site.chrome.footerTagline, locale)}</p>
          <p className="mt-2 max-w-sm text-sm text-white/60">{pick(site.chrome.footerBlurb, locale)}</p>
          <FooterIconRow items={site.chrome.footerIcons ?? []} locale={locale} />
        </div>
        <div className="text-sm text-white/70">
          <p className="mb-3 font-medium text-white">{pick(site.chrome.footerShopTitle, locale) || t("shop")}</p>
          {links.flatMap((link) => [
            <Link key={link.id} href={link.href} className="flex min-h-11 items-center hover:text-white">
              {pick(link.label, locale)}
            </Link>,
            ...(link.children ?? [])
              .filter((child) => child.visible)
              .map((child) => (
                <Link
                  key={child.id}
                  href={child.href}
                  className="flex min-h-10 items-center ps-3 text-white/55 hover:text-white"
                >
                  {pick(child.label, locale)}
                </Link>
              )),
          ])}
        </div>
        <div className="text-sm text-white/70">
          <p className="mb-3 font-medium text-white">{pick(site.chrome.footerMetaTitle, locale) || "Boo"}</p>
          {(site.chrome.footerMetaLines ?? []).map((line, index) => (
            <p key={`${line.en}-${index}`}>{pick(line, locale)}</p>
          ))}
          {site.chrome.footerShowStudio !== false ? (
            <a href="/admin/login" className="mt-4 inline-block text-white/40 hover:text-white">
              {t("studio")}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
