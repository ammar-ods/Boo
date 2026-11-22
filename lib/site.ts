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
  | "marquee"
  | "bundles"
  | "suggestions"
  | "giftsets";

export type Localized = { ar: string; en: string };

export type ImagePlacement = "hidden" | "below" | "bleed" | "cover" | "start" | "end";

export type SectionStyle = {
  background?: string;
  color?: string;
  fontSize?: number;
  paddingY?: number;
  paddingTop?: number;
  paddingBottom?: number;
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
  cardRounded?: boolean;
  intervalMs?: number;
  aspect?: string;
  blockWidth?: number;
  minHeight?: number;
  marginX?: number;
  marginY?: number;
  marginTop?: number;
  marginBottom?: number;
  rounded?: boolean;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
};

export type GalleryItem = {
  src: string;
  srcMobile?: string;
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
  imageMobile?: Localized;
  imageHref?: string;
  gallery?: GalleryItem[];
  galleryAr?: GalleryItem[];
  galleryEn?: GalleryItem[];
  productSlugs?: string[];
  collection?: string;
  tiles?: { title: Localized; body: Localized }[];
  boxBadge?: Localized;
  boxTitle?: Localized;
  boxPrice?: Localized;
  boxBody?: Localized;
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
  clickable?: boolean;
  children?: NavLink[];
};

export type CatalogSection = {
  id: string;
  href: string;
  image: string;
  label: Localized;
  visible?: boolean;
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
  showDiscipline: boolean;
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
  footerShowNav: boolean;
  footerBg: string;
  footerText: string;
  footerIcons: FooterIcon[];
  payPhone: string;
  whatsappPhone: string;
  contactWaShape: "pill" | "rounded" | "square";
  contactWaSize: "sm" | "md" | "lg";
  contactWaIcon: string;
  fontEn: string;
  fontAr: string;
  navFontSize: number;
  announcementFontSize: number;
  footerFontSize: number;
  shopAllLabel: Localized;
  shopCustomLabel: Localized;
  copy: StorefrontCopy;
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

export const COMMERCE_COPY_KEYS = [
  "cart",
  "emptyCart",
  "continue",
  "yourOrder",
  "yourBag",
  "bagItems",
  "subtotal",
  "total",
  "proceedCheckout",
  "checkout",
  "payment",
  "paymentTitle",
  "paymentSafe",
  "payCod",
  "payCodBody",
  "payCodCustom",
  "payOnline",
  "payOnlineBody",
  "payOnlineHint",
  "payOnlineFast",
  "transferPhone",
  "receipt",
  "receiptHint",
  "placeOrder",
  "promoCode",
  "apply",
  "freeShipping",
  "shipping",
  "leaveCheckout",
  "leaveCheckoutBody",
  "stayCheckout",
  "confirmLeave",
  "expressHint",
  "discount",
  "freeShipProgress",
  "freeShipRemaining",
  "freeShipUnlocked",
  "customFilter",
  "cartSuggestTitle",
  "cartSuggestShipping",
] as const;

export type CommerceCopyKey = (typeof COMMERCE_COPY_KEYS)[number];
export type CommerceCopy = Record<CommerceCopyKey, Localized>;

export const STOREFRONT_COPY_KEYS = [
  "giftSetsEyebrow",
  "giftSetsTitle",
  "giftSetsBody",
  "giftSetsMatchTitle",
  "giftSetsMatchBody",
  "giftSetsSaveTitle",
  "giftSetsSaveBody",
  "giftSetsCardTitle",
  "giftSetsCardBody",
  "giftSetsCta",
  "giftSetsBoxBadge",
  "giftSetsBoxTitle",
  "giftSetsBoxPrice",
  "giftSetsBoxBody",
  "howToEyebrow",
  "howToTitle",
  "howToBody",
  "howTo1n",
  "howTo1title",
  "howTo1body",
  "howTo2n",
  "howTo2title",
  "howTo2body",
  "howTo3n",
  "howTo3title",
  "howTo3body",
  "shopByOccasion",
  "sections",
  "sectionsTitle",
  "sectionsBody",
  "quickWhatsApp",
  "searchPlaceholder",
  "search",
  "catalogTitle",
  "catalogBody",
  "contactTitle",
  "contactBody",
  "send",
  "bundlesTitle",
  "bundlesBody",
  "customizeName",
  "addToCart",
  "readyToShip",
  "sortBy",
  "sortFeatured",
  "sortName",
  "sortPriceLow",
  "showMore",
  "showingPieces",
  "viewCart",
  "estimatedTotal",
  "color",
  "quantity",
  "remove",
  "dimensions",
  "studio",
  "chatWhatsApp",
  "thankYou",
  "thankBody",
  "backShop",
  "home",
  "customize",
  "layoutGrid",
  "layoutList",
] as const;

export type StorefrontCopyKey = (typeof STOREFRONT_COPY_KEYS)[number];
export type StorefrontCopy = Record<StorefrontCopyKey, Localized>;
export type CopyKey = CommerceCopyKey | StorefrontCopyKey;

export type Commerce = {
  shippingPrice: number;
  shippingLabel: Localized;
  shippingDetails: Localized;
  freeShippingMin: number;
  contactEmail: string;
  contactFields: ShopFormField[];
  checkoutFields: ShopFormField[];
  codBlockCustom?: boolean;
  expressEnabled?: boolean;
  expressPrice?: number;
  expressLabel: Localized;
  copy: CommerceCopy;
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

export const APP_CMS_SLUGS = new Set(["bundles", "cart"]);

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
  "invoice",
]);

