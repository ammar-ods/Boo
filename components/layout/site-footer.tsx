"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BooLogo } from "@/components/brand/boo-logo";
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
    <footer className="mt-8 rounded-t-[32px] bg-[#121214] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <BooLogo onDark />
          <p className="font-script mt-4 text-2xl text-white/80">{pick(site.chrome.footerTagline, locale)}</p>
          <p className="mt-2 max-w-sm text-sm text-white/60">{pick(site.chrome.footerBlurb, locale)}</p>
        </div>
        <div className="text-sm text-white/70">
          <p className="mb-3 font-medium text-white">{t("shop")}</p>
          {links.map((link) => (
            <Link key={link.id} href={link.href} className="block py-1 hover:text-white">
              {pick(link.label, locale)}
            </Link>
          ))}
        </div>
        <div className="text-sm text-white/70">
          <p className="mb-3 font-medium text-white">Boo</p>
          <p>100 EGP</p>
          <p>EGP · USD · EUR · GBP</p>
          <a
            href="/admin/login"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-white/40 hover:text-white"
          >
            {t("studio")}
          </a>
        </div>
      </div>
    </footer>
  );
}
