export type Locale = "ar" | "en";
export type SectionType = "hero" | "banner" | "text" | "products" | "collections" | "cta" | "faq" | "marquee";

export type Localized = { ar: string; en: string };

export type ImagePlacement = "hidden" | "below" | "bleed" | "cover" | "start" | "end";

export type SectionStyle = {
  background?: string;
  color?: string;
  fontSize?: number;
  paddingY?: number;
  align?: "start" | "center";
  imageHeight?: number;
  imagePlacement?: ImagePlacement;
  imageWidth?: number;
  showPrimaryCta?: boolean;
  showSecondaryCta?: boolean;
  imageRounded?: boolean;
  blockWidth?: number;
  minHeight?: number;
  marginX?: number;
  marginY?: number;
  rounded?: boolean;
};

export type GalleryItem = {
  src: string;
  href?: string;
};

export type SectionContent = {
  eyebrow?: Localized;
  title?: Localized;
  body?: Localized;
  ctaLabel?: Localized;
  ctaHref?: string;
  secondaryCtaLabel?: Localized;
  secondaryCtaHref?: string;
  image?: Localized;
  gallery?: GalleryItem[];
};

export type SiteSection = {
  id: string;
  type: SectionType;
  visible: boolean;
  style: SectionStyle;
  content: SectionContent;
};

export type NavLink = {
  id: string;
  href: string;
  label: Localized;
  visible: boolean;
};

export type SiteChrome = {
  showAnnouncement: boolean;
  announcement: Localized;
  showHeader: boolean;
  showNav: boolean;
  navLinks: NavLink[];
  showFooter: boolean;
  footerTagline: Localized;
  footerBlurb: Localized;
  payPhone: string;
};

export type PromoPopup = {
  live: boolean;
  text: Localized;
  image: string;
};

export type SiteDocument = {
  chrome: SiteChrome;
  sections: SiteSection[];
  promo: PromoPopup;
};

export const SECTION_TYPES: { type: SectionType; label: string; labelAr: string }[] = [
  { type: "hero", label: "Hero", labelAr: "هيرو" },
  { type: "banner", label: "Banner", labelAr: "بانر" },
  { type: "text", label: "Text", labelAr: "نص" },
  { type: "products", label: "Products", labelAr: "منتجات" },
  { type: "collections", label: "Collections", labelAr: "أقسام" },
  { type: "cta", label: "Call to action", labelAr: "دعوة للشراء" },
  { type: "faq", label: "FAQ / about", labelAr: "أسئلة / عنّا" },
  { type: "marquee", label: "Auto-scroll images", labelAr: "شريط تمرير" },
];

export function loc(ar: string, en: string): Localized {
  return { ar, en };
}

export function sectionSurface(style: SectionStyle): { background?: string; color?: string } {
  const background = style.background?.trim();
  const color = style.color?.trim();
  return {
    background: background || "var(--background)",
    color: color || "var(--foreground)",
  };
}

export function pick(value: Localized | string | undefined, locale: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return locale === "en" ? value.en || value.ar : value.ar || value.en;
}

function asLoc(value: unknown, fallback = ""): Localized {
  if (value && typeof value === "object" && ("ar" in (value as object) || "en" in (value as object))) {
    const item = value as { ar?: string; en?: string };
    return { ar: item.ar || fallback, en: item.en || item.ar || fallback };
  }
  if (typeof value === "string") return { ar: value, en: value };
  return { ar: fallback, en: fallback };
}

export const DEFAULT_CHROME: SiteChrome = {
  showAnnouncement: true,
  announcement: loc("شحن داخل مصر · كل القطع بـ ١٠٠ جنيه", "Shipping in Egypt · every piece is 100 EGP"),
  showHeader: true,
  showNav: true,
  navLinks: [
    { id: "shop", href: "/catalog", label: loc("المتجر", "Shop"), visible: true },
    { id: "bundles", href: "/bundles", label: loc("الباقات", "Bundles"), visible: true },
    { id: "contact", href: "/contact", label: loc("تواصل معنا", "Contact"), visible: true },
  ],
  showFooter: true,
  footerTagline: loc("مختار بذوق.", "Selected with taste."),
  footerBlurb: loc("مشغل أكسفورد للطباعة والهدايا.", "An Oxford atelier for print and gifting."),
  payPhone: "01000000000",
};

export const DEFAULT_PROMO: PromoPopup = {
  live: false,
  text: loc("خصم ١٠٪ على طلبك الجاي.", "10% off your next order."),
  image: "",
};