export function pageSlugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function cmsPagePath(slug: string) {
  if (APP_CMS_SLUGS.has(slug)) return `/${slug}`;
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
  if (pathname === "/bundles") return "bundles";
  if (pathname === "/cart") return "cart";
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
  { type: "bundles", label: "Bundles", labelAr: "باقات" },
  { type: "suggestions", label: "Suggestions", labelAr: "اقتراحات" },
  { type: "giftsets", label: "Gift sets", labelAr: "مجموعات الهدايا" },
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
    key === "#f4f3f0" ||
    key === "#f5f3ef" ||
    key === "#eceae6"
  );
}

function isThemeCardFill(value?: string) {
  const key = (value || "").trim().toLowerCase();
  return key === "#ffffff" || key === "#fff" || key === "var(--card)";
}

function isThemeChipFill(value?: string) {
  const key = (value || "").trim().toLowerCase();
  return key === "#ede6d2" || key === "#eae8e4" || key === "#eceae6" || key === "var(--chip)" || key === "var(--muted)";
}

export function isThemeInk(value?: string) {
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
        : isThemeChipFill(background)
          ? "var(--chip)"
          : background,
    color: isThemeInk(color) ? "var(--foreground)" : color,
  };
}

export function parseGalleryItems(value: unknown): GalleryItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { src: item };
      if (item && typeof item === "object") {
        const row = item as GalleryItem;
        const src = typeof row.src === "string" ? row.src : "";
        const srcMobile = typeof row.srcMobile === "string" && row.srcMobile.trim() ? row.srcMobile : undefined;
        const href = typeof row.href === "string" ? row.href : undefined;
        if (!src && !srcMobile) return null;
        return { src, href, srcMobile };
      }
      return null;
    })
    .filter((item): item is GalleryItem => Boolean(item && (item.src || item.srcMobile)));
}

