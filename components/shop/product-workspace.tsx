"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productViews, localizedName, localizedDescription, type Product } from "@/lib/products";
import { useCustomizerStore } from "@/lib/store/customizer-store";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { FabricCanvas, type CanvasHandle } from "@/components/customizer/fabric-canvas";
import { ControlsPanel } from "@/components/customizer/controls-panel";
import { clearRememberedFiles } from "@/lib/upload-registry";

export function ProductWorkspace({ product }: { product: Product }) {
  const router = useRouter();
  const { locale, t, formatPrice } = useI18n();
  const hydrateProduct = useCustomizerStore((s) => s.hydrateProduct);
  const material = useCustomizerStore((s) => s.material);
  const setMaterial = useCustomizerStore((s) => s.setMaterial);
  const quantity = useCustomizerStore((s) => s.quantity);
  const setQuantity = useCustomizerStore((s) => s.setQuantity);
  const activeViewId = useCustomizerStore((s) => s.activeViewId);
  const setActiveViewId = useCustomizerStore((s) => s.setActiveViewId);
  const addItem = useCart((s) => s.addItem);
  const [canvases, setCanvases] = useState<Record<string, CanvasHandle>>({});
  const views = productViews(product);
  const colors = product.colors?.length ? product.colors : product.materials;
  const activeCanvas = canvases[activeViewId] ?? canvases[views[0]?.id];

  useEffect(() => {
    hydrateProduct(product);
    return () => clearRememberedFiles();
  }, [hydrateProduct, product]);

  const onReady = useCallback((viewId: string, handle: CanvasHandle) => {
    setCanvases((current) => ({ ...current, [viewId]: handle }));
  }, []);

  async function addToCart() {
    addItem({
      slug: product.slug,
      name: product.name,
      nameAr: product.nameAr,
      image: product.mockup,
      color: material || colors[0],
      quantity,
      priceEgp: product.priceEgp || 100,
      kind: "product",
    });
    toast.success(t("added"));
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <Link href="/catalog" className="text-sm text-oxford">
          ← {t("catalogTitle")}
        </Link>
        <div className={`grid gap-4 ${views.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {views.map((view) => (
            <div key={view.id} className="space-y-2">
              {views.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveViewId(view.id)}
                  className={`text-sm font-medium ${activeViewId === view.id ? "text-oxford" : "text-muted-foreground"}`}
                >
                  {view.id === "front" ? (locale === "ar" ? "الأمام" : "Front") : locale === "ar" ? "الخلف" : "Back"}
                </button>
              ) : null}
              {product.customizable ? (
                <FabricCanvas
                  product={product}
                  view={view}
                  onReady={(handle) => {
                    onReady(view.id, handle);
                  }}
                />
              ) : (
                <div className="relative aspect-square overflow-hidden rounded-[28px] bg-chip">
                  <Image src={view.mockup} alt="" fill className="object-contain" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <aside className="surface-card p-6">
        <p className="text-xs font-medium text-oxford/60">{product.category}</p>
        <h1 className="mt-1 font-heading text-4xl text-oxford">{localizedName(product, locale)}</h1>
        <p className="mt-3 text-2xl font-semibold text-oxford">{formatPrice(product.priceEgp || 100)}</p>
        <p className="mt-3 text-muted-foreground">{localizedDescription(product, locale)}</p>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">{t("color")}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setMaterial(color)}
                className={`rounded-full border-2 px-4 py-2 text-sm ${
                  (material || colors[0]) === color ? "border-oxford bg-oxford text-white" : "border-oxford/15 bg-white"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">{t("quantity")}</p>
          <div className="flex items-center gap-3">
            <button type="button" className="icon-circle size-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              −
            </button>
            <span className="w-8 text-center text-lg">{quantity}</span>
            <button type="button" className="icon-circle size-10" onClick={() => setQuantity(quantity + 1)}>
              +
            </button>
          </div>
        </div>

        {product.customizable ? (
          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-3 font-heading text-xl">{t("customize")}</p>
            <ControlsPanel product={product} canvas={activeCanvas ?? null} />
          </div>
        ) : null}

        <div className="mt-6 border-t border-border pt-5">
          <h2 className="font-heading text-xl">{t("details")}</h2>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted-foreground">
            <li>{formatPrice(100)}</li>
            <li>{colors.join(" · ")}</li>
            <li>{product.category}</li>
          </ul>
        </div>

        <button type="button" onClick={async () => { addToCart(); router.push("/checkout"); }} className="btn-press mt-8 w-full">
          {t("checkoutNow")}
        </button>
        <button
          type="button"
          onClick={() => {
            addToCart();
            router.push("/catalog");
          }}
          className="btn-press-outline mt-3 w-full rounded-full px-4 py-2.5 text-sm font-semibold"
        >
          {t("addAndShop")}
        </button>
      </aside>
    </div>
  );
}
