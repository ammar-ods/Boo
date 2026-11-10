"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { cmsPagePath, normalizeNavHref, pathPageKey, pick } from "@/lib/site";
import { cn } from "@/lib/utils";

export type ShopNavItem = {
  id: string;
  href: string;
  label: string;
};

function itemMatches(href: string, pathname: string) {
  const normalized = normalizeNavHref(href);
  if (pathname === href || pathname === normalized) return true;
  const pageKey = pathPageKey(pathname);
  if (!pageKey || pageKey === "home") return false;
  return normalized === cmsPagePath(pageKey) || href.replace(/\/$/, "") === `/${pageKey}`;
}

export function useShopNavItems(): ShopNavItem[] {
  const { locale } = useI18n();
  const { site } = useEdit();
  const seen = new Set<string>();
  const items: ShopNavItem[] = [];

  function push(id: string, href: string, label: string) {
    const key = normalizeNavHref(href);
    if (!href || seen.has(key)) return;
    seen.add(key);
    items.push({ id, href, label });
  }

  push("all", "/catalog?all=1", locale === "ar" ? "الكل" : "All");
  for (const section of site.chrome.catalogSections ?? []) {
    push(section.id, section.href, pick(section.label, locale) || section.id);
  }
  for (const page of site.pages ?? []) {
    if (!page.visible) continue;
    push(page.slug, cmsPagePath(page.slug), pick(page.title, locale) || page.slug);
  }
  return items;
}

export function ShopSidebar({ activeId }: { activeId?: string }) {
  const pathname = usePathname();
  const items = useShopNavItems();
  const current =
    items.find((item) => itemMatches(item.href, pathname))?.id ??
    items.find((item) => activeId && activeId !== "all" && item.id === activeId)?.id ??
    items[0]?.id;

  return (
    <aside className="space-y-6">
      <div>
        <p className="mb-2 text-xs tracking-[0.16em] text-oxford/60">DISCIPLINE</p>
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-start text-sm font-medium transition",
                current === item.id
                  ? "bg-oxford text-white shadow-[0_3px_0_0_#06182c]"
                  : "text-oxford hover:bg-chip",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
