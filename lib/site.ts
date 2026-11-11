export type Locale = "ar" | "en";
export type SectionType =
  | "hero"
  | "banner"
  | "slideshow"
  | "text"
  | "products"
  | "collections"
  | "cta"
  | "faq"
  | "marquee";

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
  ctaBackground?: string;
  ctaColor?: string;
  secondaryCtaBackground?: string;
  secondaryCtaColor?: string;
  imageRounded?: boolean;
  intervalMs?: number;
  aspect?: string;
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
  imageHref?: string;
  gallery?: GalleryItem[];
  galleryAr?: GalleryItem[];
  galleryEn?: GalleryItem[];
  productSlugs?: string[];
  collection?: string;
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
  children?: NavLink[];
};

export type CatalogSection = {
  id: string;
  href: string;
  image: string;
  label: Localized;
};

export type FooterIcon = {
  id: string;
  icon: string;
  href: string;
  label: Localized;
};

export type SiteChrome = {
  showAnnouncement: boolean;
  announcement: Localized;
  showHeader: boolean;
  showNav: boolean;
  navLinks: NavLink[];
  catalogSections: CatalogSection[];
  logo: string;
  footerLogo: string;
  showFooter: boolean;
  footerTagline: Localized;
  footerBlurb: Localized;
  footerShopTitle: Localized;
  footerMetaTitle: Localized;
  footerMetaLines: Localized[];
  footerShowStudio: boolean;
  footerIcons: FooterIcon[];
  payPhone: string;
  whatsappPhone: string;
};

export type PromoPopup = {
  live: boolean;
  text: Localized;
  image: string;
  codes: PromoCode[];
};

export type PromoCode = {
  id: string;
  code: string;
  percent: number;
  active: boolean;
};

export type ShopFormField = {
  id: string;
  key: string;
  label: Localized;
  type: "text" | "email" | "tel" | "textarea";
  required: boolean;
  enabled: boolean;
};

export type Commerce = {
  shippingPrice: number;
  shippingLabel: Localized;
  shippingDetails: Localized;
  freeShippingMin: number;
  contactEmail: string;
  contactFields: ShopFormField[];
  checkoutFields: ShopFormField[];
};

export type CmsPage = {
  id: string;
  slug: string;
  title: Localized;
  visible: boolean;
  sections: SiteSection[];
};

export type SiteDocument = {
  chrome: SiteChrome;
  sections: SiteSection[];
  pages: CmsPage[];
  promo: PromoPopup;
  commerce: Commerce;
};

export const RESERVED_PAGE_SLUGS = new Set([
  "admin",
  "api",
  "bundles",
  "cart",
  "catalog",
  "checkout",
  "contact",
  "customize",
  "login",
  "p",
  "product",
  "thanks",
]);

export function pageSlugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function cmsPagePath(slug: string) {
  return `/p/${slug}`;
}

const APP_PATHS = new Set(["/", "/catalog", "/bundles", "/contact", "/cart", "/checkout", "/thanks"]);

