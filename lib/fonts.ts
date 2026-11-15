export type SiteFont = {
  id: string;
  label: string;
  google: string;
  family: string;
  script: "latin" | "arabic";
};

export const LATIN_FONTS: SiteFont[] = [
  { id: "jakarta", label: "Plus Jakarta Sans", google: "Plus Jakarta Sans", family: '"Plus Jakarta Sans"', script: "latin" },
  { id: "inter", label: "Inter", google: "Inter", family: "Inter", script: "latin" },
  { id: "outfit", label: "Outfit", google: "Outfit", family: "Outfit", script: "latin" },
  { id: "dm-sans", label: "DM Sans", google: "DM Sans", family: '"DM Sans"', script: "latin" },
  { id: "lato", label: "Lato", google: "Lato", family: "Lato", script: "latin" },
  { id: "newsreader", label: "Newsreader", google: "Newsreader", family: "Newsreader", script: "latin" },
  { id: "playfair", label: "Playfair Display", google: "Playfair Display", family: '"Playfair Display"', script: "latin" },
  { id: "cormorant", label: "Cormorant Garamond", google: "Cormorant Garamond", family: '"Cormorant Garamond"', script: "latin" },
];

export const ARABIC_FONTS: SiteFont[] = [
  { id: "ibm-plex-arabic", label: "IBM Plex Sans Arabic", google: "IBM Plex Sans Arabic", family: '"IBM Plex Sans Arabic"', script: "arabic" },
  { id: "readex", label: "Readex Pro", google: "Readex Pro", family: '"Readex Pro"', script: "arabic" },
  { id: "noto-sans-arabic", label: "Noto Sans Arabic", google: "Noto Sans Arabic", family: '"Noto Sans Arabic"', script: "arabic" },
  { id: "noto-naskh", label: "Noto Naskh Arabic", google: "Noto Naskh Arabic", family: '"Noto Naskh Arabic"', script: "arabic" },
  { id: "tajawal", label: "Tajawal", google: "Tajawal", family: "Tajawal", script: "arabic" },
  { id: "almarai", label: "Almarai", google: "Almarai", family: "Almarai", script: "arabic" },
  { id: "amiri", label: "Amiri", google: "Amiri", family: "Amiri", script: "arabic" },
  { id: "cairo", label: "Cairo", google: "Cairo", family: "Cairo", script: "arabic" },
];

export const DEFAULT_FONT_EN = "jakarta";
export const DEFAULT_FONT_AR = "ibm-plex-arabic";

export function resolveSiteFont(id: string | undefined, script: "latin" | "arabic"): SiteFont {
  const list = script === "arabic" ? ARABIC_FONTS : LATIN_FONTS;
  const fallback = script === "arabic" ? ARABIC_FONTS[0] : LATIN_FONTS[0];
  return list.find((item) => item.id === id) ?? fallback;
}

export function googleFontsHref(fonts: SiteFont[]) {
  const unique = [...new Map(fonts.map((item) => [item.id, item])).values()];
  const query = unique
    .map((item) =>
      item.script === "arabic"
        ? `family=${encodeURIComponent(item.google)}:wght@400;500;600;700`
        : `family=${encodeURIComponent(item.google)}:ital,wght@0,400;0,500;0,600;0,700;1,400`,
    )
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export function fontStack(primary: SiteFont, secondary: SiteFont) {
  return `${primary.family}, ${secondary.family}, ui-sans-serif, system-ui, sans-serif`;
}
