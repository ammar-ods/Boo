export type ProductCategory =
  | "Apparel"
  | "Drinkware"
  | "Laser Cut Wood"
  | "Acrylic"
  | "Stickers";

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
  /** Cylinder / mug body used to clip artwork so it sits on the product. */
  wrapBounds?: SafeZone & { radius?: number };
};

export type Product = {
  slug: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  is_laser_cut: boolean;
  materials: string[];
  defaultMaterial: string;
  canvasWidth: number;
  canvasHeight: number;
  safe_zone_bounds: SafeZone;
  mockup: string;
  accent: "pink" | "orange" | "teal";
  showSafeZone?: boolean;
  archived?: boolean;
  wrapPreview?: boolean;
  /** Photo of the physical mug used in the rotatable 3D preview and catalog card. */
  mugPhoto?: string;
  /** Optional custom unwrapped print template. Defaults to the built-in wrap layout. */
  wrapTemplate?: string;
  views?: ProductView[];
};

const MUG_WRAP_BOUNDS = { left: 214, top: 228, width: 330, height: 360, radius: 48 };
export const MUG_WRAP_FLAT = {
  mockup: "/products/mug-wrap-flat.svg",
  productMockup: "/products/ceramic-mug.svg",
  safe_zone_bounds: { left: 70, top: 210, width: 660, height: 300 },
  wrapBounds: MUG_WRAP_BOUNDS,
};

export function mugPhotoUrl(product: Product) {
  const src = product.mugPhoto || product.mockup || "";
  if (!src || src.includes("mug-wrap-flat")) return MUG_WRAP_FLAT.productMockup;
  return src;
}

function wrapEditorMockup(product: Product, view: ProductView) {
  const custom = product.wrapTemplate || view.mockup;
  if (!custom || custom.includes("ceramic-mug") || custom.includes("mug-wrap-flat")) {
    return MUG_WRAP_FLAT.mockup;
  }
  return custom;
}

export function productViews(product: Product): ProductView[] {
  const drinkware = product.category === "Drinkware" || Boolean(product.wrapPreview);
  const raw =
    product.views && product.views.length > 0
      ? product.views
      : [
          {
            id: "front",
            label: drinkware ? "Wrap" : "Front",
            mockup: product.mockup,
            safe_zone_bounds: product.safe_zone_bounds,
            wrap: drinkware,
            wrapBounds: drinkware ? MUG_WRAP_BOUNDS : undefined,
          },
        ];

  return raw.map((view) => {
    const wrap = Boolean(view.wrap) || drinkware;
    if (!wrap) return { ...view, wrap: false };
    const mockup = wrapEditorMockup(product, view);
    const usingBuiltIn = mockup === MUG_WRAP_FLAT.mockup;
    return {
      ...view,
      wrap: true,
      label: view.label || "Wrap",
      mockup,
      safe_zone_bounds: usingBuiltIn
        ? MUG_WRAP_FLAT.safe_zone_bounds
        : view.safe_zone_bounds,
      wrapBounds: view.wrapBounds ?? MUG_WRAP_FLAT.wrapBounds,
    };
  });
}

export const CATEGORIES: ProductCategory[] = [
  "Apparel",
  "Drinkware",
  "Laser Cut Wood",
  "Acrylic",
  "Stickers",
];