export function newSection(type: SectionType): SiteSection {
  const id = `${type}-${Math.random().toString(36).slice(2, 8)}`;
  const defaults: Record<SectionType, SiteSection> = {
    hero: {
      id,
      type,
      visible: true,
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 56, paddingY: 72, align: "center", showPrimaryCta: true, showSecondaryCta: true },
      content: {
        eyebrow: loc(" · ", "Boo · Oxford atelier"),
        title: loc("قطع  للمكتب والهدايا.", "Pieces chosen for the desk and for gifting."),
        body: loc(
          "تيشيرت ، مج حراري، وكوستر خشب.  ١٠٠ جنيه.",
          "Printable tee, thermal tumbler, and a wood coaster. 100 EGP each.",
        ),
        ctaLabel: loc("تسوّق الآن", "Shop now"),
        ctaHref: "/catalog",
        secondaryCtaLabel: loc("الباقات", "Bundles"),
        secondaryCtaHref: "/bundles",
      },
    },
    banner: {
      id,
      type,
      visible: true,
      style: {
        background: "#0a2540",
        color: "#ffffff",
        fontSize: 32,
        paddingY: 48,
        align: "start",
        imageHeight: 360,
        imagePlacement: "bleed",
        imageWidth: 100,
        imageRounded: false,
        showPrimaryCta: true,
        showSecondaryCta: false,
      },
      content: {
        eyebrow: loc("إصدار جديد", "New drop"),
        title: loc("بانر المنتج الجديد", "New product banner"),
        body: loc("اكتب تفاصيل الإصدار هنا.", "Write the drop details here."),
        ctaLabel: loc("تسوق", "Shop"),
        ctaHref: "/catalog",
        image: loc("/products/white-tee-front.jpg", "/products/white-tee-front.jpg"),
      },
    },
    text: {
      id,
      type,
      visible: true,
      style: {
        background: "#f6f3ea",
        color: "#0a2540",
        fontSize: 20,
        paddingY: 48,
        align: "start",
        blockWidth: 100,
        rounded: false,
      },
      content: {
        title: loc("قسم نص", "Text section"),
        body: loc("اكتب أي محتوى هنا.", "Write any copy here."),
      },
    },
    products: {
      id,
      type,
      visible: true,
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 40, paddingY: 56, align: "center" },
      content: {
        title: loc(" الاستوديو", "Staff picks"),
        body: loc(" الثلاثة  بسعر ١٠٠ جنيه.", "The three current pieces, 100 EGP each."),
      },
    },
    collections: {
      id,
      type,
      visible: true,
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 40, paddingY: 40, align: "center" },
      content: { title: loc("الأقسام", "Collections") },
    },
    cta: {
      id,
      type,
      visible: true,
      style: { background: "#0a2540", color: "#ffffff", fontSize: 32, paddingY: 48, align: "start" },
      content: {
        eyebrow: loc("باقات", "Bundles"),
        title: loc("جهّز هدية كاملة", "Build a complete gift"),
        body: loc("التيشيرت والمجر والكوستر في باقة واحدة.", "Tee, tumbler, and coaster in one pack."),
        ctaLabel: loc("شوف الباقات", "See bundles"),
        ctaHref: "/bundles",
      },
    },
    marquee: {
      id,
      type,
      visible: true,
      style: {
        background: "#f6f3ea",
        color: "#0a2540",
        fontSize: 28,
        paddingY: 28,
        align: "center",
        imageHeight: 220,
        imageRounded: true,
      },
      content: {
        title: loc("منتجات تتحرك", "In motion"),
        gallery: [
          { src: "/products/white-tee-front.jpg", href: "/product/white-tee" },
          { src: "/products/thermal-tumbler.jpg", href: "/product/thermal-tumbler" },
          { src: "/products/wood-coaster.png", href: "/product/wood-coaster" },
          { src: "/products/white-tee-back.jpg", href: "/product/white-tee" },
        ],
      },
    },
    faq: {
      id,
      type,
      visible: true,
      style: { background: "#ffffff", color: "#0a2540", fontSize: 28, paddingY: 56, align: "start" },
      content: {
        title: loc("", "."),
        body: loc(
          "بو للطباعة المخصصة والهدايا. .",
          "Boo is for custom print and gifting. .",
        ),
      },
    },
  };
  return defaults[type];
}

export const DEFAULT_SITE: SiteDocument = {
  chrome: DEFAULT_CHROME,
  promo: DEFAULT_PROMO,
  sections: [
    newSection("hero"),
    newSection("collections"),
    newSection("products"),
    newSection("cta"),
    newSection("faq"),
  ].map((section, index) => ({
    ...section,
    id: ["hero", "collections", "products", "cta", "about"][index] ?? section.id,
  })),
};

