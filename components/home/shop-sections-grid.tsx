"use client";

import Link from "next/link";
import {
  Baby,
  CupSoda,
  Frame,
  Gift,
  Heart,
  MoonStar,
  Package,
  Shirt,
  Sparkles,
  Trees,
  type LucideIcon,
} from "lucide-react";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/site";

const ICONS: LucideIcon[] = [MoonStar, Heart, Baby, Frame, Gift, Shirt, CupSoda, Trees, Package, Sparkles];

function iconFor(id: string, index: number): LucideIcon {
  const key = id.toLowerCase();
  if (key.includes("apparel") || key.includes("shirt")) return Shirt;
  if (key.includes("drink") || key.includes("mug") || key.includes("cup")) return CupSoda;
  if (key.includes("wood") || key.includes("laser")) return Trees;
  if (key.includes("ramadan") || key.includes("eid")) return MoonStar;
  if (key.includes("newborn") || key.includes("baby") || key.includes("sebou")) return Baby;
  if (key.includes("gift") || key.includes("bundle")) return Gift;
  if (key.includes("wall") || key.includes("decor")) return Frame;
  if (key.includes("book") || key.includes("katb") || key.includes("engage")) return Heart;
  return ICONS[index % ICONS.length];
}

export function ShopSectionsGrid({ embedded = false }: { embedded?: boolean }) {
  const { site } = useEdit();
  const { locale, t } = useI18n();
  const sections = (site.chrome.catalogSections ?? []).filter((section) => section.visible !== false);
  if (!sections.length) return null;

  const grid = (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {sections.map((section, index) => {
            const Icon = iconFor(section.id, index);
            const gold = index % 2 === 0;
            return (
              <Link
                key={section.id}
                href={section.href}
                className="group flex flex-col items-center rounded-[16px] bg-white p-5 text-center shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className={`mb-3 grid size-16 place-items-center rounded-full transition-colors ${
                    gold
                      ? "bg-[#FBF5E6] text-[#C59B27] group-hover:bg-[#C59B27] group-hover:text-white"
                      : "bg-[#eae8e4] text-oxford group-hover:bg-oxford group-hover:text-white"
                  }`}
                >
                  <Icon className="size-7" strokeWidth={1.75} />
                </div>
                <span className="font-heading text-[18px] font-bold leading-7 text-oxford transition-colors group-hover:text-[#C59B27]">
                  {pick(section.label, locale)}
                </span>
              </Link>
            );
          })}
        </div>
  );

  if (embedded) return grid;

  return (
    <div className="bg-[#f5f3ef]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-1 block text-[11px] font-bold tracking-[0.16em] text-[#C59B27] uppercase">
              {t("shopByOccasion")}
            </span>
            <h2 className="font-heading text-2xl font-bold text-oxford sm:text-[32px] sm:leading-[46px]">
              {t("sectionsTitle")}
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">{t("sectionsBody")}</p>
        </div>
        {grid}
      </div>
    </div>
  );
}
