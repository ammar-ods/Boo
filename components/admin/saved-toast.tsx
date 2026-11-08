"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { flashStatus } from "@/components/status-flash";

function SavedToastInner() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const saved = params.get("saved");
  const deleted = params.get("deleted");

  useEffect(() => {
    if (!saved && !deleted) return;
    flashStatus(deleted ? "Deleted successfully" : "Saved");
    const clean = window.setTimeout(() => {
      const next = new URLSearchParams(window.location.search);
      next.delete("saved");
      next.delete("deleted");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 1100);
    return () => window.clearTimeout(clean);
  }, [deleted, saved, pathname, router]);

  return null;
}

export function SavedToast() {
  return (
    <Suspense fallback={null}>
      <SavedToastInner />
    </Suspense>
  );
}
