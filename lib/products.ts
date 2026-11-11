export type ProductCategory = "Apparel" | "Drinkware" | "Laser Cut Wood";

export type SafeZone = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ProductView = {
  id: string;
  label: string;
  mockup: string;
  safe_zone_bounds: SafeZone;
  wrap?: boolean;
  wrapBounds?: SafeZone & { radius?: number };
};

export type Product = {
  slug: string;
  name: string;
  nameAr: string;
  category: ProductCategory;
  tagline: string;
  taglineAr: string;
  description: string;
  descriptionAr: string;
  is_laser_cut: boolean;
  materials: string[];
  colors: string[];
  optionLabel?: { ar: string; en: string };
  optionChoices?: string[];
  defaultMaterial: string;
  canvasWidth: number;
  canvasHeight: number;
  safe_zone_bounds: SafeZone;
  mockup: string;
  accent: "pink" | "orange" | "teal";
  showSafeZone?: boolean;
  archived?: boolean;
  wrapPreview?: boolean;
  mugPhoto?: string;
  wrapTemplate?: string;
  thumbnail?: string;
  gallery?: string[];
  views?: ProductView[];
  priceEgp: number;
  customizable?: boolean;
};

const MUG_WRAP_BOUNDS = { left: 214, top: 228, width: 330, height: 360, radius: 48 };
export const MUG_WRAP_FLAT = {
  mockup: "/products/mug-wrap-flat.svg",
  productMockup: "/products/thermal-tumbler.jpg",
  safe_zone_bounds: { left: 70, top: 210, width: 660, height: 300 },
  wrapBounds: MUG_WRAP_BOUNDS,
};

export const PRICE_EGP = 100;

export function mugPhotoUrl(product: Product) {
  const src = product.mugPhoto || product.mockup || "";
  if (!src || src.includes("mug-wrap-flat")) return MUG_WRAP_FLAT.productMockup;
  return src;
}

export function productViews(product: Product): ProductView[] {
  const wrapAll = Boolean(product.wrapPreview);
  const raw =
    product.views && product.views.length > 0
      ? product.views
      : [
          {
            id: "front",
            label: wrapAll ? "Wrap" : "Front",
            mockup: product.mockup,
            safe_zone_bounds: product.safe_zone_bounds,
            wrap: wrapAll,
            wrapBounds: wrapAll ? MUG_WRAP_BOUNDS : undefined,
          },
        ];

  return raw.map((view) => {
    const wrap = Boolean(view.wrap) || wrapAll;
    if (!wrap) return { ...view, wrap: false };
    return {
      ...view,
      wrap: true,
      label: view.label || "Wrap",
      mockup: MUG_WRAP_FLAT.mockup,
      safe_zone_bounds: MUG_WRAP_FLAT.safe_zone_bounds,
      wrapBounds: view.wrapBounds ?? MUG_WRAP_FLAT.wrapBounds,
    };
  });
}

export const CATEGORIES: ProductCategory[] = ["Apparel", "Drinkware", "Laser Cut Wood"];

export function productOptions(product: Product) {
  const choices = (
    product.optionChoices?.filter(Boolean).length
      ? product.optionChoices
      : product.colors?.length
        ? product.colors
        : product.materials
  ).filter(Boolean);
  return {
    label: {
      ar: product.optionLabel?.ar?.trim() || "اللون",
      en: product.optionLabel?.en?.trim() || "Color",
    },
    choices: choices.length ? choices : ["Standard"],
  };
}

