"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { flashStatus } from "@/components/status-flash";
import {
  blankCmsPage,
  cmsPagePath,
  loc,
  migrateSite,
  newSection,
  pageSlugify,
  pathPageKey,
  RESERVED_PAGE_SLUGS,
  type CmsPage,
  type NavLink,
  type SectionContent,
  type SectionStyle,
  type SectionType,
  type SiteChrome,
  type SiteDocument,
  type SiteSection,
} from "@/lib/site";

type EditContextValue = {
  isAdmin: boolean;
  editing: boolean;
  dirty: boolean;
  saving: boolean;
  site: SiteDocument;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  startEdit: () => void;
  stopEdit: () => void;
  save: () => Promise<void>;
  discard: () => void;
  setChrome: (chrome: Partial<SiteChrome>) => void;
  setNavLinks: (links: NavLink[]) => void;
  patchSection: (
    id: string,
    next: Partial<SiteSection> & {
      content?: Partial<SectionContent>;
      style?: Partial<SectionStyle>;
    },
  ) => void;
  pageKey: "home" | string | null;
  pageSections: SiteSection[];
  addSection: (type: SectionType, beforeId?: string) => void;
  removeSection: (id: string) => void;
  moveSection: (id: string, dir: -1 | 1) => void;
  addPage: (input: { titleEn: string; titleAr: string; slug?: string; addToNav?: boolean }) => string | null;
  ensurePage: (slug: string, title?: { ar: string; en: string }) => void;
  updatePage: (id: string, next: Partial<Pick<CmsPage, "slug" | "title" | "visible">>) => void;
  removePage: (id: string) => void;
};

const EditContext = createContext<EditContextValue | null>(null);

function cloneSite(site: SiteDocument): SiteDocument {
  return structuredClone(migrateSite(site));
}

