"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BooLogo } from "@/components/brand/boo-logo";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const pathname = usePathname();
  const { t } = useI18n();
  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) return null;

  return (
    <footer className="mt-8 rounded-t-[32px] bg-[#121214] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <BooLogo onDark />
          <p className="font-script mt-4 text-2xl text-white/80">Selected with taste.</p>
        </div>
        <div className="text-sm text-white/70">
          <p className="mb-3 font-medium text-white">{t("shop")}</p>
          <Link href="/catalog" className="block py-1 hover:text-white">{t("shop")}</Link>
          <Link href="/bundles" className="block py-1 hover:text-white">{t("bundles")}</Link>
          <Link href="/contact" className="block py-1 hover:text-white">{t("contact")}</Link>
        </div>
        <div className="text-sm text-white/70">
          <p className="mb-3 font-medium text-white">Boo</p>
          <p>100 EGP</p>
          <p>EGP · USD · EUR · GBP</p>
          <Link href="/admin/login" className="mt-4 inline-block text-white/40 hover:text-white">
            {t("studio")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