export function sectionViewportClass(style: SectionStyle | undefined, editing = false) {
  if (editing) return "";
  const mobile = style?.showOnMobile !== false;
  const desktop = style?.showOnDesktop !== false;
  if (mobile && desktop) return "";
  if (!mobile && !desktop) return "hidden";
  if (!mobile) return "hidden md:block";
  return "md:hidden";
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

export const DEFAULT_STOREFRONT_COPY: StorefrontCopy = {
  giftSetsEyebrow: loc("مجموعات الهدايا الكاملة", "Complete gift sets"),
  giftSetsTitle: loc("جهّز هدية كاملة بالتصميم اللي تختاره", "Build a full gift with the design you choose"),
  giftSetsBody: loc(
    "شنطة، ميدالية، مج وكوستر في مجموعة واحدة متناسقة باسم وتصميم من تحب، مجهزة بكرتونة إهداء جاهزة للتقديم.",
    "A coordinated set with the name and design you love, packed ready to give.",
  ),
  giftSetsMatchTitle: loc("تطابق وتناسق كامل", "Fully coordinated"),
  giftSetsMatchBody: loc("نفس الثيم على كل المحتويات", "The same theme on every piece"),
  giftSetsSaveTitle: loc("سعر أوفر من المفرد", "Better than buying singles"),
  giftSetsSaveBody: loc("خصومات على الباقات", "Exclusive bundle pricing"),
  giftSetsCardTitle: loc("كارت إهداء مجاني", "Free gift card"),
  giftSetsCardBody: loc("مكتوب فيه رسالتك", "Your message written inside"),
  giftSetsCta: loc("اختار مجموعة الهدايا", "Choose a gift set"),
  giftSetsBoxBadge: loc("بوكس التميز الأكثر طلباً", "Most requested gift box"),
  giftSetsBoxTitle: loc("طقم الإهداء المتكامل", "Complete gifting set"),
  giftSetsBoxPrice: loc("عرض خاص", "Special offer"),
  giftSetsBoxBody: loc("حفر مخصص للاسم على محتويات الصندوق مع تغليف أنيق.", "Custom name engraving on every piece, with elegant wrapping."),
  howToEyebrow: loc("بكل بساطة", "Simple and flexible"),
  howToTitle: loc("كيف تطلب هديتك المخصصة؟", "How to order a custom gift"),
  howToBody: loc("ثلاث خطوات سريعة تصنع بها ذكرى لمن تحب.", "Three short steps to make a piece for someone you love."),
  howTo1n: loc("١", "1"),
  howTo1title: loc("اختار منتجك وتصميمه", "Pick the product and design"),
  howTo1body: loc("تصفح الكتالوج وحدد نوع المنتج المناسب لمناسبتك.", "Browse the shop and choose the piece that fits the occasion."),
  howTo2n: loc("٢", "2"),
  howTo2title: loc("أرسل الأسماء والتفاصيل", "Send names and details"),
  howTo2body: loc("اكتب الأسماء والتواريخ أو ارفع الصور عشان نحضّر البروفة.", "Add names, dates, or photos so we can prepare a proof."),
  howTo3n: loc("٣", "3"),
  howTo3title: loc("استلم هديتك لباب بيتك", "Receive it at your door"),
  howTo3body: loc("ننّفذ الطلب ونتغلفه، ويوصلك في محافظات مصر.", "We make it, wrap it, and ship it across Egypt."),
  shopByOccasion: loc("تسوّق حسب المناسبة", "Shop by occasion"),
  sections: loc("الأقسام", "Sections"),
  sectionsTitle: loc("أقسام الهدايا والتصميمات", "Gift and design sections"),
  sectionsBody: loc("اختار القسم المناسب لمناسبتك واستكشف خيارات التخصيص.", "Pick the section for your occasion and explore customization options."),
  quickWhatsApp: loc("واتساب الدعم السريع", "Quick WhatsApp support"),
  searchPlaceholder: loc("ابحث عن منتج أو قسم...", "Search a product or collection..."),
  search: loc("بحث", "Search"),
  catalogTitle: loc("المتجر", "Shop"),
  catalogBody: loc("تيشيرت، مج حراري، وكوستر٠.", "Tee, tumbler, and wood coaster."),
  contactTitle: loc("تواصل معنا", "Contact us"),
  contactBody: loc("اكتب لنا طلب خاص أو سؤال، وهنرد عليك على الواتساب.", "Send a custom request or a question. We reply on WhatsApp."),
  send: loc("إرسال", "Send"),
  bundlesTitle: loc("الباقات", "Bundles"),
  bundlesBody: loc("اختار باقة جاهزة وضيفها للسلة بسعر واحد.", "Ready packs at a single price. Add the set to your bag."),
  customizeName: loc("تخصيص بالاسم والطلب", "Customize and order"),
  addToCart: loc("أضف للسلة", "Add to cart"),
  readyToShip: loc("جاهز للشحن", "Ready to ship"),
  sortBy: loc("ترتيب", "Sort by"),
  sortFeatured: loc("مميز", "Featured"),
  sortName: loc("الاسم", "Name"),
  sortPriceLow: loc("السعر: من الأقل للأعلى", "Price: low to high"),
  showMore: loc("عرض المزيد", "Show more"),
  showingPieces: loc("عرض {shown} من {total} قطعة", "Showing {shown} of {total} curated pieces"),
  viewCart: loc("عرض السلة", "View cart"),
  estimatedTotal: loc("الإجمالي", "Estimated total"),
  color: loc("اللون", "Color"),
  quantity: loc("الكمية", "Quantity"),
  remove: loc("حذف", "Remove"),
  dimensions: loc("الأبعاد", "Dimensions"),
  studio: loc("مكتب الاستوديو", "Studio desk"),
  chatWhatsApp: loc("كلمنا على واتساب", "Chat on WhatsApp"),
  thankYou: loc("شكرًا لطلبك", "Thank you"),
  thankBody: loc("استلمنا طلبك وهنتواصل معاك لتأكيد التوصيل.", "We received your order and will confirm delivery shortly."),
  backShop: loc("رجوع للمتجر", "Back to shop"),
  home: loc("الرئيسية", "Home"),
  customize: loc("ارفع التصميم", "Upload artwork"),
  layoutGrid: loc("شبكة", "Grid"),
  layoutList: loc("قائمة", "List"),
};

export const DEFAULT_CHROME: SiteChrome = {
  showAnnouncement: true,
  announcement: loc("شحن داخل مصر · كل القطع بـ ١٠٠ جنيه", "Shipping in Egypt · every piece is 100 EGP"),
  showHeader: true,
  showNav: true,
  showDiscipline: true,
  navLinks: [
    { id: "shop", href: "/catalog", label: loc("المتجر", "Shop"), visible: true },
    { id: "bundles", href: "/bundles", label: loc("الباقات", "Bundles"), visible: true },
    { id: "contact", href: "/contact", label: loc("تواصل معنا", "Contact"), visible: true },
  ],
  catalogSections: [
    {
      id: "apparel",
      href: "/p/apparel",
      image: "",
      label: loc("ملابس", "Apparel"),
      visible: true,
    },
    {
      id: "drinkware",
      href: "/p/drinkware",
      image: "/products/thermal-tumbler.jpg",
      label: loc("مشروبات", "Drinkware"),
      visible: true,
    },
    {
      id: "wood",
      href: "/p/wood",
      image: "/products/wood-coaster.png",
      label: loc("خشب", "Laser Cut Wood"),
      visible: true,
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
  footerShowNav: true,
  footerBg: "#121214",
  footerText: "#ffffff",
  footerIcons: [],
  payPhone: "01000000000",
  whatsappPhone: "01000000000",
  contactWaShape: "pill",
  contactWaSize: "lg",
  contactWaIcon: "whatsapp",
  fontEn: "jakarta",
  fontAr: "ibm-plex-arabic",
  navFontSize: 13,
  announcementFontSize: 11,
  footerFontSize: 14,
  shopAllLabel: loc("الكل", "All"),
  shopCustomLabel: loc("مخصص", "Custom"),
  copy: DEFAULT_STOREFRONT_COPY,
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

export const DEFAULT_COMMERCE_COPY: CommerceCopy = {
  cart: loc("السلة", "Cart"),
  emptyCart: loc("السلة فاضية.", "Your bag is empty."),
  continue: loc("كمّل التسوق", "Continue shopping"),
  yourOrder: loc("طلبك", "Your order"),
  yourBag: loc("سلتك", "Your bag"),
  bagItems: loc("قطع", "items"),
  subtotal: loc("المجموع", "Subtotal"),
  total: loc("الإجمالي", "Total"),
  proceedCheckout: loc("إتمام الشراء", "Proceed to checkout"),
  checkout: loc("إتمام الطلب", "Checkout"),
  payment: loc("طريقة الدفع", "Payment"),
  paymentTitle: loc("اختر طريقة الدفع المناسبة", "Choose a payment method"),
  paymentSafe: loc("جميع الطرق آمنة 100%", "All methods are 100% secure"),
  payCod: loc("الدفع عند الاستلام (COD)", "Cash on delivery (COD)"),
  payCodBody: loc(
    "يتم سداد دفعة تأكيد حفر الاسم بقيمة 100 ج.م مسبقاً والباقي مع المندوب",
    "A 100 EGP name-engraving confirmation is paid first; the rest is paid to the courier.",
  ),
  payCodCustom: loc("الطلبات المخصصة لازم تُدفع أونلاين", "Custom orders must pay online"),
  payOnline: loc("المحافظ الإلكترونية و InstaPay", "E-wallets & InstaPay"),
  payOnlineBody: loc(
    "فودافون كاش، أورنج كاش، اتصالات كاش، وي باي، انستاباي",
    "Vodafone Cash, Orange Cash, Etisalat Cash, WE Pay, InstaPay",
  ),
  payOnlineHint: loc(
    "حوّل على الرقم ده، بعدين اكتب رقم التحويل وارفع صورة الإيصال.",
    "Transfer to this number, then enter the sending phone and upload the receipt.",
  ),
  payOnlineFast: loc("الأسرع اعتماداً", "Fastest approval"),
  transferPhone: loc("رقم التحويل", "Transfer phone number"),
  receipt: loc("صورة الإيصال", "Receipt photo"),
  receiptHint: loc("PNG أو JPG", "PNG or JPG"),
  placeOrder: loc("أكد الطلب", "Place order"),
  promoCode: loc("كود الخصم", "Promo code"),
  apply: loc("تطبيق", "Apply"),
  freeShipping: loc("شحن مجاني", "Free shipping"),
  shipping: loc("الشحن", "Shipping"),
  leaveCheckout: loc("مغادرة الدفع؟", "Leave checkout?"),
  leaveCheckoutBody: loc(
    "لو خرجت دلوقتي، البيانات اللي كتبتها في الفورم هتتمسح.",
    "If you leave now, the details you entered on this form will be lost.",
  ),
  stayCheckout: loc("البقاء", "Stay"),
  confirmLeave: loc("مغادرة", "Leave"),
  expressHint: loc("توصيل أسرع مقابل رسوم إضافية.", "Faster delivery for an extra fee."),
  discount: loc("الخصم", "Discount"),
  freeShipProgress: loc(
    "أحسنت! أضفت منتجات بقيمة {added} — باقي لك {remaining} فقط وتستمتع بالشحن المجاني! 🎉",
    "Nice! You added {added} — add {remaining} more for free shipping! 🎉",
  ),
  freeShipRemaining: loc("متبقي {percent}% للوصول للشحن المجاني", "{percent}% left to free shipping"),
  freeShipUnlocked: loc("وصلت للشحن المجاني! 🎉", "You unlocked free shipping! 🎉"),
  customFilter: loc("مخصص", "Custom"),
  cartSuggestTitle: loc("منتجات مشابهة للي في السلة", "Similar to what’s in your bag"),
  cartSuggestShipping: loc(
    "أضف منتج بالسعر ده أو أقل عشان توصل للشحن المجاني",
    "Add one of these at this price or less to unlock free shipping",
  ),
};

export const DEFAULT_COMMERCE: Commerce = {
  shippingPrice: 80,
  shippingLabel: loc("الشحن", "Shipping"),
  shippingDetails: loc("التوصيل داخل مصر خلال ٢–٥ أيام عمل.", "Delivery in Egypt within 2–5 working days."),
  freeShippingMin: 500,
  contactEmail: "",
  contactFields: DEFAULT_CONTACT_FIELDS,
  checkoutFields: DEFAULT_CHECKOUT_FIELDS,
  codBlockCustom: true,
  expressEnabled: true,
  expressPrice: 120,
  expressLabel: loc("طلب سريع", "Express order"),
  copy: DEFAULT_COMMERCE_COPY,
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
        eyebrow: loc("", ""),
        title: loc("", ""),
        body: loc("", ""),
        ctaLabel: loc("", ""),
        ctaHref: "",
        secondaryCtaLabel: loc("", ""),
        secondaryCtaHref: "",
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
        paddingY: 0,
        paddingTop: 0,
        paddingBottom: 0,
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
        eyebrow: loc("", ""),
        title: loc("", ""),
        body: loc("", ""),
        ctaLabel: loc("", ""),
        ctaHref: "",
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
        galleryAr: [],
        galleryEn: [],
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
        title: loc("", ""),
        body: loc("", ""),
      },
    },
    products: {
      id,
      type,
      visible: true,
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 32, paddingY: 56, align: "start" },
      content: {
        title: loc("", ""),
        body: loc("", ""),
        productSlugs: [],
        collection: "all",
      },
    },
    collections: {
      id,
      type,
      visible: true,
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 40, paddingY: 40, align: "center" },
      content: { title: loc("", "") },
    },
    cta: {
      id,
      type,
      visible: true,
      style: { background: "#0a2540", color: "#ffffff", fontSize: 32, paddingY: 48, align: "start" },
      content: {
        eyebrow: loc("", ""),
        title: loc("", ""),
        body: loc("", ""),
        ctaLabel: loc("", ""),
        ctaHref: "",
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
        title: loc("", ""),
        gallery: [],
      },
    },
    faq: {
      id,
      type,
      visible: true,
      style: { background: "#ffffff", color: "#0a2540", fontSize: 28, paddingY: 56, align: "start" },
      content: {
        title: loc("", ""),
        body: loc("", ""),
      },
    },
    bundles: {
      id,
      type,
      visible: true,
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 40, paddingY: 48, align: "start" },
      content: {
        title: loc("", ""),
        body: loc("", ""),
      },
    },
    suggestions: {
      id,
      type,
      visible: true,
      style: {
        background: "#ffffff",
        color: "#0a2540",
        fontSize: 16,
        paddingY: 24,
        align: "start",
        cardRounded: true,
        imageRounded: true,
        imagePlacement: "hidden",
        showPrimaryCta: false,
        showSecondaryCta: false,
        rounded: false,
      },
      content: {
        eyebrow: loc("", ""),
        title: loc("ممكن كمان يعجبك", "You might also like"),
        body: loc(
          "أضف منتج بالسعر ده أو أقل عشان توصل للشحن المجاني",
          "Add one of these at this price or less to unlock free shipping",
        ),
        ctaLabel: loc("", ""),
        ctaHref: "/catalog",
        secondaryCtaLabel: loc("", ""),
        secondaryCtaHref: "",
        image: loc("", ""),
        imageMobile: loc("", ""),
        imageHref: "",
        gallery: [],
        productSlugs: [],
      },
    },
    giftsets: {
      id,
      type,
      visible: true,
      style: {
        background: "#f5f3ef",
        color: "#0a2540",
        fontSize: 44,
        paddingY: 56,
        align: "start",
        imagePlacement: "hidden",
        imageRounded: true,
        showPrimaryCta: true,
        showSecondaryCta: true,
        ctaBackground: "#C59B27",
        ctaColor: "#0a2540",
      },
      content: {
        eyebrow: loc("مجموعات الهدايا الكاملة", "Complete gift sets"),
        title: loc("جهّز هدية كاملة بالتصميم اللي تختاره", "Build a full gift with the design you choose"),
        body: loc(
          "شنطة، ميدالية، مج وكوستر في مجموعة واحدة متناسقة باسم وتصميم من تحب، مجهزة بكرتونة إهداء جاهزة للتقديم.",
          "A coordinated set with the name and design you love, packed ready to give.",
        ),
        ctaLabel: loc("اختار مجموعة الهدايا", "Choose a gift set"),
        ctaHref: "/bundles",
        secondaryCtaLabel: loc("واتساب", "WhatsApp"),
        secondaryCtaHref: "",
        image: loc("", ""),
        imageMobile: loc("", ""),
        imageHref: "",
        gallery: [],
        tiles: [
          {
            title: loc("تطابق وتناسق كامل", "Fully coordinated"),
            body: loc("نفس الثيم على كل المحتويات", "The same theme on every piece"),
          },
          {
            title: loc("سعر أوفر من المفرد", "Better than buying singles"),
            body: loc("خصومات على الباقات", "Exclusive bundle pricing"),
          },
          {
            title: loc("كارت إهداء مجاني", "Free gift card"),
            body: loc("مكتوب فيه رسالتك", "Your message written inside"),
          },
        ],
        boxBadge: loc("بوكس التميز الأكثر طلباً", "Most requested gift box"),
        boxTitle: loc("طقم الإهداء المتكامل", "Complete gifting set"),
        boxPrice: loc("عرض خاص", "Special offer"),
        boxBody: loc(
          "حفر مخصص للاسم على محتويات الصندوق مع تغليف أنيق.",
          "Custom name engraving on every piece, with elegant wrapping.",
        ),
      },
    },
  };
  return defaults[type];
}

