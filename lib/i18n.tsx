"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "ar" | "en";
export type Currency = "EGP" | "USD" | "EUR" | "GBP";

const COPY: Record<Locale, Record<string, string>> = {
  ar: {
    shop: "المتجر",
    bundles: "الباقات",
    contact: "تواصل معنا",
    cart: "السلة",
    checkout: "إتمام الطلب",
    search: "بحث",
    shopNow: "تسوّق الآن",
    gifts: "هدايا خاصة",
    addToCart: "أضف للسلة",
    checkoutNow: "إتمام الشراء",
    addAndShop: "أضف للسلة وكمّل التسوق",
    added: "تمت الإضافة",
    color: "اللون",
    quantity: "الكمية",
    details: "التفاصيل",
    price: "السعر",
    emptyCart: "السلة فاضية.",
    continue: "كمّل التسوق",
    placeOrder: "أكد الطلب",
    name: "الاسم",
    phone: "رقم الواتساب",
    email: "البريد (اختياري)",
    address: "العنوان",
    notes: "ملاحظات",
    thankYou: "شكرًا لطلبك",
    thankBody: "استلمنا طلبك وهنتواصل معاك لتأكيد التوصيل.",
    backShop: "رجوع للمتجر",
    home: "الرئيسية",
    catalogTitle: "المتجر",
    catalogBody: "تيشيرت، مج حراري، وكوستر خشب — كل قطعة بـ ١٠٠ جنيه.",
    bundlesTitle: "الباقات",
    bundlesBody: "اختار باقة جاهزة وضيفها للسلة بسعر واحد.",
    contactTitle: "تواصل معنا",
    contactBody: "اكتب لنا طلب خاص أو سؤال، وهنرد عليك على الواتساب.",
    send: "إرسال",
    customize: "ارفع التصميم",
    previewProduct: "معاينة المنتج النهائي",
    editingSide: "يتم التعديل هنا",
    closePreview: "إغلاق",
    view: "الأمام / الخلف",
    pieces: "قطع",
    total: "الإجمالي",
    remove: "حذف",
    editSite: "تعديل",
    doneEdit: "إنهاء التعديل",
    saveChanges: "حفظ التغييرات",
    discardChanges: "تجاهل التغييرات",
    studio: "مكتب الاستوديو",
    freeShip: "شحن داخل مصر · كل القطع بـ ١٠٠ جنيه",
    collections: "الأقسام",
    staffPicks: "اختيارات الاستوديو",
    viewCatalog: "عرض المتجر ←",
    heroChip: "بو · مشغل أكسفورد",
    heroTitle: "قطع مختارة للمكتب والهدايا.",
    heroBody: "تيشيرت للطباعة، مج حراري، وكوستر خشب. سعر موحّد ١٠٠ جنيه.",
  },
  en: {
    shop: "Shop",
    bundles: "Bundles",
    contact: "Contact",
    cart: "Cart",
    checkout: "Checkout",
    search: "Search",
    shopNow: "Shop now",
    gifts: "Gifts",
    addToCart: "Add to cart",
    checkoutNow: "Checkout now",
    addAndShop: "Add to cart and continue shopping",
    added: "Added",
    color: "Color",
    quantity: "Quantity",
    details: "Details",
    price: "Price",
    emptyCart: "Your bag is empty.",
    continue: "Continue shopping",
    placeOrder: "Place order",
    name: "Name",
    phone: "WhatsApp number",
    email: "Email (optional)",
    address: "Address",
    notes: "Notes",
    thankYou: "Thank you",
    thankBody: "We received your order and will confirm delivery shortly.",
    backShop: "Back to shop",
    home: "Home",
    catalogTitle: "Shop",
    catalogBody: "Tee, tumbler, and wood coaster — 100 EGP each.",
    bundlesTitle: "Bundles",
    bundlesBody: "Ready packs at a single price. Add the set to your bag.",
    contactTitle: "Contact us",
    contactBody: "Send a custom request or a question. We reply on WhatsApp.",
    send: "Send",
    customize: "Upload artwork",
    previewProduct: "Preview final product",
    editingSide: "Editing this side",
    closePreview: "Close",
    view: "Front / back",
    pieces: "items",
    total: "Total",
    remove: "Remove",
    editSite: "Edit",
    doneEdit: "Done editing",
    saveChanges: "Save changes",
    discardChanges: "Discard changes",
    studio: "Studio desk",
    freeShip: "Shipping in Egypt · every piece is 100 EGP",
    collections: "Collections",
    staffPicks: "Staff picks",
    viewCatalog: "View shop →",
    heroChip: "Boo · Oxford atelier",
    heroTitle: "Pieces chosen for the desk and for gifting.",
    heroBody: "Printable tee, thermal tumbler, and a wood coaster. 100 EGP each.",
  },
};

type Ctx = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: string) => string;
  formatPrice: (egp: number) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [currency, setCurrencyState] = useState<Currency>("EGP");

  useEffect(() => {
    const storedLocale = window.localStorage.getItem("boo-locale") as Locale | null;
    const storedCurrency = window.localStorage.getItem("boo-currency-code") as Currency | null;
    if (storedLocale === "ar" || storedLocale === "en") setLocaleState(storedLocale);
    if (storedCurrency === "EGP" || storedCurrency === "USD" || storedCurrency === "EUR" || storedCurrency === "GBP") {
      setCurrencyState(storedCurrency);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo<Ctx>(() => {
    function setLocale(next: Locale) {
      setLocaleState(next);
      window.localStorage.setItem("boo-locale", next);
    }
    function setCurrency(next: Currency) {
      setCurrencyState(next);
      window.localStorage.setItem("boo-currency-code", next);
    }
    function t(key: string) {
      return COPY[locale][key] ?? COPY.en[key] ?? key;
    }
    function formatPrice(egp: number) {
      if (currency === "EGP") return locale === "ar" ? `${egp} ج.م` : `${egp} EGP`;
      const rate = currency === "USD" ? 0.021 : currency === "EUR" ? 0.019 : 0.016;
      const converted = Math.max(1, Math.round(egp * rate));
      const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
      return `${symbol}${converted}`;
    }
    return { locale, setLocale, currency, setCurrency, t, formatPrice };
  }, [currency, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
