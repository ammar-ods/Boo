"use client";

import { useEffect } from "react";
import { useEdit } from "@/lib/edit-context";

export function EnsureCmsPage({ slug }: { slug: string }) {
  const { isAdmin, ensurePage } = useEdit();

  useEffect(() => {
    if (isAdmin && slug) ensurePage(slug);
  }, [ensurePage, isAdmin, slug]);

  return null;
}
