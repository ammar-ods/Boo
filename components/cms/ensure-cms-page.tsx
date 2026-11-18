"use client";

import { useEffect } from "react";
import { useEdit } from "@/lib/edit-context";

export function EnsureCmsPage({ slug, title }: { slug: string; title?: { ar: string; en: string } }) {
  const { isAdmin, ensurePage } = useEdit();

  useEffect(() => {
    if (isAdmin && slug) ensurePage(slug, title);
    // title is only used when creating a missing page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensurePage, isAdmin, slug]);

  return null;
}
