"use client";

import { ARABIC_FONTS, LATIN_FONTS, googleFontsHref, resolveSiteFont } from "@/lib/fonts";

export function FontFields({
  fontEn,
  fontAr,
  onEn,
  onAr,
}: {
  fontEn: string;
  fontAr: string;
  onEn: (value: string) => void;
  onAr: (value: string) => void;
}) {
  const latin = resolveSiteFont(fontEn, "latin");
  const arabic = resolveSiteFont(fontAr, "arabic");

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <link rel="stylesheet" href={googleFontsHref([latin, arabic])} />
      <label className="block text-sm">
        English font
        <select
          name="fontEn"
          className="mt-1 h-11 w-full rounded-xl border border-oxford/12 bg-white px-3 text-sm"
          value={latin.id}
          onChange={(event) => onEn(event.target.value)}
          style={{ fontFamily: latin.family }}
        >
          {LATIN_FONTS.map((item) => (
            <option key={item.id} value={item.id} style={{ fontFamily: item.family }}>
              {item.label}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-muted-foreground" style={{ fontFamily: latin.family }}>
          Selected with taste.
        </span>
      </label>
      <label className="block text-sm">
        Arabic font
        <select
          name="fontAr"
          className="mt-1 h-11 w-full rounded-xl border border-oxford/12 bg-white px-3 text-sm"
          value={arabic.id}
          onChange={(event) => onAr(event.target.value)}
          style={{ fontFamily: arabic.family }}
          dir="rtl"
        >
          {ARABIC_FONTS.map((item) => (
            <option key={item.id} value={item.id} style={{ fontFamily: item.family }}>
              {item.label}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-muted-foreground" dir="rtl" style={{ fontFamily: arabic.family }}>
          مختار بذوق.
        </span>
      </label>
    </div>
  );
}
