"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { BooLogo } from "@/components/brand/boo-logo";
import { StudioChromePanel, StudioNavButtons } from "@/components/cms/studio-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEdit } from "@/lib/edit-context";
import { useI18n, type Currency } from "@/lib/i18n";
import { cartCount, useCart } from "@/lib/cart";
import { pick } from "@/lib/site";

const CURRENCIES: Currency[] = ["EGP", "USD", "EUR", "GBP"];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale, currency, setCurrency } = useI18n();
  const { site, isAdmin } = useEdit();
  const items = useCart((s) => s.items);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button type="button" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}>
                {locale === "ar" ? "EN" : "عربي"}
              </button>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value as Currency)}
                className="bg-transparent text-white/90 outline-none"
                aria-label="Currency"
              >
                {CURRENCIES.map((item) => (
                  <option key={item} value={item} className="text-oxford">
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <p className="min-w-0 truncate">{pick(site.chrome.announcement, locale) || t("freeShip")}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-oxford px-4 py-2 text-[11px] text-white/85">
          <ThemeToggle />
          <button type="button" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}>
            {locale === "ar" ? "EN" : "عربي"}
          </button>
        </div>
      )}
      {site.chrome.showHeader ? (
        <div className="relative border-b border-oxford/8 bg-cream">
          <div className={`mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-5 ${isAdmin ? "md:pe-44" : ""}`}>
            <Link href="/" className="shrink-0">
              <BooLogo />
            </Link>
            {site.chrome.showNav ? (
              <nav className="hidden items-center gap-7 text-[15px] font-medium text-oxford md:flex">
                {links.map((link) => (
                  <Link key={link.id} href={link.href} className="hover:text-oxford/55">
                    {pick(link.label, locale)}
                  </Link>
                ))}
              </nav>
            ) : null}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="grid size-10 place-items-center rounded-full text-oxford"
                aria-label={t("search")}
              >
                <Search className="size-[18px]" />
              </button>
              <Link href="/cart" className="relative grid size-10 place-items-center rounded-full text-oxford" aria-label={t("cart")}>
                <ShoppingBag className="size-[18px]" />
                {count > 0 ? (
                  <span className="absolute end-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-oxford text-[10px] text-white">
                    {count}
                  </span>
                ) : null}
              </Link>
              <button type="button" className="rounded-full p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
          {open && site.chrome.showNav ? (
            <div className="flex flex-col border-t border-oxford/8 px-4 py-2 md:hidden">
              {links.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center text-base font-medium text-oxford"
                >
                  {pick(link.label, locale)}
                </Link>
              ))}
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
          className="fixed inset-0 z-50 grid place-items-start bg-oxford/40 px-4 pt-28"
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
