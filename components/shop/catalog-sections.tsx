"use client";

import Link from "next/link";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/site";

export function CatalogSections() {
  const { locale, t } = useI18n();
  const { site } = useEdit();
  const sections = (site.chrome.catalogSections ?? []).filter((section) => section.visible !== false);

  return (
    <div>
      <p className="inline-flex rounded-full bg-chip px-3 py-1 text-xs font-medium text-oxford">Boo</p>
      <h1 className="mt-4 font-heading text-5xl text-oxford">{t("catalogTitle")}</h1>
      <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">{t("catalogBody")}</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.id} href={section.href} className="group block">
            <div className="overflow-hidden rounded-[1.8rem] bg-chip ring-1 ring-oxford/8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.image || "/products/white-tee-front.jpg"}
                alt=""
                className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <h2 className="mt-3 font-heading text-2xl text-oxford">{pick(section.label, locale)}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
