"use client";

import { useI18n } from "@/lib/i18n";

export function CatalogIntro({ query, collection }: { query?: string; collection?: string }) {
  const { t } = useI18n();
  const heading = query ? `${t("search")}: ${query}` : collection || t("catalogTitle");
  return (
    <>
      <p className="inline-flex rounded-full bg-chip px-3 py-1 text-xs font-medium text-oxford">Boo</p>
      <h1 className="mt-4 font-heading text-5xl text-oxford">{heading}</h1>
      <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">{t("catalogBody")}</p>
    </>
  );
}
