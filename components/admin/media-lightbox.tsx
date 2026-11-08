"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function MediaLightbox({
  src,
  label,
  children,
}: {
  src: string;
  label?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" className="block w-full text-start" onClick={() => setOpen(true)}>
        {children}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-oxford/60 p-4 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[28px] bg-background p-4 shadow-[0_24px_80px_-28px_rgba(10,37,64,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-heading text-lg text-oxford">{label || "Preview"}</p>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-2xl bg-cream"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={label || ""} className="mx-auto max-h-[78vh] w-auto max-w-full object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
