"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { BooLogo } from "@/components/brand/boo-logo";
import { StudioChromePanel, StudioNavButtons } from "@/components/cms/studio-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { cartCount, useCart } from "@/lib/cart";
import { NavMenu } from "@/components/layout/nav-menu";
import { pick } from "@/lib/site";
import { rememberShopPath, useStorefrontUi } from "@/lib/storefront-ui";
import { startRouteLoading } from "@/components/layout/route-loading";

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const { site, isAdmin } = useEdit();
  const items = useCart((s) => s.items);
  const menuOpen = useStorefrontUi((s) => s.menuOpen);
  const setMenuOpen = useStorefrontUi((s) => s.setMenuOpen);
  const searchOpen = useStorefrontUi((s) => s.searchOpen);
  const setSearchOpen = useStorefrontUi((s) => s.setSearchOpen);
  const toggleCart = useStorefrontUi((s) => s.toggleCart);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(cartCount(items));
  }, [items]);

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
        className={`fixed inset-y-0 start-0 z-[46] flex w-[min(22rem,88vw)] flex-col bg-white shadow-[0_18px_50px_-20px_rgba(10,37,64,0.45)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          menuOpen ? "translate-x-0" : "pointer-events-none -translate-x-full rtl:translate-x-full"
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
      {site.chrome.showAnnouncement ? (
        <div className="bg-oxford tracking-[0.12em] text-white/85" style={{ fontSize: "var(--announce-font-size, 11px)" }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 sm:px-8 lg:px-12">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button type="button" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}>
                {locale === "ar" ? "EN" : "عربي"}
              </button>
            </div>
            <p className="min-w-0 truncate">{pick(site.chrome.announcement, locale) || t("freeShip")}</p>
          </div>
        </div>
      ) : (
        <div className="bg-oxford text-white/85" style={{ fontSize: "var(--announce-font-size, 11px)" }}>
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-2 sm:px-8 lg:px-12">
            <ThemeToggle />
            <button type="button" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}>
              {locale === "ar" ? "EN" : "عربي"}
            </button>
          </div>
        </div>
      )}
      {site.chrome.showHeader ? (
        <div className="relative border-b border-oxford/8 bg-card/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className={`mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:gap-6 sm:px-8 sm:py-5 lg:px-12 ${isAdmin ? "md:pe-44" : ""}`}>
            <Link href="/" className="shrink-0">
              <BooLogo src={site.chrome.logo} />
            </Link>
            {site.chrome.showNav ? <NavMenu links={links} locale={locale} /> : null}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden size-10 place-items-center rounded-full text-oxford md:grid"
                aria-label={t("search")}
              >
                <Search className="size-[18px]" />
              </button>
              <button
                type="button"
                onClick={toggleCart}
                className="relative grid size-10 place-items-center rounded-full text-oxford"
                aria-label={t("cart")}
              >
                <ShoppingBag className="size-[18px]" />
                {count > 0 ? (
                  <span className="absolute end-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-oxford text-[10px] text-white">
                    {count}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className="rounded-full p-2 md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
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
            onSubmit={(event) => {
              event.preventDefault();
              setSearchOpen(false);
              startRouteLoading();
              router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
            }}
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