export const SEED_PRODUCTS: Product[] = [
  {
    slug: "white-tee",
    name: "White Cotton Tee",
    nameAr: "تيشيرت أبيض",
    category: "Apparel",
    tagline: "Front and back print on a clean cotton blank.",
    taglineAr: "طباعة أمام وخلف على تيشيرت قطن أبيض.",
    description:
      "Choose a color, then upload artwork on the front and back photos. Price is 100 EGP.",
    descriptionAr:
      "اختار اللون، وبعدين ارفع التصميم على صورة الأمام والخلف. السعر ١٠٠ جنيه.",
    is_laser_cut: false,
    materials: ["White", "Black", "Navy"],
    colors: ["White", "Black", "Navy"],
    optionLabel: { ar: "اللون", en: "Color" },
    optionChoices: ["White", "Black", "Navy"],
    defaultMaterial: "White",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 270, top: 210, width: 260, height: 300 },
    mockup: "/products/white-tee-front.jpg",
    accent: "teal",
    priceEgp: PRICE_EGP,
    customizable: true,
    views: [
      {
        id: "front",
        label: "Front",
        mockup: "/products/white-tee-front.jpg",
        safe_zone_bounds: { left: 270, top: 210, width: 260, height: 300 },
      },
      {
        id: "back",
        label: "Back",
        mockup: "/products/white-tee-back.jpg",
        safe_zone_bounds: { left: 270, top: 200, width: 260, height: 320 },
      },
    ],
  },
  {
    slug: "thermal-tumbler",
    name: "Thermal Tumbler",
    nameAr: "مج حراري",
    category: "Drinkware",
    tagline: "Insulated tumbler with a steel lid.",
    taglineAr: "مج حراري مع غطاء استانلس.",
    description: "Double-wall tumbler. Pick a color and add it to your bag. 100 EGP.",
    descriptionAr: "مج حراري جدار مزدوج. اختار اللون وضيفه للسلة. السعر ١٠٠ جنيه.",
    is_laser_cut: false,
    materials: ["White", "Black", "Silver"],
    colors: ["White", "Black", "Silver"],
    optionLabel: { ar: "اللون", en: "Color" },
    optionChoices: ["White", "Black", "Silver"],
    defaultMaterial: "White",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 300, top: 160, width: 200, height: 420 },
    mockup: "/products/thermal-tumbler.jpg",
    mugPhoto: "/products/thermal-tumbler.jpg",
    accent: "orange",
    wrapPreview: false,
    priceEgp: PRICE_EGP,
    customizable: true,
    views: [
      {
        id: "front",
        label: "Front",
        mockup: "/products/thermal-tumbler.jpg",
        safe_zone_bounds: { left: 300, top: 160, width: 200, height: 420 },
      },
    ],
  },
  {
    slug: "wood-coaster",
    name: "Wood Coaster",
    nameAr: "كوستر خشب",
    category: "Laser Cut Wood",
    tagline: "Round birch coaster, ready for a mark.",
    taglineAr: "كوستر خشب دائري جاهز للنقش أو الطباعة.",
    description: "Natural round wood coaster. 100 EGP.",
    descriptionAr: "كوستر خشب طبيعي دائري. السعر ١٠٠ جنيه.",
    is_laser_cut: true,
    materials: ["Natural pine", "Walnut", "Cherry"],
    colors: ["Natural pine", "Walnut", "Cherry"],
    optionLabel: { ar: "الخامة", en: "Material" },
    optionChoices: ["Natural pine", "Walnut", "Cherry"],
    defaultMaterial: "Natural pine",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 190, top: 160, width: 420, height: 420 },
    mockup: "/products/wood-coaster.png",
    accent: "orange",
    priceEgp: PRICE_EGP,
    customizable: true,
    views: [
      {
        id: "front",
        label: "Front",
        mockup: "/products/wood-coaster.png",
        safe_zone_bounds: { left: 190, top: 160, width: 420, height: 420 },
      },
    ],
  },
];

export const PRODUCTS = SEED_PRODUCTS;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function productThumbnail(product: Product) {
  return product.thumbnail || product.gallery?.[0] || product.mockup;
}

export function productGallery(product: Product) {
  if (product.gallery?.length) return product.gallery.filter(Boolean);
  if (product.customizable === false) {
    const views = productViews(product)
      .map((view) => view.mockup)
      .filter(Boolean);
    if (views.length) return views;
    if (product.thumbnail) return [product.thumbnail];
    if (product.mockup) return [product.mockup];
  }
  return [];
}

export function localizedName(product: Product, locale: string) {
  return locale === "ar" ? product.nameAr : product.name;
}

export function localizedTagline(product: Product, locale: string) {
  return locale === "ar" ? product.taglineAr : product.tagline;
}

export function localizedDescription(product: Product, locale: string) {
  return locale === "ar" ? product.descriptionAr : product.description;
}