export const DEFAULT_BUNDLES_PAGE: CmsPage = {
  id: "page-bundles",
  slug: "bundles",
  title: loc("الباقات", "Bundles"),
  visible: true,
  sections: [
    {
      id: "bundles-grid",
      type: "bundles",
      visible: true,
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 48, paddingY: 48, align: "start" },
      content: {
        title: loc("الباقات", "Bundles"),
        body: loc("اختار باقة جاهزة وضيفها للسلة بسعر واحد.", "Ready packs at a single price. Add the set to your bag."),
      },
    },
  ],
};

export const DEFAULT_CART_PAGE: CmsPage = {
  id: "page-cart",
  slug: "cart",
  title: loc("السلة", "Cart"),
  visible: true,
  sections: [
    {
      id: "cart-suggestions",
      type: "suggestions",
      visible: true,
      style: {
        background: "#ffffff",
        color: "#0a2540",
        fontSize: 16,
        paddingY: 24,
        align: "start",
        cardRounded: true,
        imageRounded: true,
        imagePlacement: "hidden",
        showPrimaryCta: false,
        showSecondaryCta: false,
        rounded: false,
      },
      content: {
        title: loc("ممكن كمان يعجبك", "You might also like"),
        body: loc(
          "أضف منتج بالسعر ده أو أقل عشان توصل للشحن المجاني",
          "Add one of these at this price or less to unlock free shipping",
        ),
        productSlugs: [],
      },
    },
  ],
};

