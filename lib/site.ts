export type SectionType = "hero" | "banner" | "text" | "products" | "collections" | "cta" | "faq";

export type SectionStyle = {
  background?: string;
  color?: string;
  fontSize?: number;
  paddingY?: number;
  align?: "start" | "center";
  imageHeight?: number;
};

export type SectionContent = {
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  image?: string;
};

export type SiteSection = {
  id: string;
  type: SectionType;
  visible: boolean;
  style: SectionStyle;
  content: SectionContent;
};

export const SECTION_TYPES: { type: SectionType; label: string; labelAr: string }[] = [
  { type: "hero", label: "Hero", labelAr: "هيرو" },
  { type: "banner", label: "Banner", labelAr: "بانر" },
  { type: "text", label: "Text", labelAr: "نص" },
  { type: "products", label: "Products", labelAr: "منتجات" },
  { type: "collections", label: "Collections", labelAr: "أقسام" },
  { type: "cta", label: "Call to action", labelAr: "دعوة للشراء" },
  { type: "faq", label: "FAQ / about", labelAr: "أسئلة / عنّا" },
];

export function newSection(type: SectionType): SiteSection {
  const id = `${type}-${Math.random().toString(36).slice(2, 8)}`;
  const defaults: Record<SectionType, SiteSection> = {
    hero: {
      id,
      type,
      visible: true,
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 56, paddingY: 72, align: "center" },
      content: {
        eyebrow: "بو · مشغل أكسفورد",
        title: "قطع مختارة للمكتب والهدايا.",
        body: "تيشيرت للطباعة، مج حراري، وكوستر خشب. سعر موحّد ١٠٠ جنيه.",
        ctaLabel: "تسوّق الآن",
        ctaHref: "/catalog",
        secondaryCtaLabel: "الباقات",
        secondaryCtaHref: "/bundles",
      },
    },
    banner: {
      id,
      type,
      visible: true,
      style: { background: "#0a2540", color: "#ffffff", fontSize: 32, paddingY: 48, align: "start", imageHeight: 280 },
      content: {
        eyebrow: "إصدار جديد",
        title: "بانر المنتج الجديد",
        body: "اكتب هنا تفاصيل الإصدار. تقدر تحذف البانر لاحقًا من وضع التعديل.",
        ctaLabel: "تسوق",
        ctaHref: "/catalog",
        image: "/products/white-tee-front.jpg",
      },
    },
    text: {
      id,
      type,
      visible: true,
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 20, paddingY: 48, align: "start" },
      content: {
        title: "قسم نص",
        body: "اكتب أي محتوى هنا. يظهر لكل الزوار بعد الحفظ.",
      },
    },
    products: {
      id,
      type,
      visible: true,
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 40, paddingY: 56, align: "center" },
      content: { title: "اختيارات الاستوديو", body: "القطع الثلاثة الحالية بسعر ١٠٠ جنيه." },
    },
    collections: {
      id,
      type,
      visible: true,
      style: { background: "#f6f3ea", color: "#0a2540", fontSize: 40, paddingY: 40, align: "center" },
      content: { title: "الأقسام" },
    },
    cta: {
      id,
      type,
      visible: true,
      style: { background: "#0a2540", color: "#ffffff", fontSize: 32, paddingY: 48, align: "start" },
      content: {
        eyebrow: "باقات",
        title: "جهّز هدية كاملة",
        body: "التيشيرت والمجر والكوستر في باقة واحدة.",
        ctaLabel: "شوف الباقات",
        ctaHref: "/bundles",
      },
    },
    faq: {
      id,
      type,
      visible: true,
      style: { background: "#ffffff", color: "#0a2540", fontSize: 28, paddingY: 56, align: "start" },
      content: {
        title: "مشغل، مش كتالوج عشوائي.",
        body: "بو للطباعة المخصصة والهدايا. كل طلب بيتراجع في الاستوديو قبل التنفيذ.",
      },
    },
  };
  return defaults[type];
}

export const DEFAULT_SITE: { sections: SiteSection[] } = {
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
