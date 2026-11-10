"use client";

import Link from "next/link";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/site";

export function CatalogIntro({ query, collection }: { query?: string; collection?: string }) {
  const { t, locale } = useI18n();
  const { site } = useEdit();
  const section = collection
    ? site.chrome.catalogSections?.find((item) => item.id === collection || item.href.includes(`collection=${collection}`))
    : undefined;
  const heading = query
    ? `${t("search")}: ${query}`
    : section
      ? pick(section.label, locale)
      : collection || t("catalogTitle");
  return (
    <>
      <Link href="/catalog" className="inline-flex min-h-11 items-center text-sm text-oxford">
        ← {t("catalogTitle")}
      </Link>
      <h1 className="mt-4 font-heading text-5xl text-oxford">{heading}</h1>
      <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">{t("catalogBody")}</p>
    </>
  );
}