function migrateContent(raw: Record<string, unknown> | undefined): SectionContent {
  const src = raw ?? {};
  return {
    eyebrow: src.eyebrow ? asLoc(src.eyebrow) : undefined,
    title: src.title ? asLoc(src.title) : undefined,
    body: src.body ? asLoc(src.body) : undefined,
    ctaLabel: src.ctaLabel ? asLoc(src.ctaLabel) : undefined,
    ctaHref: typeof src.ctaHref === "string" ? src.ctaHref : undefined,
    secondaryCtaLabel: src.secondaryCtaLabel ? asLoc(src.secondaryCtaLabel) : undefined,
    secondaryCtaHref: typeof src.secondaryCtaHref === "string" ? src.secondaryCtaHref : undefined,
    image: src.image ? asLoc(src.image) : undefined,
    gallery: Array.isArray(src.gallery)
      ? src.gallery
          .map((item) => {
            if (typeof item === "string") return { src: item };
            if (item && typeof item === "object" && "src" in item && typeof (item as GalleryItem).src === "string") {
              const row = item as GalleryItem;
              return { src: row.src, href: row.href };
            }
            return null;
          })
          .filter((item): item is GalleryItem => Boolean(item?.src))
      : undefined,
  };
}

export function migrateSite(raw: unknown): SiteDocument {
  const data = (raw ?? {}) as {
    chrome?: Partial<SiteChrome>;
    promo?: Partial<PromoPopup>;
    sections?: SiteSection[] | Array<Record<string, unknown>>;
  };
  const chrome = data.chrome ?? {};
  const promo = data.promo ?? {};
  return {
    chrome: {
      showAnnouncement: chrome.showAnnouncement !== false,
      announcement: fillLoc(asLoc(chrome.announcement, DEFAULT_CHROME.announcement.ar), DEFAULT_CHROME.announcement) ?? DEFAULT_CHROME.announcement,
      showHeader: chrome.showHeader !== false,
      showNav: chrome.showNav !== false,
      navLinks:
        Array.isArray(chrome.navLinks) && chrome.navLinks.length
          ? chrome.navLinks.map((link, index) => ({
              id: String(link.id || `link-${index}`),
              href: String(link.href || "/"),
              label: asLoc(link.label),
              visible: link.visible !== false,
            }))
          : DEFAULT_CHROME.navLinks,
      showFooter: chrome.showFooter !== false,
      footerTagline: fillLoc(asLoc(chrome.footerTagline, DEFAULT_CHROME.footerTagline.ar), DEFAULT_CHROME.footerTagline) ?? DEFAULT_CHROME.footerTagline,
      footerBlurb: fillLoc(asLoc(chrome.footerBlurb, DEFAULT_CHROME.footerBlurb.ar), DEFAULT_CHROME.footerBlurb) ?? DEFAULT_CHROME.footerBlurb,
      payPhone: typeof chrome.payPhone === "string" && chrome.payPhone.trim() ? chrome.payPhone.trim() : DEFAULT_CHROME.payPhone,
    },
    promo: {
      live: Boolean(promo.live),
      text: fillLoc(asLoc(promo.text, DEFAULT_PROMO.text.ar), DEFAULT_PROMO.text) ?? DEFAULT_PROMO.text,
      image: typeof promo.image === "string" ? promo.image : "",
    },
    sections: Array.isArray(data.sections)
      ? data.sections.map((section, index) => {
          const row = section as SiteSection & { content?: Record<string, unknown> };
          const migrated: SiteSection = {
            id: String(row.id || `section-${index}`),
            type: (row.type as SectionType) || "text",
            visible: row.visible !== false,
            style: row.style ?? {},
            content: migrateContent(row.content as Record<string, unknown>),
          };
          return fillMissingEnglish(migrated);
        })
      : DEFAULT_SITE.sections,
  };
}

function looksArabic(value: string) {
  return /[\u0600-\u06FF]/.test(value);
}

function fillLoc(current: Localized | undefined, fallback: Localized | undefined) {
  if (!current) return fallback;
  if (current.en && current.en !== current.ar && !looksArabic(current.en)) return current;
  if (looksArabic(current.ar) && fallback?.en) return { ar: current.ar, en: fallback.en };
  return current;
}

function fillMissingEnglish(section: SiteSection): SiteSection {
  const fallback =
    DEFAULT_SITE.sections.find((item) => item.id === section.id) ??
    DEFAULT_SITE.sections.find((item) => item.type === section.type);
  if (!fallback) return section;
  return {
    ...section,
    content: {
      ...section.content,
      eyebrow: fillLoc(section.content.eyebrow, fallback.content.eyebrow),
      title: fillLoc(section.content.title, fallback.content.title),
      body: fillLoc(section.content.body, fallback.content.body),
      ctaLabel: fillLoc(section.content.ctaLabel, fallback.content.ctaLabel),
      secondaryCtaLabel: fillLoc(section.content.secondaryCtaLabel, fallback.content.secondaryCtaLabel),
      image: section.content.image ?? fallback.content.image,
    },
  };
}
