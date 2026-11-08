"use client";

import { SECTION_TYPES, type SectionType } from "@/lib/site";

export function SectionTypeMenu({
  onPick,
  heading = "Add section",
}: {
  onPick: (type: SectionType) => void;
  heading?: string;
}) {
  return (
    <div className="w-64 overflow-hidden rounded-2xl bg-white py-1 shadow-xl ring-1 ring-oxford/10">
      <p className="px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">
        {heading}
      </p>
      <div className="grid grid-cols-1">
        {SECTION_TYPES.map((item) => (
          <button
            key={item.type}
            type="button"
            className="flex items-baseline justify-between gap-2 px-3 py-2 text-start hover:bg-cream"
            onClick={() => onPick(item.type)}
          >
            <span className="text-sm font-medium text-oxford">{item.label}</span>
            <span className="text-[11px] text-oxford/40">{item.labelAr}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
