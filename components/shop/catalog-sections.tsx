"use client";

import Link from "next/link";
import { EditableCopy } from "@/components/cms/editable-copy";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/site";

export function CatalogSections() {
  const { locale } = useI18n();
  const { site } = useEdit();
  const sections = (site.chrome.catalogSections ?? []).filter((section) => section.visible !== false);

  return (
    <div>
      <p className="inline-flex rounded-full bg-chip px-3 py-1 text-xs font-medium text-oxford">Boo</p>
      <EditableCopy k="catalogTitle" as="h1" className="mt-4 block font-heading text-5xl text-oxford" />
      <EditableCopy k="catalogBody" as="p" className="mb-8 mt-2 block max-w-2xl text-muted-foreground" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.id} href={section.href} className="group block">
            <div className="overflow-hidden rounded-[1.8rem] bg-chip ring-1 ring-oxford/8">
              {section.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={section.image}
                  alt=""
                  className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="aspect-[4/5] w-full bg-transparent" />
              )}
            </div>
            <h2 className="mt-3 font-heading text-2xl text-oxford">{pick(section.label, locale)}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
