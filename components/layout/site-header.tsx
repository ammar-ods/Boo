"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, MessageCircle, Search, ShoppingBag, X } from "lucide-react";
import { BooLogo } from "@/components/brand/boo-logo";
import { StudioChromePanel, StudioNavButtons } from "@/components/cms/studio-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { cartCount, cartTotal, useCart } from "@/lib/cart";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { NavMenu } from "@/components/layout/nav-menu";
import { pick } from "@/lib/site";
import { rememberShopPath, useStorefrontUi } from "@/lib/storefront-ui";
import { startRouteLoading } from "@/components/layout/route-loading";

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale, setLocale, formatPrice } = useI18n();
  const { site, isAdmin } = useEdit();
  const items = useCart((s) => s.items);
  const menuOpen = useStorefrontUi((s) => s.menuOpen);
  const setMenuOpen = useStorefrontUi((s) => s.setMenuOpen);
  const searchOpen = useStorefrontUi((s) => s.searchOpen);
  const setSearchOpen = useStorefrontUi((s) => s.setSearchOpen);
  const toggleCart = useStorefrontUi((s) => s.toggleCart);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setCount(cartCount(items));
    setTotal(cartTotal(items));
  }, [items]);

  const chatHref = whatsappChatUrl(site.chrome.whatsappPhone || site.chrome.payPhone);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setSearchOpen(false);
    startRouteLoading();
    router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
  }

  useEffect(() => {
    const search = searchParams.toString();
    rememberShopPath(`${pathname}${search ? `?${search}` : ""}`);
  }, [pathname, searchParams]);

  const links = site.chrome.navLinks.filter((link) => link.visible);

  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) return null;

  return (
    <>
    {menuOpen ? (
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-[45] bg-oxford/25 md:hidden"
        onClick={() => setMenuOpen(false)}
      />
    ) : null}
    {site.chrome.showNav ? (
      <div
        className={`fixed inset-y-0 end-0 z-[46] flex w-[min(22rem,88vw)] flex-col bg-white shadow-[0_18px_50px_-20px_rgba(10,37,64,0.45)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          menuOpen ? "translate-x-0" : "pointer-events-none translate-x-full rtl:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-oxford/8 px-5 py-4">
          <BooLogo src={site.chrome.logo} />
          <button type="button" className="rounded-full p-2" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3">
          <NavMenu links={links} locale={locale} variant="mobile" onNavigate={() => setMenuOpen(false)} />
        </div>
      </div>
    ) : null}
    <header className="sticky top-0 z-40">
      <div className="bg-oxford text-white/90" style={{ fontSize: "var(--announce-font-size, 12px)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2 sm:px-8 lg:px-12">
          <div className="flex min-w-0 items-center gap-3">
            <ThemeToggle />
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 p-0.5 text-[12px] font-medium backdrop-blur-sm">
              <button
                type="button"
                className={`rounded-full px-2.5 py-0.5 leading-tight ${locale === "ar" ? "bg-white font-bold text-oxford shadow-sm" : "text-white/70 hover:text-white"}`}
                onClick={() => setLocale("ar")}
              >
                العربية
              </button>
              <button
                type="button"
                className={`rounded-full px-2 py-0.5 leading-tight ${locale === "en" ? "bg-white font-bold text-oxford shadow-sm" : "text-white/70 hover:text-white"}`}
                onClick={() => setLocale("en")}
              >
                EN
              </button>
            </div>
            {chatHref ? (
              <>
                <span className="hidden opacity-30 sm:inline">|</span>
                <a
                  href={chatHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-white transition-colors hover:text-[#25D366]"
                >
                  <MessageCircle className="size-4" />
                  <span className="hidden sm:inline">{t("quickWhatsApp")}</span>
                </a>
              </>
            ) : null}
          </div>
          {site.chrome.showAnnouncement ? (
            <p className="min-w-0 truncate text-end">{pick(site.chrome.announcement, locale) || t("freeShip")}</p>
          ) : null}
        </div>
      </div>
      {site.chrome.showHeader ? (
        <div className="relative border-b border-oxford/8 bg-card/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className={`mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:gap-6 sm:px-8 lg:px-12 ${isAdmin ? "md:pe-44" : ""}`}>
            <Link href="/" className="shrink-0">
              <BooLogo src={site.chrome.logo} />
            </Link>
            <form className="relative mx-4 hidden min-w-0 flex-1 md:block" onSubmit={submitSearch}>
              <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-oxford/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-full bg-white py-2.5 ps-11 pe-4 text-sm text-oxford shadow-[0_2px_10px_rgba(10,37,64,0.04)] outline-none placeholder:text-oxford/40 focus:ring-2 focus:ring-oxford/20"
              />
            </form>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="grid size-10 place-items-center rounded-[12px] bg-white text-oxford shadow-[0_2px_8px_rgba(10,37,64,0.04)] md:hidden"
                aria-label={t("search")}
              >
                <Search className="size-[18px]" />
              </button>
              <button
                type="button"
                onClick={toggleCart}
                className="flex items-center gap-2 rounded-[12px] bg-white px-3 py-2 text-oxford shadow-[0_2px_8px_rgba(10,37,64,0.04)]"
                aria-label={t("cart")}
              >
                <span className="relative grid place-items-center">
                  <ShoppingBag className="size-[22px]" />
                  {count > 0 ? (
                    <span className="absolute -end-1.5 -top-1.5 grid size-4 place-items-center rounded-full bg-[#C59B27] text-[10px] font-bold text-white">
                      {count}
                    </span>
                  ) : null}
                </span>
                <span className="hidden flex-col text-start sm:flex">
                  <span className="text-[11px] font-semibold text-oxford/50">{t("cart")}</span>
                  <span className="text-[15px] font-bold leading-none">{formatPrice(total)}</span>
                </span>
              </button>
              <button
                type="button"
                className="rounded-[12px] bg-white p-2 shadow-[0_2px_8px_rgba(10,37,64,0.04)] md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
          {site.chrome.showNav ? (
            <div className="hidden h-12 bg-[#f5f3ef] shadow-[0_1px_4px_rgba(0,0,0,0.02)] md:block">
              <div className={`mx-auto flex h-full max-w-7xl items-center px-5 sm:px-8 lg:px-12 ${isAdmin ? "md:pe-44" : ""}`}>
                <NavMenu links={links} locale={locale} />
              </div>
            </div>
          ) : null}
          <StudioNavButtons />
        </div>
      ) : (
        <div className="relative h-14 bg-card/90 backdrop-blur-xl">
          <StudioNavButtons />
        </div>
      )}
      <StudioChromePanel />
      {searchOpen ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-start bg-oxford/40 px-4 pt-28"
          onClick={() => setSearchOpen(false)}
        >
          <form
            className="mx-auto w-full max-w-xl rounded-2xl bg-white p-4 shadow-[0_16px_36px_-22px_rgba(10,37,64,0.32)]"
            onClick={(event) => event.stopPropagation()}
            onSubmit={submitSearch}
          >
            <div className="flex items-center gap-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("search")}
                className="h-10 w-full bg-transparent outline-none"
              />
              <button type="button" className="text-sm text-muted-foreground" onClick={() => setSearchOpen(false)}>
                Esc
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </header>
    </>
  );
}
