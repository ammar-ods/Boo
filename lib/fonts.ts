export const CANVAS_FONTS = [
  { label: "Playfair", value: "Playfair Display" },
  { label: "Inter", value: "Inter" },
  { label: "Oswald", value: "Oswald" },
  { label: "Georgia", value: "Georgia" },
] as const;

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
  { id: "manrope", label: "Manrope", google: "Manrope", family: "Manrope", script: "latin" },
  { id: "space-grotesk", label: "Space Grotesk", google: "Space Grotesk", family: '"Space Grotesk"', script: "latin" },
  { id: "work-sans", label: "Work Sans", google: "Work Sans", family: '"Work Sans"', script: "latin" },
  { id: "nunito", label: "Nunito", google: "Nunito", family: "Nunito", script: "latin" },
  { id: "poppins", label: "Poppins", google: "Poppins", family: "Poppins", script: "latin" },
  { id: "montserrat", label: "Montserrat", google: "Montserrat", family: "Montserrat", script: "latin" },
  { id: "raleway", label: "Raleway", google: "Raleway", family: "Raleway", script: "latin" },
  { id: "karla", label: "Karla", google: "Karla", family: "Karla", script: "latin" },
  { id: "lato", label: "Lato", google: "Lato", family: "Lato", script: "latin" },
  { id: "source-serif", label: "Source Serif 4", google: "Source Serif 4", family: '"Source Serif 4"', script: "latin" },
  { id: "newsreader", label: "Newsreader", google: "Newsreader", family: "Newsreader", script: "latin" },
  { id: "fraunces", label: "Fraunces", google: "Fraunces", family: "Fraunces", script: "latin" },
  { id: "playfair", label: "Playfair Display", google: "Playfair Display", family: '"Playfair Display"', script: "latin" },
  { id: "cormorant", label: "Cormorant Garamond", google: "Cormorant Garamond", family: '"Cormorant Garamond"', script: "latin" },
  { id: "libre-baskerville", label: "Libre Baskerville", google: "Libre Baskerville", family: '"Libre Baskerville"', script: "latin" },
  { id: "merriweather", label: "Merriweather", google: "Merriweather", family: "Merriweather", script: "latin" },
];

export const ARABIC_FONTS: SiteFont[] = [
  { id: "ibm-plex-arabic", label: "IBM Plex Sans Arabic", google: "IBM Plex Sans Arabic", family: '"IBM Plex Sans Arabic"', script: "arabic" },
  { id: "readex", label: "Readex Pro", google: "Readex Pro", family: '"Readex Pro"', script: "arabic" },
  { id: "noto-sans-arabic", label: "Noto Sans Arabic", google: "Noto Sans Arabic", family: '"Noto Sans Arabic"', script: "arabic" },
  { id: "noto-naskh", label: "Noto Naskh Arabic", google: "Noto Naskh Arabic", family: '"Noto Naskh Arabic"', script: "arabic" },
  { id: "noto-kufi", label: "Noto Kufi Arabic", google: "Noto Kufi Arabic", family: '"Noto Kufi Arabic"', script: "arabic" },
  { id: "tajawal", label: "Tajawal", google: "Tajawal", family: "Tajawal", script: "arabic" },
  { id: "almarai", label: "Almarai", google: "Almarai", family: "Almarai", script: "arabic" },
  { id: "cairo", label: "Cairo", google: "Cairo", family: "Cairo", script: "arabic" },
  { id: "changa", label: "Changa", google: "Changa", family: "Changa", script: "arabic" },
  { id: "el-messiri", label: "El Messiri", google: "El Messiri", family: '"El Messiri"', script: "arabic" },
  { id: "reem-kufi", label: "Reem Kufi", google: "Reem Kufi", family: '"Reem Kufi"', script: "arabic" },
  { id: "mada", label: "Mada", google: "Mada", family: "Mada", script: "arabic" },
  { id: "lemonada", label: "Lemonada", google: "Lemonada", family: "Lemonada", script: "arabic" },
  { id: "harmattan", label: "Harmattan", google: "Harmattan", family: "Harmattan", script: "arabic" },
  { id: "lateef", label: "Lateef", google: "Lateef", family: "Lateef", script: "arabic" },
  { id: "scheherazade", label: "Scheherazade New", google: "Scheherazade New", family: '"Scheherazade New"', script: "arabic" },
  { id: "amiri", label: "Amiri", google: "Amiri", family: "Amiri", script: "arabic" },
  { id: "aref-ruqaa", label: "Aref Ruqaa", google: "Aref Ruqaa", family: '"Aref Ruqaa"', script: "arabic" },
  { id: "katibeh", label: "Katibeh", google: "Katibeh", family: "Katibeh", script: "arabic" },
  { id: "markazi", label: "Markazi Text", google: "Markazi Text", family: '"Markazi Text"', script: "arabic" },
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
