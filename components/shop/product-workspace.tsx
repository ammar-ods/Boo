"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, X } from "lucide-react";
import { toast } from "sonner";
import { productViews, localizedName, localizedDescription, type Product } from "@/lib/products";
import { useCustomizerStore } from "@/lib/store/customizer-store";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { FabricCanvas, type CanvasHandle } from "@/components/customizer/fabric-canvas";
import { ControlsPanel } from "@/components/customizer/controls-panel";
import { storeOrderAsset } from "@/lib/order-assets";
import { allRememberedFiles, clearRememberedFiles, uploadRegistry } from "@/lib/upload-registry";

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
  const assets = useCustomizerStore((s) => s.assets);
  const [canvases, setCanvases] = useState<Record<string, CanvasHandle>>({});
  const [preview, setPreview] = useState<{ id: string; label: string; url: string }[] | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const views = productViews(product);
  const colors = product.colors?.length ? product.colors : product.materials;
  const activeCanvas = canvases[activeViewId] ?? canvases[views[0]?.id];
  const multiView = views.length > 1;

  useEffect(() => {
    hydrateProduct(product);
    return () => clearRememberedFiles();
  }, [hydrateProduct, product]);

  useEffect(() => {
    if (!preview) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  const onReady = useCallback((viewId: string, handle: CanvasHandle) => {
    setCanvases((current) => ({ ...current, [viewId]: handle }));
  }, []);

  function viewLabel(view: { id: string; label?: string }) {
    if (view.label) return view.label;
    if (view.id === "front") return locale === "ar" ? "الأمام" : "Front";
    if (view.id === "back") return locale === "ar" ? "الخلف" : "Back";
    return view.id;
  }

  async function openPreview() {
    if (previewBusy) return;
    setPreviewBusy(true);
    Object.values(canvases).forEach((canvas) => canvas.setPreviewMode(true));
    const shots: { id: string; label: string; url: string }[] = [];
    for (const view of views) {
      const handle = canvases[view.id];
      if (handle) {
        try {
          const blob = await handle.exportMockup();
          shots.push({ id: view.id, label: viewLabel(view), url: URL.createObjectURL(blob) });
          continue;
        } catch {
          /* fall through to mockup */
        }
      }
      shots.push({ id: view.id, label: viewLabel(view), url: view.mockup });
    }
    setPreview(shots);
    setPreviewBusy(false);
  }

  function closePreview() {
    preview?.forEach((item) => {
      if (item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
    });
    setPreview(null);
    Object.values(canvases).forEach((canvas) => canvas.setPreviewMode(false));
  }

  async function addToCart() {
    if (cartBusy) return;
    setCartBusy(true);
    try {
      Object.values(canvases).forEach((canvas) => canvas.setPreviewMode(true));
      const viewMockups: { id: string; label: string; url: string }[] = [];
      for (const view of views) {
        const handle = canvases[view.id];
        if (handle) {
          try {
            const blob = await handle.exportMockup();
            const file = new File([blob], `${product.slug}-${view.id}.jpg`, { type: blob.type || "image/jpeg" });
            viewMockups.push({
              id: view.id,
              label: viewLabel(view),
              url: await storeOrderAsset(file),
            });
            continue;
          } catch {
            /* use blank mockup */
          }
        }
        viewMockups.push({ id: view.id, label: viewLabel(view), url: view.mockup });
      }
      const uploads: { name: string; url: string }[] = [];
      for (const asset of assets) {
        const remembered = uploadRegistry.get(asset.id);
        if (remembered) {
          uploads.push({ name: asset.name, url: await storeOrderAsset(remembered) });
        }
      }
      if (uploads.length === 0) {
        for (const file of allRememberedFiles()) {
          uploads.push({ name: file.name, url: await storeOrderAsset(file) });
        }
      }
      Object.values(canvases).forEach((canvas) => canvas.setPreviewMode(false));
      addItem({
        slug: product.slug,
        name: product.name,
        nameAr: product.nameAr,
        image: viewMockups[0]?.url || product.mockup,
        color: material || colors[0],
        quantity,
        priceEgp: product.priceEgp || 100,
        kind: "product",
        viewMockups,
        uploads,
      });
      toast.success(t("added"));
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the design");
      return false;
    } finally {
      setCartBusy(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <Link href="/catalog" className="text-sm text-oxford">
          ← {t("catalogTitle")}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {multiView
            ? views.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveViewId(view.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeViewId === view.id
                      ? "bg-oxford text-white"
                      : "bg-white text-oxford ring-1 ring-oxford/15 hover:ring-oxford/40"
                  }`}
                >
                  {viewLabel(view)}
                </button>
              ))
            : null}
          {product.customizable ? (
            <button
              type="button"
              className="ms-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-oxford ring-1 ring-oxford/15"
              onClick={() => void openPreview()}
              disabled={previewBusy}
            >
              <Eye className="size-4" />
              {previewBusy ? "…" : t("previewProduct")}
            </button>
          ) : null}
        </div>
        <div
          className={`grid items-start justify-items-center gap-6 py-4 ${multiView ? "sm:grid-cols-2" : ""}`}
          onClick={(event) => {
            if (!product.customizable) return;
            if (event.target === event.currentTarget) void openPreview();
          }}
        >
          {views.map((view) => {
            const active = !multiView || activeViewId === view.id;
            return (
              <div
                key={view.id}
                className={`w-full max-w-md origin-center space-y-2 transition duration-300 ${
                  active
                    ? "z-10 scale-[1.05] opacity-100"
                    : "scale-[0.86] opacity-40 grayscale brightness-90"
                }`}
                onPointerDown={() => {
                  if (multiView) setActiveViewId(view.id);
                }}
              >
                <p className="text-sm font-medium text-oxford">
                  {viewLabel(view)}
                  {active && product.customizable ? (
                    <span className="ms-2 rounded-full bg-oxford px-2 py-0.5 text-[11px] text-white">
                      {t("editingSide")}
                    </span>
                  ) : null}
                </p>
                <div className={active ? "rounded-[1.8rem] ring-4 ring-oxford/30" : "rounded-[1.8rem]"}>
                  {product.customizable ? (
                    <div className={active ? "" : "pointer-events-none"}>
                      <FabricCanvas
                        product={product}
                        view={view}
                        onReady={(handle) => {
                          onReady(view.id, handle);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-square overflow-hidden rounded-[28px] bg-chip">
                      <Image src={view.mockup} alt="" fill className="object-contain" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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

        <button
          type="button"
          disabled={cartBusy}
          onClick={() => {
            void addToCart().then((ok) => {
              if (ok) router.push("/checkout");
            });
          }}
          className="btn-press mt-8 w-full"
        >
          {cartBusy ? "…" : t("checkoutNow")}
        </button>
        <button
          type="button"
          disabled={cartBusy}
          onClick={() => {
            void addToCart().then((ok) => {
              if (ok) router.push("/catalog");
            });
          }}
          className="btn-press-outline mt-3 w-full rounded-full px-4 py-2.5 text-sm font-semibold"
        >
          {cartBusy ? "…" : t("addAndShop")}
        </button>
      </aside>

      {preview ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-oxford/50 p-3 backdrop-blur-[2px] sm:p-6"
          onClick={closePreview}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-background shadow-[0_24px_80px_-28px_rgba(10,37,64,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-oxford/10 px-5 py-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-oxford/50 uppercase">
                  {localizedName(product, locale)}
                </p>
                <h3 className="font-heading text-2xl text-oxford">{t("previewProduct")}</h3>
              </div>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-2xl bg-cream"
                onClick={closePreview}
                aria-label={t("closePreview")}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className={`grid min-h-0 flex-1 gap-4 overflow-y-auto p-5 ${preview.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {preview.map((item) => (
                <figure key={item.id} className="space-y-2">
                  <figcaption className="text-sm font-semibold text-oxford">{item.label}</figcaption>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.label} className="w-full rounded-[24px] bg-chip object-contain" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
