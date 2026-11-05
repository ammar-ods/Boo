"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function SavedToastInner() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const saved = params.get("saved");
  const [visible, setVisible] = useState(Boolean(saved));

  useEffect(() => {
    if (!saved) return;
    setVisible(true);
    const hide = window.setTimeout(() => setVisible(false), 2800);
    const clean = window.setTimeout(() => {
      const next = new URLSearchParams(window.location.search);
      next.delete("saved");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 3000);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(clean);
    };
  }, [saved, pathname, router]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[80]">
      <div
        role="status"
        className="saved-toast flex items-center gap-2 rounded-full bg-boo-teal px-5 py-3 font-heading text-white shadow-lg ring-1 ring-white/30"
      >
        <span className="grid size-6 place-items-center rounded-full bg-white/20 text-sm">✓</span>
        Saved
      </div>
    </div>
  );
}

export function SavedToast() {
  return (
    <Suspense fallback={null}>
      <SavedToastInner />
    </Suspense>
  );
}
