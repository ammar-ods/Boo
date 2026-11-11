"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingBag, X } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useStorefrontUi } from "@/lib/storefront-ui";
import { useShopNavItems } from "@/components/shop/shop-sidebar";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = useCart((s) => s.items);
  const count = cartCount(items);
  const setSearchOpen = useStorefrontUi((s) => s.setSearchOpen);
  const toggleCart = useStorefrontUi((s) => s.toggleCart);
  const sectionsOpen = useStorefrontUi((s) => s.sectionsOpen);
  const setSectionsOpen = useStorefrontUi((s) => s.setSectionsOpen);
  const closeOverlays = useStorefrontUi((s) => s.closeOverlays);
  const sections = useShopNavItems();

  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-[65] md:hidden ${sectionsOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-oxford/35 transition-opacity duration-500 ${sectionsOpen ? "opacity-100" : "opacity-0"}`}
          onClick={closeOverlays}
          aria-label="Close"
        />
        <div
          className={`absolute inset-x-0 bottom-[4.75rem] mx-3 overflow-hidden rounded-[1.5rem] bg-background shadow-[0_-18px_50px_-24px_rgba(10,37,64,0.4)] ring-1 ring-oxford/10 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            sectionsOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <p className="font-heading text-lg text-oxford">{t("sections")}</p>
            <button type="button" className="grid size-9 place-items-center rounded-full bg-cream" onClick={closeOverlays}>
              <X className="size-4" />
            </button>
          </div>
          <div className="max-h-[46vh] overflow-y-auto px-2 pb-3">
            {sections.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={closeOverlays}
                className="flex min-h-12 items-center rounded-xl px-3 text-sm font-medium text-oxford hover:bg-cream"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-[66] border-t border-oxford/10 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          <Link href="/" className={tabClass(pathname === "/")} onClick={closeOverlays}>
            <Home className="size-5" />
            {t("home")}
          </Link>
          <button type="button" className={tabClass(sectionsOpen)} onClick={() => setSectionsOpen(!sectionsOpen)}>
            <LayoutGrid className="size-5" />
            {t("sections")}
          </button>
          <button type="button" className={tabClass(false)} onClick={toggleCart}>
            <span className="relative">
              <ShoppingBag className="size-5" />
              {count > 0 ? (
                <span className="absolute -end-2 -top-1 grid size-4 place-items-center rounded-full bg-oxford text-[9px] text-white">
                  {count}
                </span>
              ) : null}
            </span>
            {t("cart")}
          </button>
          <button type="button" className={tabClass(false)} onClick={() => setSearchOpen(true)}>
            <Search className="size-5" />
            {t("search")}
          </button>
        </div>
      </nav>
    </>
  );
}

function tabClass(active: boolean) {
  return cn(
    "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
    active ? "text-oxford" : "text-oxford/55",
  );
}
