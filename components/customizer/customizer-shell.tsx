"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCustomizerStore } from "@/lib/store/customizer-store";
import { clearRememberedFiles } from "@/lib/upload-registry";
import { FabricCanvas, type CanvasHandle } from "./fabric-canvas";
import { ControlsPanel } from "./controls-panel";
import { InquiryForm } from "./inquiry-form";
import { SuccessModal } from "./success-modal";

export function CustomizerShell({ product }: { product: Product }) {
  const hydrateProduct = useCustomizerStore((s) => s.hydrateProduct);
  const bleedWarning = useCustomizerStore((s) => s.bleedWarning);
  const previewMode = useCustomizerStore((s) => s.previewMode);
  const setPreviewMode = useCustomizerStore((s) => s.setPreviewMode);
  const [canvas, setCanvas] = useState<CanvasHandle | null>(null);
  const [success, setSuccess] = useState<{
    referenceCode: string;
    whatsappUrl: string;
  } | null>(null);

  useEffect(() => {
    hydrateProduct(product);
    return () => {
      clearRememberedFiles();
    };
  }, [hydrateProduct, product]);

  const onReady = useCallback((handle: CanvasHandle) => {
    setCanvas(handle);
  }, []);

  function togglePreview() {
    const next = !previewMode;
    setPreviewMode(next);
    canvas?.setPreviewMode(next);
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
          <div
            className={
              bleedWarning && !previewMode ? "rounded-[1.7rem] p-1 ring-2 ring-red-400" : ""
            }
          >
            <FabricCanvas product={product} onReady={onReady} />
          </div>
          <p className="text-xs text-muted-foreground">
            {previewMode
              ? "This is the clean product preview — no guides or handles."
              : "Dashed box is the safe print/etch zone. Preview hides it so you can see the finished piece."}
          </p>
        </section>

        <aside className="rounded-[1.6rem] bg-white p-5 ring-1 ring-foreground/10 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <p className="font-script text-2xl text-boo-pink">customize it</p>
          <h1 className="font-heading text-3xl">{product.name}</h1>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">{product.description}</p>
          {previewMode ? (
            <div className="rounded-2xl bg-secondary p-4 text-sm">
              Happy with the look? Send an inquiry and we’ll quote it on WhatsApp.
            </div>
          ) : (
            <ControlsPanel product={product} canvas={canvas} />
          )}
          <div className="mt-8 border-t border-border pt-5">
            <h2 className="mb-3 font-heading text-xl">Inquiry</h2>
            <InquiryForm
              product={product}
              canvas={canvas}
              onSuccess={(payload) => {
                setSuccess({
                  referenceCode: payload.referenceCode.startsWith("#")
                    ? payload.referenceCode
                    : `#${payload.referenceCode}`,
                  whatsappUrl: payload.whatsappUrl,
                });
              }}
            />
          </div>
        </aside>
      </div>
      <SuccessModal
        open={Boolean(success)}
        onOpenChange={(open) => {
          if (!open) setSuccess(null);
        }}
        referenceCode={success?.referenceCode ?? ""}
        whatsappUrl={success?.whatsappUrl ?? ""}
      />
    </div>
  );
}
