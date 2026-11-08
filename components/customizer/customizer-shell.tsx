"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, X } from "lucide-react";
import { MUG_WRAP_FLAT, mugPhotoUrl, productViews, type Product, type ProductView } from "@/lib/products";
import { useCustomizerStore } from "@/lib/store/customizer-store";
import { clearRememberedFiles } from "@/lib/upload-registry";
import { FabricCanvas, type CanvasHandle } from "./fabric-canvas";
import { ControlsPanel } from "./controls-panel";
import { InquiryForm } from "./inquiry-form";
import { MugTurntable } from "./mug-turntable";

export function CustomizerShell({ product }: { product: Product }) {
  const hydrateProduct = useCustomizerStore((s) => s.hydrateProduct);
  const bleedWarning = useCustomizerStore((s) => s.bleedWarning);
  const previewMode = useCustomizerStore((s) => s.previewMode);
  const setPreviewMode = useCustomizerStore((s) => s.setPreviewMode);
  const activeViewId = useCustomizerStore((s) => s.activeViewId);
  const setActiveViewId = useCustomizerStore((s) => s.setActiveViewId);
  const [canvases, setCanvases] = useState<Record<string, CanvasHandle>>({});
  const [wrapTexture, setWrapTexture] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ id: string; label: string; url: string }[] | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const views = productViews(product);
  const multiView = views.length > 1;
  const activeCanvas = canvases[activeViewId] ?? canvases[views[0]?.id] ?? null;
  const wrapProduct = views.some((view) => view.wrap);

  useEffect(() => {
    hydrateProduct(product);
    return () => {
      clearRememberedFiles();
    };
  }, [hydrateProduct, product]);

  const onReady = useCallback((viewId: string, handle: CanvasHandle) => {
    setCanvases((current) => ({ ...current, [viewId]: handle }));
  }, []);

  const onWrapDesign = useCallback((overlay: string | null) => {
    setWrapTexture(overlay);
  }, []);

  async function openPreview() {
    if (previewBusy) return;
    setPreviewBusy(true);
    setPreviewMode(true);
    Object.values(canvases).forEach((canvas) => canvas.setPreviewMode(true));
    const shots: { id: string; label: string; url: string }[] = [];
    for (const view of views) {
      const handle = canvases[view.id];
      if (handle) {
        try {
          const blob = await handle.exportMockup();
          shots.push({
            id: view.id,
            label: view.label || view.id,
            url: URL.createObjectURL(blob),
          });
          continue;
        } catch {
          /* mockup fallback */
        }
      }
      shots.push({ id: view.id, label: view.label || view.id, url: view.mockup });
    }
    setPreview(shots);
    setPreviewBusy(false);
  }

  function closePreview() {
    preview?.forEach((item) => {
      if (item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
    });
    setPreview(null);
    setPreviewMode(false);
    Object.values(canvases).forEach((canvas) => canvas.setPreviewMode(false));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="chrome-bar h-2.5" />
      <div className="mx-auto grid max-w-[1400px] gap-5 px-3 py-4 sm:px-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:gap-6 lg:px-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/catalog" className="text-sm text-boo-teal hover:underline">
              ← Catalog
            </Link>
            <button
              type="button"
              onClick={() => void openPreview()}
              disabled={previewBusy}
              className="inline-flex items-center gap-2 rounded-full bg-oxford px-4 py-2 text-sm font-medium text-white"
            >
              <Eye className="size-4" />
              {previewBusy ? "…" : "Preview final product"}
            </button>
          </div>
          {wrapProduct ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {views.map((view) => (
                <div key={view.id} className="space-y-2">
                  <p className="font-heading text-sm text-boo-teal">Print wrap</p>
                  <ProductViewCanvas
                    product={product}
                    view={view}
                    register={onReady}
                    highlight={bleedWarning && !previewMode && activeViewId === view.id}
                    onFocus={() => setActiveViewId(view.id)}
                    onDesignChange={onWrapDesign}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <p className="font-heading text-sm text-muted-foreground">3D mug · drag to spin</p>
                <MugTurntable
                  textureUrl={wrapTexture}
                  mugPhotoUrl={mugPhotoUrl(product)}
                  wrapBounds={views.find((view) => view.wrap)?.wrapBounds ?? MUG_WRAP_FLAT.wrapBounds}
                />
              </div>
            </div>
          ) : (
            <div
              className={`grid items-center justify-items-center gap-4 py-3 ${multiView ? "sm:grid-cols-2" : ""}`}
              onClick={(event) => {
                if (event.target === event.currentTarget) void openPreview();
              }}
            >
              {views.map((view) => {
                const active = !multiView || activeViewId === view.id;
                return (
                  <div
                    key={view.id}
                    className={`w-full max-w-[min(100%,22rem)] origin-center space-y-2 transition duration-300 sm:max-w-none ${
                      active
                        ? "z-10 scale-100 opacity-100 sm:scale-[1.03]"
                        : "hidden scale-[0.86] opacity-40 grayscale brightness-90 sm:block"
                    }`}
                  >
                    {multiView ? (
                      <button
                        type="button"
                        onClick={() => setActiveViewId(view.id)}
                        className={`font-heading text-sm ${
                          active ? "text-oxford" : "text-muted-foreground"
                        }`}
                      >
                        {view.label}
                        {active ? " · editing" : ""}
                      </button>
                    ) : null}
                    <div className={active ? "rounded-[1.8rem] ring-4 ring-oxford/30" : "rounded-[1.8rem]"}>
                      <div className={active ? "" : "pointer-events-none"}>
                        <ProductViewCanvas
                          product={product}
                          view={view}
                          register={onReady}
                          highlight={bleedWarning && !previewMode && active}
                          onFocus={() => setActiveViewId(view.id)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {previewMode
              ? wrapProduct
                ? "The wrap is mapped onto a lightweight 3D mug — drag it to rotate. No extra libraries needed."
                : "This is the clean product preview — no guides or handles."
              : views.length > 1
                ? "Front and back are both here. Tap a side to add art or text to it."
                : wrapProduct
                  ? "Left is the print wrap (seam to seam). The photo on the right stays still — spin to move your art around it."
                  : "Dashed box is the safe print/etch zone."}
          </p>
        </section>

        <aside className="rounded-[1.6rem] bg-white p-4 ring-1 ring-foreground/10 sm:p-5 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <p className="font-script text-2xl text-boo-pink">customize it</p>
          <h1 className="font-heading text-2xl sm:text-3xl">{product.name}</h1>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">{product.description}</p>
          {views.length > 1 ? (
            <p className="mb-4 rounded-2xl bg-secondary px-3 py-2 text-sm">
              Adding to <span className="font-heading">{views.find((view) => view.id === activeViewId)?.label ?? "this side"}</span>
              . The other side stays as you left it.
            </p>
          ) : null}
          <ControlsPanel product={product} canvas={activeCanvas} />
          <div className="mt-8 border-t border-border pt-5">
            <h2 className="mb-3 font-heading text-xl">Inquiry</h2>
            <InquiryForm product={product} canvases={canvases} />
          </div>
        </aside>
      </div>
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
              <h3 className="font-heading text-2xl text-oxford">Preview final product</h3>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-2xl bg-cream"
                onClick={closePreview}
                aria-label="Close"
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
              {wrapProduct && wrapTexture ? (
                <div className="space-y-2 sm:col-span-2">
                  <p className="text-sm font-semibold text-oxford">3D mug</p>
                  <MugTurntable
                    textureUrl={wrapTexture}
                    mugPhotoUrl={mugPhotoUrl(product)}
                    wrapBounds={views.find((view) => view.wrap)?.wrapBounds ?? MUG_WRAP_FLAT.wrapBounds}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductViewCanvas({
  product,
  view,
  register,
  highlight,
  onFocus,
  onDesignChange,
}: {
  product: Product;
  view: ProductView;
  register: (id: string, handle: CanvasHandle) => void;
  highlight: boolean;
  onFocus: () => void;
  onDesignChange?: (overlay: string | null) => void;
}) {
  const onReady = useCallback(
    (handle: CanvasHandle) => register(view.id, handle),
    [register, view.id],
  );
  return (
    <div
      className={highlight ? "rounded-[1.7rem] p-1 ring-2 ring-red-400" : ""}
      onPointerDown={onFocus}
    >
      <FabricCanvas
        product={product}
        view={view}
        onReady={onReady}
        onDesignChange={onDesignChange}
      />
    </div>
  );
}
