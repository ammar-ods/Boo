"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  image: string;
  color: string;
  quantity: number;
  priceEgp: number;
  kind: "product" | "bundle";
  mockup?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id"> & { id?: string }) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const id = item.id ?? `${item.slug}-${item.color}-${Date.now()}`;
        const existing = get().items.find(
          (row) => row.slug === item.slug && row.color === item.color && !item.mockup && !row.mockup,
        );
        if (existing && !item.mockup) {
          set({
            items: get().items.map((row) =>
              row.id === existing.id ? { ...row, quantity: row.quantity + item.quantity } : row,
            ),
          });
          return;
        }
        set({ items: [...get().items, { ...item, id }] });
      },
      setQuantity: (id, quantity) => {
        if (quantity < 1) {
          set({ items: get().items.filter((row) => row.id !== id) });
          return;
        }
        set({
          items: get().items.map((row) => (row.id === id ? { ...row, quantity } : row)),
        });
      },
      remove: (id) => set({ items: get().items.filter((row) => row.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    { name: "boo-cart" },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.priceEgp * item.quantity, 0);
}

export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useCart.persist.hasHydrated()) finish();
    const unsub = useCart.persist.onFinishHydration(finish);
    return unsub;
  }, []);
  return hydrated;
}
