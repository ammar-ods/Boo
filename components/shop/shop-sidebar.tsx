"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { cmsPagePath, normalizeNavHref, pathPageKey, pick } from "@/lib/site";
import { cn } from "@/lib/utils";

export type ShopNavItem = {
  id: string;
  href: string;
  label: string;
};

function itemMatches(href: string, pathname: string, search: string) {
  const normalized = normalizeNavHref(href);
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  let hrefUrl: URL | null = null;
  try {
    hrefUrl = new URL(href, "https://boo.local");
  } catch {
    hrefUrl = null;
  }

  if (pathname === "/catalog" || pathname.startsWith("/catalog/")) {
    const collection = params.get("collection");
    const all = params.get("all");
    const hrefCollection = hrefUrl?.searchParams.get("collection");
    const hrefAll = hrefUrl?.searchParams.get("all");
    if (hrefAll === "1") return all === "1" || (!collection && !hrefCollection);
    if (hrefCollection) return collection === hrefCollection;
    if (normalized === "/catalog" && !hrefCollection && hrefAll !== "1") {
      return !collection && all !== "1";
    }
  }

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
    if (section.visible === false) continue;
    push(section.id, section.href, pick(section.label, locale) || section.id);
  }
  return items;
}

export function ShopRail({
  children,
  activeId,
}: {
  children: ReactNode;
  activeId?: string;
}) {
  const { site } = useEdit();
  const show = site.chrome.showDiscipline !== false;
  return (
    <div className="mx-auto flex w-full max-w-[86rem] items-start justify-center px-5 sm:px-8">
      {show ? <ShopSidebar activeId={activeId} /> : null}
      <div className="w-full min-w-0 max-w-6xl">{children}</div>
    </div>
  );
}

export function ShopSidebar({ activeId }: { activeId?: string }) {
  const { site } = useEdit();
  if (site.chrome.showDiscipline === false) return null;
  return (
    <Suspense fallback={<aside className="hidden w-44 shrink-0 xl:block xl:w-52" />}>
      <ShopSidebarNav activeId={activeId} />
    </Suspense>
  );
}

function ShopSidebarNav({ activeId }: { activeId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const items = useShopNavItems();
  const current =
    items.find((item) => itemMatches(item.href, pathname, search))?.id ??
    items.find((item) => activeId && activeId !== "all" && item.id === activeId)?.id ??
    items[0]?.id;

  return (
    <aside className="sticky top-28 hidden w-44 shrink-0 self-start border-e border-oxford/15 pe-5 me-6 xl:block xl:w-52 xl:pe-6 xl:me-8">
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
