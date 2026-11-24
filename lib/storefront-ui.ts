"use client";

import { create } from "zustand";
import { hideRouteLoading, startRouteLoading } from "@/components/layout/route-loading";
import { flashStatus } from "@/components/status-flash";

type StorefrontUi = {
  searchOpen: boolean;
  cartOpen: boolean;
  sectionsOpen: boolean;
  menuOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  setSectionsOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  toggleCart: () => void;
  closeOverlays: () => void;
};

export const useStorefrontUi = create<StorefrontUi>((set) => ({
  searchOpen: false,
  cartOpen: false,
  sectionsOpen: false,
  menuOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen, cartOpen: false, sectionsOpen: false, menuOpen: false }),
  setCartOpen: (cartOpen) => set({ cartOpen, searchOpen: false, sectionsOpen: false, menuOpen: false }),
  setSectionsOpen: (sectionsOpen) => set({ sectionsOpen, searchOpen: false, cartOpen: false, menuOpen: false }),
  setMenuOpen: (menuOpen) => set({ menuOpen, searchOpen: false, cartOpen: false, sectionsOpen: false }),
  toggleCart: () =>
    set((state) => ({
      cartOpen: !state.cartOpen,
      searchOpen: false,
      sectionsOpen: false,
      menuOpen: false,
    })),
  closeOverlays: () => set({ searchOpen: false, cartOpen: false, sectionsOpen: false, menuOpen: false }),
}));

export const CHECKOUT_RETURN_KEY = "boo-checkout-return";

export function rememberShopPath(path: string) {
  if (typeof window === "undefined") return;
  if (!path || path.startsWith("/checkout") || path.startsWith("/admin") || path.startsWith("/thanks")) return;
  sessionStorage.setItem(CHECKOUT_RETURN_KEY, path);
}

export function shopReturnPath() {
  if (typeof window === "undefined") return "/catalog";
  const stored = sessionStorage.getItem(CHECKOUT_RETURN_KEY) || "";
  if (stored && !stored.startsWith("/checkout")) return stored;
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === window.location.origin && !ref.pathname.startsWith("/checkout")) {
      return `${ref.pathname}${ref.search}${ref.hash}`;
    }
  } catch {
    /* ignore */
  }
  return "/catalog";
}

function onCartPage() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path === "/cart";
}

export function revealCartAfterPause(message?: string) {
  if (onCartPage()) {
    if (message) flashStatus(message);
    return;
  }
  startRouteLoading();
  window.setTimeout(() => {
    hideRouteLoading();
    if (message) flashStatus(message);
    useStorefrontUi.getState().setCartOpen(true);
  }, 700);
}
