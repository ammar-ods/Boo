import { normalizeCategoryId } from "@/lib/products";
import {
  blankCmsPage,
  cmsPagePath,
  loc,
  pageSlugify,
  RESERVED_PAGE_SLUGS,
  type CatalogSection,
  type NavLink,
  type SiteDocument,
} from "@/lib/site";

export function categoryPath(id: string) {
  return cmsPagePath(id);
}

export function upsertNavCategory(navLinks: NavLink[], section: CatalogSection): NavLink[] {
  const child: NavLink = {
    id: `cat-${section.id}`,
    href: section.href,
    label: section.label,
    visible: section.visible !== false,
  };
  const parentIndex = navLinks.findIndex(
    (link) => link.id === "shop" || link.href === "/catalog" || link.href.startsWith("/catalog"),
  );
  if (parentIndex < 0) {
    return [
      {
        id: "shop",
        href: "/catalog",
        label: loc("المتجر", "Shop"),
        visible: true,
        children: [child],
      },
      ...navLinks,
    ];
  }
  const parent = navLinks[parentIndex];
  const children = parent.children ?? [];
  const existing = children.findIndex(
    (item) => item.id === child.id || item.href === child.href || item.id === section.id,
  );
  const nextChildren =
    existing >= 0 ? children.map((item, index) => (index === existing ? { ...item, ...child } : item)) : [...children, child];
  return navLinks.map((link, index) => (index === parentIndex ? { ...link, children: nextChildren } : link));
}

export function removeNavCategory(navLinks: NavLink[], sectionId: string): NavLink[] {
  return navLinks.map((link) => ({
    ...link,
    children: (link.children ?? []).filter(
      (child) => child.id !== `cat-${sectionId}` && child.id !== sectionId && !child.href.endsWith(`/${sectionId}`),
    ),
  }));
}

export function upsertCategoryInSite(site: SiteDocument, section: CatalogSection): SiteDocument {
  const sections = site.chrome.catalogSections ?? [];
  const index = sections.findIndex((item) => item.id === section.id);
  const catalogSections = index >= 0 ? sections.map((item, i) => (i === index ? section : item)) : [...sections, section];
  const pages = site.pages.some((page) => page.slug === section.id)
    ? site.pages.map((page) =>
        page.slug === section.id
          ? { ...page, title: section.label, visible: section.visible !== false }
          : page,
      )
    : [...site.pages, blankCmsPage(section.id, section.label)];
  return {
    ...site,
    pages,
    chrome: {
      ...site.chrome,
      catalogSections,
      navLinks: upsertNavCategory(site.chrome.navLinks, section),
    },
  };
}

export function removeCategoryFromSite(site: SiteDocument, id: string): SiteDocument {
  return {
    ...site,
    pages: site.pages.filter((page) => page.slug !== id),
    chrome: {
      ...site.chrome,
      catalogSections: (site.chrome.catalogSections ?? []).filter((item) => item.id !== id),
      navLinks: removeNavCategory(site.chrome.navLinks, id),
    },
  };
}

export function syncCategoriesIntoSite(site: SiteDocument): SiteDocument {
  return (site.chrome.catalogSections ?? []).reduce(
    (next, section) =>
      upsertCategoryInSite(next, {
        ...section,
        href: categoryPath(section.id),
      }),
    site,
  );
}

export function uniqueCategoryId(site: SiteDocument, raw: string) {
  let id = normalizeCategoryId(raw) || pageSlugify(raw) || `cat-${Math.random().toString(36).slice(2, 7)}`;
  if (RESERVED_PAGE_SLUGS.has(id)) id = `cat-${id}`;
  const taken = new Set([
    ...(site.chrome.catalogSections ?? []).map((item) => item.id),
    ...site.pages.map((page) => page.slug),
  ]);
  if (!taken.has(id)) return id;
  return `${id}-${Math.random().toString(36).slice(2, 5)}`;
}
