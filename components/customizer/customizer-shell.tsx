"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { productViews, type Product, type ProductView } from "@/lib/products";
import { useCustomizerStore } from "@/lib/store/customizer-store";
import { clearRememberedFiles } from "@/lib/upload-registry";
import { FabricCanvas, type CanvasHandle } from "./fabric-canvas";
import { ControlsPanel } from "./controls-panel";
import { InquiryForm } from "./inquiry-form";

export function CustomizerShell({ product }: { product: Product }) {
  const hydrateProduct = useCustomizerStore((s) => s.hydrateProduct);
  const bleedWarning = useCustomizerStore((s) => s.bleedWarning);
  const previewMode = useCustomizerStore((s) => s.previewMode);
  const setPreviewMode = useCustomizerStore((s) => s.setPreviewMode);
  const activeViewId = useCustomizerStore((s) => s.activeViewId);
  const setActiveViewId = useCustomizerStore((s) => s.setActiveViewId);
  const [canvases, setCanvases] = useState<Record<string, CanvasHandle>>({});
  const views = productViews(product);
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

  function togglePreview() {
    const next = !previewMode;
    setPreviewMode(next);
    Object.values(canvases).forEach((canvas) => canvas.setPreviewMode(next));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="chrome-bar h-2.5" />
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:px-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/catalog" className="text-sm text-boo-teal hover:underline">
              ← Catalog
            </Link>
            <button
              type="button"
              onClick={togglePreview}
              className="inline-flex items-center gap-2 rounded-full bg-boo-ink px-4 py-2 font-heading text-sm text-white"
            >
              {previewMode ? <Pencil className="size-4" /> : <Eye className="size-4" />}
              {previewMode ? "Back to editor" : "Preview final product"}
            </button>
          </div>
          <div className={`grid gap-4 ${views.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {views.map((view) => (
              <div key={view.id} className="space-y-2">
                {views.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveViewId(view.id)}
                    className={`font-heading text-sm ${
                      activeViewId === view.id ? "text-boo-teal" : "text-muted-foreground"
                    }`}
                  >
                    {view.label}
                    {activeViewId === view.id ? " · editing" : ""}
                  </button>
                ) : null}
                <ProductViewCanvas
                  product={product}
                  view={view}
                  register={onReady}
                  highlight={bleedWarning && !previewMode && activeViewId === view.id}
                  onFocus={() => setActiveViewId(view.id)}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {previewMode
              ? wrapProduct
                ? "Artwork is clipped to the mug so it sits on the ceramic, with a light wrap shade."
                : "This is the clean product preview — no guides or handles."
              : views.length > 1
                ? "Front and back are both here. Tap a side to add art or text to it."
                : wrapProduct
                  ? "Place art on the mug face. It stays on the ceramic and shades like a wrap."
                  : "Dashed box is the safe print/etch zone."}
          </p>
        </section>

        <aside className="rounded-[1.6rem] bg-white p-5 ring-1 ring-foreground/10 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <p className="font-script text-2xl text-boo-pink">customize it</p>
          <h1 className="font-heading text-3xl">{product.name}</h1>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">{product.description}</p>
          {views.length > 1 ? (
            <p className="mb-4 rounded-2xl bg-secondary px-3 py-2 text-sm">
              Adding to <span className="font-heading">{views.find((view) => view.id === activeViewId)?.label ?? "this side"}</span>
              . The other side stays as you left it.
            </p>
          ) : null}
          <div className={previewMode ? "hidden" : ""}>
            <ControlsPanel product={product} canvas={activeCanvas} />
          </div>
          {previewMode ? (
            <div className="rounded-2xl bg-secondary p-4 text-sm">
              Happy with the look? Send an inquiry and we’ll quote it from the studio desk.
            </div>
          ) : null}
          <div className="mt-8 border-t border-border pt-5">
            <h2 className="mb-3 font-heading text-xl">Inquiry</h2>
            <InquiryForm product={product} canvases={canvases} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProductViewCanvas({
  product,
  view,
  register,
  highlight,
  onFocus,
}: {
  product: Product;
  view: ProductView;
  register: (id: string, handle: CanvasHandle) => void;
  highlight: boolean;
  onFocus: () => void;
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
      <FabricCanvas product={product} view={view} onReady={onReady} />
    </div>
  );
}
