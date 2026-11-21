"use client";

import type { ReactNode } from "react";

export function FinanceDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[160] grid place-items-center bg-oxford/45 p-4" onClick={onClose}>
      <div
        className="max-h-[min(90dvh,40rem)] w-full max-w-lg overflow-y-auto rounded-[1.6rem] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-heading text-2xl text-oxford">{title}</h2>
          <button type="button" className="text-sm text-oxford/50 hover:text-oxford" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-oxford/70">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-11 w-full rounded-xl border border-oxford/12 bg-cream/40 px-3 text-sm text-oxford outline-none focus:border-oxford/30";
