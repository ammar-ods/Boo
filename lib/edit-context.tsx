"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  migrateSite,
  newSection,
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
  addSection: (type: SectionType, afterId?: string) => void;
  removeSection: (id: string) => void;
  moveSection: (id: string, dir: -1 | 1) => void;
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
  const [site, setSite] = useState(() => cloneSite(initial));
  const [baseline, setBaseline] = useState(() => cloneSite(initial));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setEditing(false);
      setSelectedId(null);
    }
  }, [pathname]);

  const dirty = useMemo(() => JSON.stringify(site) !== JSON.stringify(baseline), [baseline, site]);

  const startEdit = useCallback(() => {
    if (!isAdmin) return;
    setEditing(true);
    if (pathname === "/") {
      setSelectedId((current) => current ?? site.sections[0]?.id ?? null);
    }
  }, [isAdmin, pathname, site.sections]);

  const stopEdit = useCallback(() => {
    setEditing(false);
    setSelectedId(null);
  }, []);

  const discard = useCallback(() => {
    setSite(cloneSite(baseline));
    setSelectedId(null);
    toast.message("Changes discarded");
  }, [baseline]);

  const save = useCallback(async () => {
    setSaving(true);
    const response = await fetch("/api/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });
    setSaving(false);
    if (!response.ok) {
      toast.error("Could not save changes");
      return;
    }
    const saved = migrateSite(await response.json());
    setSite(cloneSite(saved));
    setBaseline(cloneSite(saved));
    toast.success("Saved");
  }, [site]);

  const setChrome = useCallback((chrome: Partial<SiteChrome>) => {
    setSite((current) => ({ ...current, chrome: { ...current.chrome, ...chrome } }));
  }, []);

  const setNavLinks = useCallback((navLinks: NavLink[]) => {
    setSite((current) => ({ ...current, chrome: { ...current.chrome, navLinks } }));
  }, []);

  const patchSection = useCallback(
    (
      id: string,
      next: Partial<SiteSection> & {
        content?: Partial<SectionContent>;
        style?: Partial<SectionStyle>;
      },
    ) => {
      setSite((current) => ({
        ...current,
        sections: current.sections.map((section) => {
          if (section.id !== id) return section;
          return {
            ...section,
            ...next,
            content: { ...section.content, ...next.content },
            style: { ...section.style, ...next.style },
          };
        }),
      }));
    },
    [],
  );

  const addSection = useCallback((type: SectionType, afterId?: string) => {
    const section = newSection(type);
    setSite((current) => {
      if (!afterId) return { ...current, sections: [...current.sections, section] };
      const index = current.sections.findIndex((item) => item.id === afterId);
      const sections = [...current.sections];
      sections.splice(index + 1, 0, section);
      return { ...current, sections };
    });
    setSelectedId(section.id);
  }, []);

  const removeSection = useCallback((id: string) => {
    setSite((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== id),
    }));
    setSelectedId((current) => (current === id ? null : current));
  }, []);

  const moveSection = useCallback((id: string, dir: -1 | 1) => {
    setSite((current) => {
      const index = current.sections.findIndex((item) => item.id === id);
      const nextIndex = index + dir;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.sections.length) return current;
      const sections = [...current.sections];
      const [row] = sections.splice(index, 1);
      sections.splice(nextIndex, 0, row);
      return { ...current, sections };
    });
  }, []);

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
      addSection,
      removeSection,
      moveSection,
    }),
    [
      addSection,
      discard,
      dirty,
      editing,
      isAdmin,
      moveSection,
      patchSection,
      removeSection,
      save,
      saving,
      selectedId,
      setChrome,
      setNavLinks,
      site,
      startEdit,
      stopEdit,
    ],
  );

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
}

export function useEdit() {
  const ctx = useContext(EditContext);
  if (!ctx) throw new Error("useEdit must be used within EditProvider");
  return ctx;
}
