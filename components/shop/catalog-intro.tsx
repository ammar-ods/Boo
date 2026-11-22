"use client";

import Link from "next/link";
import { BackChevron } from "@/components/ui/back-chevron";
import { EditableCopy } from "@/components/cms/editable-copy";
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
    ? `${pick(site.chrome.copy.search, locale) || t("search")}: ${query}`
    : section
      ? pick(section.label, locale)
      : collection;

  return (
    <>
      <Link href="/catalog" className="inline-flex min-h-11 items-center gap-1 text-sm text-oxford">
        <BackChevron />
        <EditableCopy k="catalogTitle" />
      </Link>
      {heading ? (
        <h1 className="mt-4 font-heading text-4xl tracking-tight text-oxford sm:text-5xl">{heading}</h1>
      ) : (
        <EditableCopy k="catalogTitle" as="h1" className="mt-4 block font-heading text-4xl tracking-tight text-oxford sm:text-5xl" />
      )}
      <EditableCopy k="catalogBody" as="p" className="mb-10 mt-3 block max-w-2xl text-muted-foreground" />
    </>
  );
}
