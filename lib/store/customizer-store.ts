"use client";

import { create } from "zustand";
import type { Product } from "@/lib/products";

export type UploadedAsset = {
  id: string;
  name: string;
  type: string;
  previewUrl: string;
};

export type TextDraft = {
  content: string;
  fontFamily: string;
  fill: string;
};

type CustomizerState = {
  product: Product | null;
  material: string;
  quantity: number;
  laserPreview: boolean;
  bleedWarning: boolean;
  previewMode: boolean;
  selectedKind: "none" | "image" | "text";
  textDraft: TextDraft;
  assets: UploadedAsset[];
  hydrateProduct: (product: Product) => void;
  setMaterial: (material: string) => void;
  setQuantity: (quantity: number) => void;
  setLaserPreview: (value: boolean) => void;
  setBleedWarning: (value: boolean) => void;
  setPreviewMode: (value: boolean) => void;
  setSelectedKind: (kind: CustomizerState["selectedKind"]) => void;
  setTextDraft: (draft: Partial<TextDraft>) => void;
  addAsset: (asset: UploadedAsset) => void;
  removeAsset: (id: string) => void;
  reset: () => void;
};

const defaultText: TextDraft = {
  content: "BOO",
  fontFamily: "Fredoka",
  fill: "#333333",
};

export const useCustomizerStore = create<CustomizerState>((set) => ({
  product: null,
  material: "",
  quantity: 1,
  laserPreview: false,
  bleedWarning: false,
  previewMode: false,
  selectedKind: "none",
  textDraft: defaultText,
  assets: [],
  hydrateProduct: (product) => {
    set({
      product,
      material: product.defaultMaterial ?? "",
      quantity: 1,
      laserPreview: Boolean(product.is_laser_cut),
      bleedWarning: false,
      previewMode: false,
      selectedKind: "none",
      textDraft: defaultText,
      assets: [],
    });
  },
  setMaterial: (material) => set({ material }),
  setQuantity: (quantity) =>
    set({ quantity: Math.max(1, Math.min(500, Math.round(quantity))) }),
  setLaserPreview: (laserPreview) => set({ laserPreview }),
  setBleedWarning: (bleedWarning) => set({ bleedWarning }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setSelectedKind: (selectedKind) => set({ selectedKind }),
  setTextDraft: (draft) =>
    set((state) => ({ textDraft: { ...state.textDraft, ...draft } })),
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  removeAsset: (id) =>
    set((state) => ({ assets: state.assets.filter((asset) => asset.id !== id) })),
  reset: () =>
    set({
      product: null,
      material: "",
      quantity: 1,
      laserPreview: false,
      bleedWarning: false,
      previewMode: false,
      selectedKind: "none",
      textDraft: defaultText,
      assets: [],
    }),
}));
