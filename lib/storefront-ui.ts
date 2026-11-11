"use client";

import { create } from "zustand";

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
