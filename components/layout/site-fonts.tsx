"use client";

import { useEffect } from "react";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { fontStack, googleFontsHref, resolveSiteFont } from "@/lib/fonts";

export function SiteFonts() {
  const { locale } = useI18n();
  const { site } = useEdit();
  const latin = resolveSiteFont(site.chrome.fontEn, "latin");
  const arabic = resolveSiteFont(site.chrome.fontAr, "arabic");
  const primary = locale === "ar" ? arabic : latin;
  const secondary = locale === "ar" ? latin : arabic;
  const stack = fontStack(primary, secondary);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--font-site", stack);
    root.style.setProperty("--font-site-heading", stack);
  }, [stack]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={googleFontsHref([latin, arabic])} />
    </>
  );
}