export function EditProvider({
  initial,
  isAdmin,
  children,
}: {
  initial: SiteDocument;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [site, setSite] = useState(() => cloneSite(initial));
  const [baseline, setBaseline] = useState(() => cloneSite(initial));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pageKey = pathPageKey(pathname);
  const pageSections = useMemo(() => {
    if (!pageKey || pageKey === "home") return site.sections;
    return (site.pages ?? []).find((page) => page.slug === pageKey)?.sections ?? [];
  }, [pageKey, site.pages, site.sections]);
  const dirty = useMemo(() => JSON.stringify(site) !== JSON.stringify(baseline), [baseline, site]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setEditing(false);
      setSelectedId(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (dirty) return;
    const next = cloneSite(initial);
    setSite((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
    setBaseline((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
  }, [dirty, initial]);

  const startEdit = useCallback(() => {
    if (!isAdmin) return;
    setEditing(true);
  }, [isAdmin]);

  const stopEdit = useCallback(() => {
    setEditing(false);
    setSelectedId(null);
  }, []);

  const discard = useCallback(() => {
    setSite(cloneSite(baseline));
    setSelectedId(null);
    toast.message("Changes discarded");
  }, [baseline]);

  const persistDocument = useCallback(async (document: SiteDocument) => {
    const response = await fetch("/api/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(document),
    });
    if (!response.ok) {
      toast.error("Could not save changes");
      return null;
    }
    const payload = (await response.json()) as { site?: unknown; persist?: string };
    const saved = migrateSite(payload.site ?? payload);
    setSite(cloneSite(saved));
    setBaseline(cloneSite(saved));
    router.refresh();
    flashStatus("Saved");
    if (payload.persist === "memory") {
      toast.error("Saved in this session only. Add Supabase so homepage edits stay on the live site.");
    } else if (payload.persist === "local") {
      toast.message("Saved on this computer. Production needs the Supabase site_content table.");
    }
    return saved;
  }, [router]);

  const save = useCallback(async () => {
    setSaving(true);
    await persistDocument(site);
    setSaving(false);
  }, [persistDocument, site]);

  const setChrome = useCallback((chrome: Partial<SiteChrome>) => {
    setSite((current) => ({ ...current, chrome: { ...current.chrome, ...chrome } }));
  }, []);

  const setNavLinks = useCallback((navLinks: NavLink[]) => {
    setSite((current) => ({ ...current, chrome: { ...current.chrome, navLinks } }));
  }, []);

  const mapSections = useCallback(
    (current: SiteDocument, mapper: (sections: SiteSection[]) => SiteSection[]) => {
      const key = pathPageKey(pathname);
      if (!key || key === "home") {
        return { ...current, sections: mapper(current.sections) };
      }
      if (!current.pages.some((page) => page.slug === key)) {
        const page = blankCmsPage(key);
        return { ...current, pages: [...current.pages, { ...page, sections: mapper([]) }] };
      }
      return {
        ...current,
        pages: current.pages.map((page) =>
          page.slug === key ? { ...page, sections: mapper(page.sections) } : page,
        ),
      };
    },
    [pathname],
  );

  const patchSection = useCallback(
    (
      id: string,
      next: Partial<SiteSection> & {
        content?: Partial<SectionContent>;
        style?: Partial<SectionStyle>;
      },
    ) => {
      setSite((current) =>
        mapSections(current, (sections) =>
          sections.map((section) => {
            if (section.id !== id) return section;
            return {
              ...section,
              ...next,
              content: { ...section.content, ...next.content },
              style: { ...section.style, ...next.style },
            };
          }),
        ),
      );
    },
    [mapSections],
  );

  const addSection = useCallback(
    (type: SectionType, beforeId?: string) => {
      const section = newSection(type);
      setSite((current) =>
        mapSections(current, (sections) => {
          if (!beforeId) return [...sections, section];
          const index = sections.findIndex((item) => item.id === beforeId);
          const next = [...sections];
          next.splice(index < 0 ? next.length : index, 0, section);
          return next;
        }),
      );
      setSelectedId(section.id);
    },
    [mapSections],
  );

  const removeSection = useCallback(
    (id: string) => {
      setSite((current) => mapSections(current, (sections) => sections.filter((section) => section.id !== id)));
      setSelectedId((current) => (current === id ? null : current));
    },
    [mapSections],
  );

  const moveSection = useCallback(
    (id: string, dir: -1 | 1) => {
      setSite((current) =>
        mapSections(current, (sections) => {
          const index = sections.findIndex((item) => item.id === id);
          const nextIndex = index + dir;
          if (index < 0 || nextIndex < 0 || nextIndex >= sections.length) return sections;
          const next = [...sections];
          const [row] = next.splice(index, 1);
          next.splice(nextIndex, 0, row);
          return next;
        }),
      );
    },
    [mapSections],
  );

  const addPage = useCallback(
    (input: { titleEn: string; titleAr: string; slug?: string; addToNav?: boolean }) => {
      const titleEn = input.titleEn.trim() || "New page";
      const titleAr = input.titleAr.trim() || titleEn;
      let slug = pageSlugify(input.slug || titleEn || titleAr);
      if (!slug) slug = `page-${Math.random().toString(36).slice(2, 7)}`;
      if (RESERVED_PAGE_SLUGS.has(slug) || site.pages.some((page) => page.slug === slug)) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
      }
      if (RESERVED_PAGE_SLUGS.has(slug)) {
        toast.error("That URL is reserved.");
        return null;
      }
      const page = blankCmsPage(slug, loc(titleAr, titleEn));
      page.slug = slug;
      let nextSite: SiteDocument | null = null;
      setSite((current) => {
        nextSite = {
          ...current,
          pages: [...current.pages, page],
          chrome: input.addToNav
            ? {
                ...current.chrome,
                navLinks: [
                  ...current.chrome.navLinks,
                  {
                    id: `nav-${page.id}`,
                    href: cmsPagePath(slug),
                    label: page.title,
                    visible: true,
                  },
                ],
              }
            : current.chrome,
        };
        return nextSite;
      });
      setEditing(true);
      if (nextSite) void persistDocument(nextSite);
      router.push(cmsPagePath(slug));
      return slug;
    },
    [persistDocument, router, site.pages],
  );

  const ensurePage = useCallback((slug: string, title?: { ar: string; en: string }) => {
    const safe = pageSlugify(slug);
    if (!safe || RESERVED_PAGE_SLUGS.has(safe)) return;
    setSite((current) => {
      if (current.pages.some((page) => page.slug === safe)) return current;
      return {
        ...current,
        pages: [...current.pages, blankCmsPage(safe, title ? loc(title.ar, title.en) : undefined)],
      };
    });
  }, []);

  const updatePage = useCallback((id: string, next: Partial<Pick<CmsPage, "slug" | "title" | "visible">>) => {
    setSite((current) => {
      const currentPage = current.pages.find((page) => page.id === id);
      if (!currentPage) return current;
      const slug = next.slug ? pageSlugify(next.slug) : currentPage.slug;
      if (!slug || RESERVED_PAGE_SLUGS.has(slug)) return current;
      const title = next.title ? { ...currentPage.title, ...next.title } : currentPage.title;
      return {
        ...current,
        pages: current.pages.map((page) => (page.id === id ? { ...page, ...next, slug, title } : page)),
        chrome: {
          ...current.chrome,
          navLinks: current.chrome.navLinks.map((link) =>
            link.href === cmsPagePath(currentPage.slug) ? { ...link, href: cmsPagePath(slug), label: title } : link,
          ),
        },
      };
    });
  }, []);

  const removePage = useCallback(
    (id: string) => {
      const page = site.pages.find((item) => item.id === id);
      setSite((current) => ({
        ...current,
        pages: current.pages.filter((item) => item.id !== id),
        chrome: {
          ...current.chrome,
          navLinks: current.chrome.navLinks.filter((link) => link.href !== (page ? cmsPagePath(page.slug) : "")),
        },
      }));
      if (page && pathPageKey(pathname) === page.slug) router.push("/");
    },
    [pathname, router, site.pages],
  );

  const value = useMemo<EditContextValue>(
    () => ({
      isAdmin,
      editing,
      dirty,
      saving,
      site,
      selectedId,
      setSelectedId,
      startEdit,
      stopEdit,
      save,
      discard,
      setChrome,
      setNavLinks,
      patchSection,
      pageKey,
      pageSections,
      addSection,
      removeSection,
      moveSection,
      addPage,
      ensurePage,
      updatePage,
      removePage,
    }),
    [
      addPage,
      addSection,
      discard,
      dirty,
      editing,
      ensurePage,
      isAdmin,
      moveSection,
      pageKey,
      pageSections,
      patchSection,
      removePage,
      removeSection,
      save,
      saving,
      selectedId,
      setChrome,
      setNavLinks,
      site,
      startEdit,
      stopEdit,
      updatePage,
    ],
  );

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
}

export function useEdit() {
  const ctx = useContext(EditContext);
  if (!ctx) throw new Error("useEdit must be used within EditProvider");
  return ctx;
}