export function normalizeNavHref(href: string) {
  const raw = href.trim() || "/";
  if (/^(https?:|mailto:|tel:|#)/i.test(raw)) return raw;
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const [pathPart, query = ""] = withSlash.split("?");
  const path = pathPart.replace(/\/+$/, "") || "/";
  if (APP_PATHS.has(path) || path.startsWith("/catalog") || path.startsWith("/product/") || path.startsWith("/customize/") || path.startsWith("/admin")) {
    return query ? `${path}?${query}` : path;
  }
  if (path.startsWith("/p/")) {
    const slug = pageSlugify(decodeURIComponent(path.slice(3)));
    return slug ? cmsPagePath(slug) : "/";
  }
  const slug = pageSlugify(decodeURIComponent(path.slice(1)));
  if (!slug || RESERVED_PAGE_SLUGS.has(slug)) return query ? `${withSlash}` : withSlash;
  return cmsPagePath(slug);
}

export function pathPageKey(pathname: string): "home" | string | null {
  if (pathname === "/") return "home";
  const nested = pathname.match(/^\/p\/([^/]+)\/?$/);
  if (nested) return pageSlugify(decodeURIComponent(nested[1]));
  const loose = pathname.match(/^\/([^/]+)\/?$/);
  if (!loose) return null;
  const slug = pageSlugify(decodeURIComponent(loose[1]));
  if (!slug || RESERVED_PAGE_SLUGS.has(slug) || APP_PATHS.has(`/${slug}`)) return null;
  return slug;
}

export function blankCmsPage(slug: string, title?: Localized): CmsPage {
  const safe = pageSlugify(slug) || `page-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id: `page-${Math.random().toString(36).slice(2, 8)}`,
    slug: safe,
    title: title ?? loc(safe, safe),
    visible: true,
    sections: [newSection("hero"), newSection("products")],
  };
}

export function getPageSections(site: SiteDocument, key: "home" | string | null) {
  if (!key || key === "home") return site.sections;
  return site.pages.find((page) => page.slug === key)?.sections ?? [];
}

export const SECTION_TYPES: { type: SectionType; label: string; labelAr: string }[] = [
  { type: "hero", label: "Hero", labelAr: "هيرو" },
  { type: "banner", label: "Banner", labelAr: "بانر" },
  { type: "slideshow", label: "Auto banner", labelAr: "بانر متحرك" },
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

function isThemePageFill(value?: string) {
  const key = (value || "").trim().toLowerCase();
  return (
    !key ||
    key === "var(--background)" ||
    key === "var(--cream)" ||
    key === "#f6f3ea" ||
    key === "#faf9f6" ||
    key === "#f4f3f0"
  );
}

function isThemeCardFill(value?: string) {
  const key = (value || "").trim().toLowerCase();
  return key === "#ffffff" || key === "#fff" || key === "var(--card)";
}

function isThemeInk(value?: string) {
  const key = (value || "").trim().toLowerCase();
  return (
    !key ||
    key === "var(--foreground)" ||
    key === "#0a2540" ||
    key === "#121214" ||
    key === "#002147"
  );
}

export function sectionSurface(style: SectionStyle): { background?: string; color?: string } {
  const background = style.background?.trim();
  const color = style.color?.trim();
  return {
    background: isThemePageFill(background)
      ? "var(--background)"
      : isThemeCardFill(background)
        ? "var(--card)"
        : background,
    color: isThemeInk(color) ? "var(--foreground)" : color,
  };
}

export function parseGalleryItems(value: unknown): GalleryItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { src: item };
      if (item && typeof item === "object" && "src" in item && typeof (item as GalleryItem).src === "string") {
        const row = item as GalleryItem;
        return { src: row.src, href: row.href };
      }
      return null;
    })
    .filter((item): item is GalleryItem => Boolean(item?.src));
}

export function sectionGallery(section: SiteSection, locale: string) {
  if (locale === "ar") {
    if (section.content.galleryAr?.length) return section.content.galleryAr;
    if (section.content.gallery?.length) return section.content.gallery;
    return section.content.galleryEn ?? [];
  }
  if (section.content.galleryEn?.length) return section.content.galleryEn;
  if (section.content.gallery?.length) return section.content.gallery;
  return section.content.galleryAr ?? [];
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
  catalogSections: [
    {
      id: "apparel",
      href: "/catalog?collection=apparel",
      image: "/products/white-tee-front.jpg",
      label: loc("ملابس", "Apparel"),
    },
    {
      id: "drinkware",
      href: "/catalog?collection=drinkware",
      image: "/products/thermal-tumbler.jpg",
      label: loc("مشروبات", "Drinkware"),
    },
    {
      id: "wood",
      href: "/catalog?collection=wood",
      image: "/products/wood-coaster.png",
      label: loc("خشب", "Laser Cut Wood"),
    },
  ],
  logo: "/brand/boo-mark.png",
  footerLogo: "/brand/boo-mark.png",
  showFooter: true,
  footerTagline: loc("مختار بذوق.", "Selected with taste."),
  footerBlurb: loc("مشغل أكسفورد للطباعة والهدايا.", "An Oxford atelier for print and gifting."),
  footerShopTitle: loc("المتجر", "Shop"),
  footerMetaTitle: loc("Boo", "Boo"),
  footerMetaLines: [loc("١٠٠ جنيه", "100 EGP"), loc("جنيه · دولار · يورو · إسترليني", "EGP · USD · EUR · GBP")],
  footerShowStudio: true,
  footerIcons: [],
  payPhone: "01000000000",
  whatsappPhone: "01000000000",
};

export const DEFAULT_PROMO: PromoPopup = {
  live: false,
  text: loc("خصم ١٠٪ على طلبك الجاي.", "10% off your next order."),
  image: "",
  codes: [],
};

export const DEFAULT_CONTACT_FIELDS: ShopFormField[] = [
  { id: "name", key: "name", type: "text", required: true, enabled: true, label: loc("الاسم", "Name") },
  { id: "phone", key: "phone", type: "tel", required: true, enabled: true, label: loc("رقم الواتساب", "WhatsApp number") },
  { id: "email", key: "email", type: "email", required: false, enabled: true, label: loc("البريد", "Email") },
  { id: "notes", key: "notes", type: "textarea", required: false, enabled: true, label: loc("ملاحظات", "Notes") },
];

export const DEFAULT_CHECKOUT_FIELDS: ShopFormField[] = [
  { id: "name", key: "name", type: "text", required: true, enabled: true, label: loc("الاسم", "Name") },
  { id: "phone", key: "phone", type: "tel", required: true, enabled: true, label: loc("رقم الواتساب", "WhatsApp number") },
  { id: "address", key: "address", type: "text", required: true, enabled: true, label: loc("العنوان", "Address") },
  { id: "email", key: "email", type: "email", required: false, enabled: true, label: loc("البريد", "Email") },
  { id: "notes", key: "notes", type: "textarea", required: false, enabled: true, label: loc("ملاحظات", "Notes") },
];

export const DEFAULT_COMMERCE: Commerce = {
  shippingPrice: 80,
  shippingLabel: loc("الشحن", "Shipping"),
  shippingDetails: loc("التوصيل داخل مصر خلال ٢–٥ أيام عمل.", "Delivery in Egypt within 2–5 working days."),
  freeShippingMin: 500,
  contactEmail: "",
  contactFields: DEFAULT_CONTACT_FIELDS,
  checkoutFields: DEFAULT_CHECKOUT_FIELDS,
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
        imageHeight: 0,
        aspect: "5 / 2",
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
    slideshow: {
      id,
      type,
      visible: true,
      style: {
        background: "#0a2540",
        color: "#ffffff",
        fontSize: 32,
        paddingY: 0,
        align: "center",
        imageHeight: 0,
        aspect: "5 / 2",
        imagePlacement: "bleed",
        imageWidth: 100,
        imageRounded: false,
        intervalMs: 2000,
        showPrimaryCta: false,
        showSecondaryCta: false,
      },
      content: {
        galleryAr: [
          { src: "/products/white-tee-front.jpg", href: "/product/white-tee" },
          { src: "/products/thermal-tumbler.jpg", href: "/product/thermal-tumbler" },
          { src: "/products/wood-coaster.png", href: "/product/wood-coaster" },
        ],
        galleryEn: [
          { src: "/products/white-tee-front.jpg", href: "/product/white-tee" },
          { src: "/products/thermal-tumbler.jpg", href: "/product/thermal-tumbler" },
          { src: "/products/wood-coaster.png", href: "/product/wood-coaster" },
        ],
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
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 32, paddingY: 56, align: "start" },
      content: {
        title: loc("المنتجات", "Products"),
        body: loc("أضف قطع من الكتالوج.", "Add pieces from the catalog."),
        productSlugs: [],
        collection: "all",
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
  commerce: DEFAULT_COMMERCE,
  pages: [],
  sections: [
    newSection("hero"),
    newSection("collections"),
    newSection("products"),
    newSection("cta"),
    newSection("faq"),
  ].map((section, index) => {
    const id = ["hero", "collections", "products", "cta", "about"][index] ?? section.id;
    if (section.type !== "products") return { ...section, id };
    const { productSlugs: _unused, collection: _collection, ...content } = section.content;
    return {
      ...section,
      id,
      style: { ...section.style, align: "center", fontSize: 40 },
      content: {
        ...content,
        title: loc(" الاستوديو", "Staff picks"),
        body: loc(" الثلاثة  بسعر ١٠٠ جنيه.", "The three current pieces, 100 EGP each."),
      },
    };
  }),
};

export function migrateSection(section: SiteSection | Record<string, unknown>, index: number): SiteSection {
  const row = section as SiteSection & { content?: Record<string, unknown> };
  const type = (row.type as SectionType) || "text";
  const style = { ...(row.style ?? {}) };
  if ((type === "banner" || type === "slideshow") && (!style.aspect || style.aspect === "3 / 2")) {
    style.aspect = "5 / 2";
  }
  const migrated: SiteSection = {
    id: String(row.id || `section-${index}`),
    type,
    visible: row.visible !== false,
    style,
    content: migrateContent(row.content as Record<string, unknown>),
  };
  return fillMissingEnglish(migrated);
}

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
    imageHref: typeof src.imageHref === "string" ? src.imageHref : undefined,
    gallery: parseGalleryItems(src.gallery),
    galleryAr: parseGalleryItems(src.galleryAr).length ? parseGalleryItems(src.galleryAr) : parseGalleryItems(src.gallery),
    galleryEn: parseGalleryItems(src.galleryEn).length ? parseGalleryItems(src.galleryEn) : parseGalleryItems(src.gallery),
    productSlugs: Array.isArray(src.productSlugs)
      ? src.productSlugs.map((item) => String(item)).filter(Boolean)
      : undefined,
    collection: typeof src.collection === "string" ? src.collection : undefined,
  };
}

export function migrateSite(raw: unknown): SiteDocument {
  const data = (raw ?? {}) as {
    chrome?: Partial<SiteChrome>;
    promo?: Partial<PromoPopup> & { codes?: PromoCode[] | Array<Record<string, unknown>> };
    commerce?: Partial<Commerce> & { contactFields?: unknown; checkoutFields?: unknown };
    sections?: SiteSection[] | Array<Record<string, unknown>>;
    pages?: CmsPage[] | Array<Record<string, unknown>>;
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
          ? chrome.navLinks.map((link, index) => migrateNavLink(link, index))
          : DEFAULT_CHROME.navLinks,
      catalogSections:
        Array.isArray(chrome.catalogSections) && chrome.catalogSections.length
          ? chrome.catalogSections.map((section, index) => ({
              id: String(section.id || `section-${index}`),
              href: String(section.href || "/catalog"),
              image: String(section.image || ""),
              label: asLoc(section.label),
            }))
          : DEFAULT_CHROME.catalogSections,
      logo: typeof chrome.logo === "string" && chrome.logo.trim() ? chrome.logo.trim() : DEFAULT_CHROME.logo,
      footerLogo:
        typeof chrome.footerLogo === "string" && chrome.footerLogo.trim()
          ? chrome.footerLogo.trim()
          : typeof chrome.logo === "string" && chrome.logo.trim()
            ? chrome.logo.trim()
            : DEFAULT_CHROME.footerLogo,
      showFooter: chrome.showFooter !== false,
      footerTagline: fillLoc(asLoc(chrome.footerTagline, DEFAULT_CHROME.footerTagline.ar), DEFAULT_CHROME.footerTagline) ?? DEFAULT_CHROME.footerTagline,
      footerBlurb: fillLoc(asLoc(chrome.footerBlurb, DEFAULT_CHROME.footerBlurb.ar), DEFAULT_CHROME.footerBlurb) ?? DEFAULT_CHROME.footerBlurb,
      footerShopTitle:
        fillLoc(asLoc(chrome.footerShopTitle, DEFAULT_CHROME.footerShopTitle.ar), DEFAULT_CHROME.footerShopTitle) ??
        DEFAULT_CHROME.footerShopTitle,
      footerMetaTitle:
        fillLoc(asLoc(chrome.footerMetaTitle, DEFAULT_CHROME.footerMetaTitle.ar), DEFAULT_CHROME.footerMetaTitle) ??
        DEFAULT_CHROME.footerMetaTitle,
      footerMetaLines: Array.isArray(chrome.footerMetaLines) && chrome.footerMetaLines.length
        ? chrome.footerMetaLines.map((line) => asLoc(line))
        : DEFAULT_CHROME.footerMetaLines,
      footerShowStudio: chrome.footerShowStudio !== false,
      footerIcons: Array.isArray(chrome.footerIcons)
        ? chrome.footerIcons.map((item, index) => ({
            id: String(item.id || `icon-${index}`),
            icon: String(item.icon || "instagram"),
            href: String(item.href || ""),
            label: asLoc(item.label),
          }))
        : [],
      payPhone: typeof chrome.payPhone === "string" && chrome.payPhone.trim() ? chrome.payPhone.trim() : DEFAULT_CHROME.payPhone,
      whatsappPhone:
        typeof chrome.whatsappPhone === "string" && chrome.whatsappPhone.trim()
          ? chrome.whatsappPhone.trim()
          : typeof chrome.payPhone === "string" && chrome.payPhone.trim()
            ? chrome.payPhone.trim()
            : DEFAULT_CHROME.whatsappPhone,
    },
    promo: {
      live: Boolean(promo.live),
      text: fillLoc(asLoc(promo.text, DEFAULT_PROMO.text.ar), DEFAULT_PROMO.text) ?? DEFAULT_PROMO.text,
      image: typeof promo.image === "string" ? promo.image : "",
      codes: Array.isArray(promo.codes)
        ? promo.codes
            .map((row, index) => {
              const item = row as PromoCode;
              const code = String(item.code || "").trim().toUpperCase();
              if (!code) return null;
              return {
                id: String(item.id || `code-${index}`),
                code,
                percent: Math.min(100, Math.max(1, Number(item.percent) || 10)),
                active: item.active !== false,
              } satisfies PromoCode;
            })
            .filter((item): item is PromoCode => Boolean(item))
        : [],
    },
    commerce: migrateCommerce(data.commerce),
    sections: Array.isArray(data.sections)
      ? data.sections.map((section, index) => migrateSection(section, index))
      : DEFAULT_SITE.sections,
    pages: Array.isArray(data.pages)
      ? data.pages
          .map((page, index) => {
            const row = page as CmsPage & { sections?: Array<Record<string, unknown>> };
            const slug = pageSlugify(String(row.slug || row.title?.en || row.title?.ar || `page-${index}`));
            if (!slug || RESERVED_PAGE_SLUGS.has(slug)) return null;
            return {
              id: String(row.id || `page-${index}`),
              slug,
              title: asLoc(row.title, slug),
              visible: row.visible !== false,
              sections: Array.isArray(row.sections) ? row.sections.map((section, i) => migrateSection(section, i)) : [],
            } satisfies CmsPage;
          })
          .filter((page): page is CmsPage => Boolean(page))
      : [],
  };
}

function migrateNavLink(link: Partial<NavLink> | undefined, index: number): NavLink {
  const row = link ?? {};
  return {
    id: String(row.id || `link-${index}`),
    href: normalizeNavHref(String(row.href || "/")),
    label: asLoc(row.label),
    visible: row.visible !== false,
    children: Array.isArray(row.children)
      ? row.children.map((child, childIndex) => migrateNavLink(child, childIndex))
      : undefined,
  };
}

function migrateFormFields(value: unknown, fallback: ShopFormField[]): ShopFormField[] {
  if (!Array.isArray(value) || !value.length) return fallback;
  return value.map((row, index) => {
    const item = row as ShopFormField;
    const type = item.type === "email" || item.type === "tel" || item.type === "textarea" ? item.type : "text";
    return {
      id: String(item.id || item.key || `field-${index}`),
      key: String(item.key || item.id || `field-${index}`),
      label: asLoc(item.label, String(item.key || "Field")),
      type,
      required: Boolean(item.required),
      enabled: item.enabled !== false,
    };
  });
}

function migrateCommerce(raw: Partial<Commerce> | undefined): Commerce {
  const src = raw ?? {};
  return {
    shippingPrice: Math.max(0, Number(src.shippingPrice) || DEFAULT_COMMERCE.shippingPrice),
    shippingLabel:
      fillLoc(asLoc(src.shippingLabel, DEFAULT_COMMERCE.shippingLabel.ar), DEFAULT_COMMERCE.shippingLabel) ??
      DEFAULT_COMMERCE.shippingLabel,
    shippingDetails:
      fillLoc(asLoc(src.shippingDetails, DEFAULT_COMMERCE.shippingDetails.ar), DEFAULT_COMMERCE.shippingDetails) ??
      DEFAULT_COMMERCE.shippingDetails,
    freeShippingMin:
      src.freeShippingMin === undefined || src.freeShippingMin === null
        ? DEFAULT_COMMERCE.freeShippingMin
        : Math.max(0, Number(src.freeShippingMin) || 0),
    contactEmail: typeof src.contactEmail === "string" ? src.contactEmail.trim() : "",
    contactFields: migrateFormFields(src.contactFields, DEFAULT_CONTACT_FIELDS),
    checkoutFields: migrateFormFields(src.checkoutFields, DEFAULT_CHECKOUT_FIELDS),
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
