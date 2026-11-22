"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

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
    viewCart: "عرض السلة",
    yourOrder: "طلبك",
    backDetails: "تفاصيل المنتج",
    addAndShop: "أضف للسلة وكمّل التسوق",
    added: "تمت الإضافة",
    addedSuccess: "تمت الإضافة بنجاح",
    addingToCart: "جاري رفع الصورة وإضافتها للسلة",
    sections: "الأقسام",
    promoCode: "كود الخصم",
    apply: "تطبيق",
    shipping: "الشحن",
    expressOrder: "طلب سريع",
    expressHint: "توصيل أسرع مقابل رسوم إضافية.",
    invoice: "الفاتورة",
    downloadInvoice: "تنزيل الفاتورة",
    freeShipping: "شحن مجاني",
    subtotal: "المجموع",
    discount: "الخصم",
    color: "اللون",
    quantity: "الكمية",
    details: "التفاصيل",
    dimensions: "الأبعاد",
    length: "الطول",
    width: "العرض",
    price: "السعر",
    emptyCart: "السلة فاضية.",
    continue: "كمّل التسوق",
    placeOrder: "أكد الطلب",
    payment: "طريقة الدفع",
    payCod: "الدفع عند الاستلام",
    payCodCustom: "الطلبات المخصصة لازم تُدفع أونلاين",
    payOnline: "تحويل أونلاين",
    chatWhatsApp: "كلمنا على واتساب",
    payOnlineHint: "حوّل على الرقم ده، بعدين اكتب رقم التحويل وارفع صورة الإيصال.",
    transferPhone: "رقم التحويل",
    receipt: "صورة الإيصال",
    receiptHint: "PNG أو JPG",
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
    catalogBody: "تيشيرت، مج حراري، وكوستر٠.",
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
    freeShip: "شحن داخل مصر ·",
    collections: "الأقسام",
    staffPicks: "اختيارات الاستوديو",
    viewCatalog: "عرض المتجر",
    sortFeatured: "مميز",
    sortName: "الاسم",
    sortPriceLow: "السعر: من الأقل للأعلى",
    sortBy: "ترتيب",
    readyToShip: "جاهز للشحن",
    showingPieces: "عرض {shown} من {total} قطعة",
    loadRemaining: "عرض الباقي",
    showMore: "عرض المزيد",
    applied: "تم التطبيق",
    leaveCheckout: "مغادرة الدفع؟",
    leaveCheckoutBody: "لو خرجت دلوقتي، البيانات اللي كتبتها في الفورم هتتمسح.",
    stayCheckout: "البقاء",
    confirmLeave: "مغادرة",
    yourBag: "سلتك",
    bagItems: "قطع",
    proceedCheckout: "إتمام الشراء",
    estimatedTotal: "الإجمالي",
    allProducts: "الكل",
    heroChip: " ",
    heroTitle: "قطع مختارة للمكتب والهدايا.",
    heroBody: "تيشيرت للطباعة، مج حراري، وكوستر خشب. .",
    quickWhatsApp: "واتساب الدعم السريع",
    searchPlaceholder: "ابحث عن منتج أو قسم...",
    customizeName: "تخصيص بالاسم والطلب",
    shopByOccasion: "تسوّق حسب المناسبة",
    sectionsTitle: "أقسام الهدايا والتصميمات",
    sectionsBody: "اختار القسم المناسب لمناسبتك واستكشف خيارات التخصيص.",
    giftSetsEyebrow: "مجموعات الهدايا الكاملة",
    giftSetsTitle: "جهّز هدية كاملة بالتصميم اللي تختاره",
    giftSetsBody: "شنطة، ميدالية، مج وكوستر في مجموعة واحدة متناسقة باسم وتصميم من تحب، مجهزة بكرتونة إهداء جاهزة للتقديم.",
    giftSetsMatchTitle: "تطابق وتناسق كامل",
    giftSetsMatchBody: "نفس الثيم على كل المحتويات",
    giftSetsSaveTitle: "سعر أوفر من المفرد",
    giftSetsSaveBody: "خصومات على الباقات",
    giftSetsCardTitle: "كارت إهداء مجاني",
    giftSetsCardBody: "مكتوب فيه رسالتك",
    giftSetsCta: "اختار مجموعة الهدايا",
    giftSetsBoxBadge: "بوكس التميز الأكثر طلباً",
    giftSetsBoxTitle: "طقم الإهداء المتكامل",
    giftSetsBoxPrice: "عرض خاص",
    giftSetsBoxBody: "حفر مخصص للاسم على محتويات الصندوق مع تغليف أنيق.",
    howToEyebrow: "بكل بساطة",
    howToTitle: "كيف تطلب هديتك المخصصة؟",
    howToBody: "ثلاث خطوات سريعة تصنع بها ذكرى لمن تحب.",
    howTo1n: "١",
    howTo1title: "اختار منتجك وتصميمه",
    howTo1body: "تصفح الكتالوج وحدد نوع المنتج المناسب لمناسبتك.",
    howTo2n: "٢",
    howTo2title: "أرسل الأسماء والتفاصيل",
    howTo2body: "اكتب الأسماء والتواريخ أو ارفع الصور عشان نحضّر البروفة.",
    howTo3n: "٣",
    howTo3title: "استلم هديتك لباب بيتك",
    howTo3body: "ننّفذ الطلب ونتغلفه، ويوصلك في محافظات مصر.",
    customFilter: "مخصص",
    cartSuggestTitle: "منتجات مشابهة للي في السلة",
    cartSuggestShipping: "أضف منتج بالسعر ده أو أقل عشان توصل للشحن المجاني",
    paymentTitle: "اختر طريقة الدفع المناسبة",
    paymentSafe: "جميع الطرق آمنة 100%",
    payCodBody: "يتم سداد دفعة تأكيد حفر الاسم بقيمة 100 ج.م مسبقاً والباقي مع المندوب",
    payOnlineBody: "فودافون كاش، أورنج كاش، اتصالات كاش، وي باي، انستاباي",
    payOnlineFast: "الأسرع اعتماداً",
    freeShipProgress: "أحسنت! أضفت منتجات بقيمة {added} — باقي لك {remaining} فقط وتستمتع بالشحن المجاني! 🎉",
    freeShipRemaining: "متبقي {percent}% للوصول للشحن المجاني",
    freeShipUnlocked: "وصلت للشحن المجاني! 🎉",
    layoutGrid: "شبكة",
    layoutList: "قائمة",
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
    viewCart: "View cart",
    yourOrder: "Your order",
    backDetails: "Product details",
    addAndShop: "Add to cart and continue shopping",
    added: "Added",
    addedSuccess: "Added successfully",
    addingToCart: "Uploading image, adding to cart",
    sections: "Sections",
    promoCode: "Promo code",
    apply: "Apply",
    shipping: "Shipping",
    expressOrder: "Express order",
    expressHint: "Faster delivery for an extra fee.",
    invoice: "Invoice",
    downloadInvoice: "Download invoice",
    freeShipping: "Free shipping",
    subtotal: "Subtotal",
    discount: "Discount",
    color: "Color",
    quantity: "Quantity",
    details: "Details",
    dimensions: "Dimensions",
    length: "Length",
    width: "Width",
    price: "Price",
    emptyCart: "Your bag is empty.",
    continue: "Continue shopping",
    placeOrder: "Place order",
    payment: "Payment",
    payCod: "Cash on delivery",
    payCodCustom: "Custom orders must pay online",
    payOnline: "Online transfer",
    chatWhatsApp: "Chat on WhatsApp",
    payOnlineHint: "Transfer to this number, then enter the sending phone and upload the receipt.",
    transferPhone: "Transfer phone number",
    receipt: "Receipt photo",
    receiptHint: "PNG or JPG",
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
    viewCatalog: "View shop",
    sortFeatured: "Featured",
    sortName: "Name",
    sortPriceLow: "Price: low to high",
    sortBy: "Sort by",
    readyToShip: "Ready to ship",
    showingPieces: "Showing {shown} of {total} curated pieces",
    loadRemaining: "Load remaining pieces",
    showMore: "Show more",
    applied: "Applied",
    leaveCheckout: "Leave checkout?",
    leaveCheckoutBody: "If you leave now, the details you entered on this form will be lost.",
    stayCheckout: "Stay",
    confirmLeave: "Leave",
    yourBag: "Your bag",
    bagItems: "items",
    proceedCheckout: "Proceed to checkout",
    estimatedTotal: "Estimated total",
    allProducts: "All",
    heroChip: "Boo · Oxford atelier",
    heroTitle: "Pieces chosen for the desk and for gifting.",
    heroBody: "Printable tee, thermal tumbler, and a wood coaster. 100 EGP each.",
    quickWhatsApp: "Quick WhatsApp support",
    searchPlaceholder: "Search a product or collection...",
    customizeName: "Customize and order",
    shopByOccasion: "Shop by occasion",
    sectionsTitle: "Gift and design sections",
    sectionsBody: "Pick the section for your occasion and explore customization options.",
    giftSetsEyebrow: "Complete gift sets",
    giftSetsTitle: "Build a full gift with the design you choose",
    giftSetsBody: "A coordinated set with the name and design you love, packed ready to give.",
    giftSetsMatchTitle: "Fully coordinated",
    giftSetsMatchBody: "The same theme on every piece",
    giftSetsSaveTitle: "Better than buying singles",
    giftSetsSaveBody: "Exclusive bundle pricing",
    giftSetsCardTitle: "Free gift card",
    giftSetsCardBody: "Your message written inside",
    giftSetsCta: "Choose a gift set",
    giftSetsBoxBadge: "Most requested gift box",
    giftSetsBoxTitle: "Complete gifting set",
    giftSetsBoxPrice: "Special offer",
    giftSetsBoxBody: "Custom name engraving on every piece, with elegant wrapping.",
    howToEyebrow: "Simple and flexible",
    howToTitle: "How to order a custom gift",
    howToBody: "Three short steps to make a piece for someone you love.",
    howTo1n: "1",
    howTo1title: "Pick the product and design",
    howTo1body: "Browse the shop and choose the piece that fits the occasion.",
    howTo2n: "2",
    howTo2title: "Send names and details",
    howTo2body: "Add names, dates, or photos so we can prepare a proof.",
    howTo3n: "3",
    howTo3title: "Receive it at your door",
    howTo3body: "We make it, wrap it, and ship it across Egypt.",
    customFilter: "Custom",
    cartSuggestTitle: "Similar to what’s in your bag",
    cartSuggestShipping: "Add one of these at this price or less to unlock free shipping",
    paymentTitle: "Choose a payment method",
    paymentSafe: "All methods are 100% secure",
    payCodBody: "A 100 EGP name-engraving confirmation is paid first; the rest is paid to the courier.",
    payOnlineBody: "Vodafone Cash, Orange Cash, Etisalat Cash, WE Pay, InstaPay",
    payOnlineFast: "Fastest approval",
    freeShipProgress: "Nice! You added {added} — add {remaining} more for free shipping! 🎉",
    freeShipRemaining: "{percent}% left to free shipping",
    freeShipUnlocked: "You unlocked free shipping! 🎉",
    layoutGrid: "Grid",
    layoutList: "List",
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
  const swapping = useRef(false);

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
    if (!document.documentElement.classList.contains("locale-fading")) return;
    const show = window.setTimeout(() => {
      document.documentElement.classList.remove("locale-fading");
      swapping.current = false;
    }, 40);
    return () => window.clearTimeout(show);
  }, [locale]);

  const value = useMemo<Ctx>(() => {
    function setLocale(next: Locale) {
      if (next === locale || swapping.current) return;
      const apply = () => {
        setLocaleState(next);
        window.localStorage.setItem("boo-locale", next);
      };
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        apply();
        return;
      }
      swapping.current = true;
      document.documentElement.classList.add("locale-fading");
      window.setTimeout(apply, 220);
    }
    function setCurrency(next: Currency) {
      setCurrencyState(next);
      window.localStorage.setItem("boo-currency-code", next);
    }
    function t(key: string) {
      return COPY[locale][key] ?? COPY.en[key] ?? key;
    }
    function formatPrice(egp: number) {
      return locale === "ar" ? `${egp} ج.م` : `${egp} EGP`;
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
