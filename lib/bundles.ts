export type Bundle = {
  slug: string;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  productSlugs: string[];
  priceEgp: number;
  image: string;
};

export const SEED_BUNDLES: Bundle[] = [
  {
    slug: "desk-set",
    name: "Desk set",
    nameAr: "باقة المكتب",
    tagline: "Tumbler + wood coaster.",
    taglineAr: "مج حراري مع كوستر خشب.",
    productSlugs: ["thermal-tumbler", "wood-coaster"],
    priceEgp: 100,
    image: "/products/thermal-tumbler.jpg",
  },
  {
    slug: "full-studio",
    name: "Full studio pack",
    nameAr: "باقة الاستوديو الكاملة",
    tagline: "Tee, tumbler, and coaster.",
    taglineAr: "تيشيرت ومجر وكوستر.",
    productSlugs: ["white-tee", "thermal-tumbler", "wood-coaster"],
    priceEgp: 100,
    image: "/products/white-tee-front.jpg",
  },
];