export const DEFAULT_SITE: SiteDocument = {
  chrome: DEFAULT_CHROME,
  promo: DEFAULT_PROMO,
  commerce: DEFAULT_COMMERCE,
  pages: [DEFAULT_BUNDLES_PAGE, DEFAULT_CART_PAGE],
  sections: [
    newSection("hero"),
    newSection("collections"),
    newSection("products"),
    newSection("giftsets"),
    newSection("cta"),
    newSection("faq"),
  ].map((section, index) => {
    const id = ["hero", "collections", "products", "giftsets", "cta", "about"][index] ?? section.id;
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
  if (type === "suggestions") {
    const fill = (style.background || "").trim().toLowerCase();
    if (
      !fill ||
      fill === "#f6f3ea" ||
      fill === "#ede6d2" ||
      fill === "var(--background)" ||
      fill === "var(--cream)" ||
      fill === "var(--chip)"
    ) {
      style.background = "#ffffff";
    }
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
    imageMobile: src.imageMobile ? asLoc(src.imageMobile) : undefined,
    imageHref: typeof src.imageHref === "string" ? src.imageHref : undefined,
    gallery: parseGalleryItems(src.gallery),
    galleryAr: parseGalleryItems(src.galleryAr).length ? parseGalleryItems(src.galleryAr) : parseGalleryItems(src.gallery),
    galleryEn: parseGalleryItems(src.galleryEn).length ? parseGalleryItems(src.galleryEn) : parseGalleryItems(src.gallery),
    productSlugs: Array.isArray(src.productSlugs)
      ? src.productSlugs.map((item) => String(item)).filter(Boolean)
      : undefined,
    collection: typeof src.collection === "string" ? src.collection : undefined,
    tiles: parseTiles(src.tiles),
    boxBadge: src.boxBadge ? asLoc(src.boxBadge) : undefined,
    boxTitle: src.boxTitle ? asLoc(src.boxTitle) : undefined,
    boxPrice: src.boxPrice ? asLoc(src.boxPrice) : undefined,
    boxBody: src.boxBody ? asLoc(src.boxBody) : undefined,
  };
}

function parseTiles(value: unknown): { title: Localized; body: Localized }[] | undefined {
  if (!Array.isArray(value) || !value.length) return undefined;
  return value.map((row) => {
    const item = (row ?? {}) as { title?: unknown; body?: unknown };
    return { title: asLoc(item.title), body: asLoc(item.body) };
  });
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
      showDiscipline: chrome.showDiscipline !== false,
      navLinks: Array.isArray(chrome.navLinks)
          ? chrome.navLinks.map((link, index) => migrateNavLink(link, index))
          : DEFAULT_CHROME.navLinks,
      catalogSections: Array.isArray(chrome.catalogSections)
        ? chrome.catalogSections.map((section, index) => ({
            id: String(section.id || `section-${index}`),
            href: String(section.href || "/catalog"),
            image: String(section.image || ""),
            label: asLoc(section.label),
            visible: (section as CatalogSection).visible !== false,
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
      footerShowNav: chrome.footerShowNav !== false,
      footerBg: typeof chrome.footerBg === "string" && chrome.footerBg.trim() ? chrome.footerBg.trim() : DEFAULT_CHROME.footerBg,
      footerText: typeof chrome.footerText === "string" && chrome.footerText.trim() ? chrome.footerText.trim() : DEFAULT_CHROME.footerText,
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
      contactWaShape:
        chrome.contactWaShape === "rounded" || chrome.contactWaShape === "square" ? chrome.contactWaShape : "pill",
      contactWaSize: chrome.contactWaSize === "sm" || chrome.contactWaSize === "md" ? chrome.contactWaSize : "lg",
      contactWaIcon:
        typeof chrome.contactWaIcon === "string" && chrome.contactWaIcon.trim()
          ? chrome.contactWaIcon.trim()
          : DEFAULT_CHROME.contactWaIcon,
      fontEn: typeof chrome.fontEn === "string" && chrome.fontEn.trim() ? chrome.fontEn.trim() : DEFAULT_CHROME.fontEn,
      fontAr: typeof chrome.fontAr === "string" && chrome.fontAr.trim() ? chrome.fontAr.trim() : DEFAULT_CHROME.fontAr,
      navFontSize: Math.min(28, Math.max(10, Number(chrome.navFontSize) || DEFAULT_CHROME.navFontSize)),
      announcementFontSize: Math.min(22, Math.max(9, Number(chrome.announcementFontSize) || DEFAULT_CHROME.announcementFontSize)),
      footerFontSize: Math.min(24, Math.max(10, Number(chrome.footerFontSize) || DEFAULT_CHROME.footerFontSize)),
      shopAllLabel:
        fillLoc(asLoc(chrome.shopAllLabel, DEFAULT_CHROME.shopAllLabel.ar), DEFAULT_CHROME.shopAllLabel) ??
        DEFAULT_CHROME.shopAllLabel,
      shopCustomLabel:
        fillLoc(asLoc(chrome.shopCustomLabel, DEFAULT_CHROME.shopCustomLabel.ar), DEFAULT_CHROME.shopCustomLabel) ??
        DEFAULT_CHROME.shopCustomLabel,
      copy: migrateStorefrontCopy((chrome as SiteChrome).copy),
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
      ? migrateHomeGiftsets(data.sections.map((section, index) => migrateSection(section, index)))
      : DEFAULT_SITE.sections,
    pages: migratePages(data.pages),
  };
}

function migrateHomeGiftsets(sections: SiteSection[]): SiteSection[] {
  if (sections.some((section) => section.type === "giftsets")) return sections;
  const gift = migrateSection(newSection("giftsets"), sections.length);
  const idx = sections.findLastIndex((section) => section.type === "products");
  if (idx < 0) return [...sections, gift];
  return [...sections.slice(0, idx + 1), gift, ...sections.slice(idx + 1)];
}

function migratePages(raw: CmsPage[] | Array<Record<string, unknown>> | undefined): CmsPage[] {
  const pages = Array.isArray(raw)
    ? raw
        .map((page, index) => {
          const row = page as CmsPage & { sections?: Array<Record<string, unknown>> };
          const slug = pageSlugify(String(row.slug || row.title?.en || row.title?.ar || `page-${index}`));
          if (!slug) return null;
          if (RESERVED_PAGE_SLUGS.has(slug) && !APP_CMS_SLUGS.has(slug)) return null;
          return {
            id: String(row.id || `page-${index}`),
            slug,
            title: asLoc(row.title, slug),
            visible: row.visible !== false,
            sections: Array.isArray(row.sections) ? row.sections.map((section, i) => migrateSection(section, i)) : [],
          } satisfies CmsPage;
        })
        .filter((page): page is CmsPage => Boolean(page))
    : [];
  if (!pages.some((page) => page.slug === "bundles")) {
    pages.push({
      ...DEFAULT_BUNDLES_PAGE,
      sections: DEFAULT_BUNDLES_PAGE.sections.map((section, index) => migrateSection(section, index)),
    });
  }
  if (!pages.some((page) => page.slug === "cart")) {
    pages.push({
      ...DEFAULT_CART_PAGE,
      sections: DEFAULT_CART_PAGE.sections.map((section, index) => migrateSection(section, index)),
    });
  }
  return pages;
}

function migrateNavLink(link: Partial<NavLink> | undefined, index: number): NavLink {
  const row = link ?? {};
  return {
    id: String(row.id || `link-${index}`),
    href: normalizeNavHref(String(row.href || "/")),
    label: asLoc(row.label),
    visible: row.visible !== false,
    clickable: row.clickable !== false,
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
    codBlockCustom: src.codBlockCustom !== false,
    expressEnabled: src.expressEnabled !== false,
    expressPrice: Math.max(0, Number(src.expressPrice ?? DEFAULT_COMMERCE.expressPrice) || 0),
    expressLabel:
      fillLoc(asLoc(src.expressLabel, DEFAULT_COMMERCE.expressLabel.ar), DEFAULT_COMMERCE.expressLabel) ??
      DEFAULT_COMMERCE.expressLabel,
    copy: migrateCommerceCopy(src.copy),
  };
}

function migrateCommerceCopy(raw: Partial<CommerceCopy> | undefined): CommerceCopy {
  const src = raw ?? {};
  const next = { ...DEFAULT_COMMERCE_COPY };
  for (const key of COMMERCE_COPY_KEYS) {
    next[key] =
      fillLoc(asLoc(src[key], DEFAULT_COMMERCE_COPY[key].ar), DEFAULT_COMMERCE_COPY[key]) ?? DEFAULT_COMMERCE_COPY[key];
  }
  return next;
}

function migrateStorefrontCopy(raw: Partial<StorefrontCopy> | undefined): StorefrontCopy {
  const src = raw ?? {};
  const next = { ...DEFAULT_STOREFRONT_COPY };
  for (const key of STOREFRONT_COPY_KEYS) {
    next[key] =
      fillLoc(asLoc(src[key], DEFAULT_STOREFRONT_COPY[key].ar), DEFAULT_STOREFRONT_COPY[key]) ??
      DEFAULT_STOREFRONT_COPY[key];
  }
  return next;
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
      image: section.content.image,
      imageMobile: section.content.imageMobile,
      tiles: section.content.tiles?.length
        ? section.content.tiles.map((tile, index) => ({
            title: fillLoc(tile.title, fallback.content.tiles?.[index]?.title) ?? tile.title,
            body: fillLoc(tile.body, fallback.content.tiles?.[index]?.body) ?? tile.body,
          }))
        : fallback.content.tiles,
      boxBadge: fillLoc(section.content.boxBadge, fallback.content.boxBadge),
      boxTitle: fillLoc(section.content.boxTitle, fallback.content.boxTitle),
      boxPrice: fillLoc(section.content.boxPrice, fallback.content.boxPrice),
      boxBody: fillLoc(section.content.boxBody, fallback.content.boxBody),
    },
  };
}