export const SEED_PRODUCTS: Product[] = [
  {
    slug: "classic-tee",
    name: "Classic Cotton Tee",
    category: "Apparel",
    tagline: "Soft blanks, loud ideas.",
    description:
      "A midweight cotton tee with a generous chest print area. Perfect for logos, illustrations, and event merch.",
    is_laser_cut: false,
    materials: ["White cotton", "Heather grey", "Teal", "Ink black"],
    defaultMaterial: "White cotton",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 275, top: 210, width: 250, height: 290 },
    mockup: "/products/classic-tee.svg",
    accent: "teal",
    views: [
      {
        id: "front",
        label: "Front",
        mockup: "/products/classic-tee.svg",
        safe_zone_bounds: { left: 275, top: 210, width: 250, height: 290 },
      },
      {
        id: "back",
        label: "Back",
        mockup: "/products/classic-tee-back.svg",
        safe_zone_bounds: { left: 275, top: 200, width: 250, height: 310 },
      },
    ],
  },
  {
    slug: "studio-hoodie",
    name: "Studio Hoodie",
    category: "Apparel",
    tagline: "Cozy canvas for big graphics.",
    description:
      "Heavyweight hoodie with a centered chest zone. Keep key art inside the dashed safe area for clean DTG prints.",
    is_laser_cut: false,
    materials: ["Fleece black", "Fleece cream", "Fleece teal"],
    defaultMaterial: "Fleece cream",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 270, top: 230, width: 260, height: 250 },
    mockup: "/products/studio-hoodie.svg",
    accent: "pink",
    views: [
      {
        id: "front",
        label: "Front",
        mockup: "/products/studio-hoodie.svg",
        safe_zone_bounds: { left: 270, top: 230, width: 260, height: 250 },
      },
      {
        id: "back",
        label: "Back",
        mockup: "/products/studio-hoodie-back.svg",
        safe_zone_bounds: { left: 270, top: 210, width: 260, height: 280 },
      },
    ],
  },
  {
    slug: "ceramic-mug",
    name: "Ceramic Mug",
    category: "Drinkware",
    tagline: "Wrap-print sipware.",
    description:
      "11oz ceramic mug. Design the unwrapped print, then drag the 3D mug to spin it.",
    is_laser_cut: false,
    materials: ["Gloss white", "Matte black", "Teal glaze"],
    defaultMaterial: "Gloss white",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 210, top: 250, width: 300, height: 220 },
    mockup: "/products/ceramic-mug.svg",
    mugPhoto: "/products/ceramic-mug.svg",
    wrapTemplate: "/products/mug-wrap-flat.svg",
    accent: "orange",
    wrapPreview: true,
    views: [
      {
        id: "wrap",
        label: "360° wrap",
        mockup: "/products/mug-wrap-flat.svg",
        safe_zone_bounds: MUG_WRAP_FLAT.safe_zone_bounds,
        wrap: true,
        wrapBounds: MUG_WRAP_FLAT.wrapBounds,
      },
    ],
  },
  {
    slug: "wood-plaque",
    name: "Laser-Cut Wood Plaque",
    category: "Laser Cut Wood",
    tagline: "Etched grain, gallery finish.",
    description:
      "Birch plaque engraved on our diode/CO2 bed. High-contrast artwork reads best — enable laser preview to see the etch.",
    is_laser_cut: true,
    materials: ["Birch plywood", "Walnut veneer", "Cherry plywood"],
    defaultMaterial: "Birch plywood",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 170, top: 170, width: 460, height: 460 },
    mockup: "/products/wood-plaque.svg",
    accent: "orange",
  },
  {
    slug: "wood-keychain",
    name: "Wood Keycharm",
    category: "Laser Cut Wood",
    tagline: "Tiny etch, huge personality.",
    description:
      "Small-format engraved keycharm. Keep type chunky — hairlines may vanish in the grain.",
    is_laser_cut: true,
    materials: ["Birch 3mm", "Walnut 3mm"],
    defaultMaterial: "Birch 3mm",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 250, top: 230, width: 300, height: 300 },
    mockup: "/products/wood-keychain.svg",
    accent: "teal",
  },
  {
    slug: "acrylic-medal",
    name: "Acrylic Medal",
    category: "Acrylic",
    tagline: "Clear, gold, and trophy-ready.",
    description:
      "Cut-and-engrave acrylic medal with ribbon hole. Laser preview shows how frosted etch will read on clear stock.",
    is_laser_cut: true,
    materials: ["Clear 3mm", "Frosted 3mm", "Gold mirror 3mm"],
    defaultMaterial: "Clear 3mm",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 230, top: 210, width: 340, height: 380 },
    mockup: "/products/acrylic-medal.svg",
    accent: "teal",
  },
  {
    slug: "acrylic-standee",
    name: "Desktop Acrylic Standee",
    category: "Acrylic",
    tagline: "Little monument for your logo.",
    description:
      "Freestanding acrylic plaque. Vector-friendly marks and bold type engrave cleanly.",
    is_laser_cut: true,
    materials: ["Clear 5mm", "Black 5mm"],
    defaultMaterial: "Clear 5mm",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 220, top: 160, width: 360, height: 420 },
    mockup: "/products/acrylic-standee.svg",
    accent: "pink",
  },
  {
    slug: "vinyl-sticker-sheet",
    name: "Vinyl Sticker Sheet",
    category: "Stickers",
    tagline: "Kiss-cut sheets, made with love.",
    description:
      "Print-and-cut vinyl sheet. Leave a little padding inside the dashed zone so the plotter has bleed.",
    is_laser_cut: false,
    materials: ["Gloss vinyl", "Matte vinyl", "Holographic vinyl"],
    defaultMaterial: "Gloss vinyl",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 150, top: 150, width: 500, height: 500 },
    mockup: "/products/vinyl-sheet.svg",
    accent: "pink",
  },
  {
    slug: "die-cut-sticker",
    name: "Die-Cut Sticker",
    category: "Stickers",
    tagline: "One shape, infinite sparkle.",
    description:
      "Single-shape kiss-cut sticker. Extend background color slightly past the safe zone for a clean cut line.",
    is_laser_cut: false,
    materials: ["Gloss vinyl", "Matte vinyl", "Transparent vinyl"],
    defaultMaterial: "Gloss vinyl",
    canvasWidth: 800,
    canvasHeight: 800,
    safe_zone_bounds: { left: 220, top: 220, width: 360, height: 360 },
    mockup: "/products/die-cut-sticker.svg",
    accent: "orange",
  },
];

/** Seed catalog only. Runtime catalog lives in data/catalog.json via lib/local-db. */
export const PRODUCTS = SEED_PRODUCTS;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
