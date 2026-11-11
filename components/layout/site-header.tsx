"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { BooLogo } from "@/components/brand/boo-logo";
import { StudioChromePanel, StudioNavButtons } from "@/components/cms/studio-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { cartCount, useCart } from "@/lib/cart";
import { NavMenu } from "@/components/layout/nav-menu";
import { pick } from "@/lib/site";
import { useStorefrontUi } from "@/lib/storefront-ui";

export function SiteHeader() {
  const pathname = usePathname();
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

  const links = site.chrome.navLinks.filter((link) => link.visible);

  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) return null;

  return (
    <header className="sticky top-0 z-40">
      {site.chrome.showAnnouncement ? (
        <div className="bg-oxford text-[11px] tracking-[0.12em] text-white/85">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2 sm:px-8">
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
        <div className="bg-oxford text-[11px] text-white/85">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2 sm:px-8">
            <ThemeToggle />
            <button type="button" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}>
              {locale === "ar" ? "EN" : "عربي"}
            </button>
          </div>
        </div>
      )}
      {site.chrome.showHeader ? (
        <div className="relative border-b border-oxford/8 bg-cream">
          <div className={`mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:gap-4 sm:px-8 sm:py-5 ${isAdmin ? "md:pe-44" : ""}`}>
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
          {site.chrome.showNav ? (
            <div
              className={`grid md:hidden ${menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-oxford/8 px-5 py-2 sm:px-8">
                  <NavMenu links={links} locale={locale} variant="mobile" onNavigate={() => setMenuOpen(false)} />
                </div>
              </div>
            </div>
          ) : null}
          <StudioNavButtons />
        </div>
      ) : (
        <div className="relative h-14 bg-cream">
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
              router.push(`/catalog?q=${encodeURIComponent(query)}`);
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
  );
}
