"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/lib/products";
import { useCustomizerStore } from "@/lib/store/customizer-store";

type FabricMod = typeof import("fabric");

export type CanvasHandle = {
  addImageFromFile: (file: File, id: string) => Promise<void>;
  addText: () => void;
  applyTextDraft: () => void;
  applyLaser: (enabled: boolean) => void;
  setPreviewMode: (preview: boolean) => void;
  deleteSelected: () => void;
  exportMockup: () => Promise<Blob>;
  exportJson: () => string;
  hasDesign: () => boolean;
};

export function FabricCanvas({
  product,
  onReady,
}: {
  product: Product;
  onReady: (handle: CanvasHandle) => void;
}) {
  const hostRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<InstanceType<FabricMod["Canvas"]> | null>(null);
  const fabricRef = useRef<FabricMod | null>(null);
  const setBleedWarning = useCustomizerStore((s) => s.setBleedWarning);
  const setSelectedKind = useCustomizerStore((s) => s.setSelectedKind);
  const setTextDraft = useCustomizerStore((s) => s.setTextDraft);
  const laserPreview = useCustomizerStore((s) => s.laserPreview);
  const previewMode = useCustomizerStore((s) => s.previewMode);
  const textDraft = useCustomizerStore((s) => s.textDraft);

  const textDraftRef = useRef(textDraft);
  textDraftRef.current = textDraft;
  const laserRef = useRef(laserPreview);
  laserRef.current = laserPreview;

  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;

    async function boot() {
      const fabric = await import("fabric");
      if (disposed || !hostRef.current) return;
      fabricRef.current = fabric;

      fabric.FabricObject.ownDefaults.cornerColor = "#32B7B2";
      fabric.FabricObject.ownDefaults.cornerStyle = "circle";
      fabric.FabricObject.ownDefaults.transparentCorners = false;
      fabric.FabricObject.ownDefaults.borderColor = "#F96C9F";

      const canvas = new fabric.Canvas(hostRef.current, {
        width: product.canvasWidth,
        height: product.canvasHeight,
        preserveObjectStacking: true,
        backgroundColor: "transparent",
        selection: true,
      });
      canvasRef.current = canvas;

      const fit = () => {
        const width = Math.max(
          280,
          Math.round(wrapRef.current?.clientWidth || product.canvasWidth),
        );
        const zoom = width / product.canvasWidth;
        canvas.setDimensions({ width, height: width });
        canvas.setZoom(zoom);
        if (canvas.wrapperEl) {
          canvas.wrapperEl.style.width = `${width}px`;
          canvas.wrapperEl.style.height = `${width}px`;
        }
        canvas.requestRenderAll();
      };
      fit();
      observer = new ResizeObserver(fit);
      if (wrapRef.current) observer.observe(wrapRef.current);

      const checkBleed = () => {
        const safe = product.safe_zone_bounds;
        const designs = canvas.getObjects().filter(isDesign);
        const outside = designs.some((obj) => {
          obj.setCoords();
          const corners = obj.aCoords;
          if (!corners) return false;
          const xs = [corners.tl.x, corners.tr.x, corners.bl.x, corners.br.x];
          const ys = [corners.tl.y, corners.tr.y, corners.bl.y, corners.br.y];
          const left = Math.min(...xs);
          const top = Math.min(...ys);
          const right = Math.max(...xs);
          const bottom = Math.max(...ys);
          return (
            left < safe.left - 1 ||
            top < safe.top - 1 ||
            right > safe.left + safe.width + 1 ||
            bottom > safe.top + safe.height + 1
          );
        });
        setBleedWarning(outside);
      };

      const syncSelection = () => {
        const obj = canvas.getActiveObject();
        if (!obj || !isDesign(obj)) {
          setSelectedKind("none");
          return;
        }
        if (obj.type === "i-text" || obj.type === "textbox" || obj.type === "text") {
          setSelectedKind("text");
          setTextDraft({
            content: "text" in obj ? String((obj as { text?: string }).text ?? "") : "",
            fontFamily: String((obj as any).fontFamily ?? "Nunito"),
            fill: String(obj.fill ?? "#333333"),
          });
        } else {
          setSelectedKind("image");
        }
      };

      canvas.on("object:modified", checkBleed);
      canvas.on("object:moving", checkBleed);
      canvas.on("object:scaling", checkBleed);
      canvas.on("object:rotating", checkBleed);
      canvas.on("selection:created", syncSelection);
      canvas.on("selection:updated", syncSelection);
      canvas.on("selection:cleared", () => setSelectedKind("none"));

      const applyLaser = (enabled: boolean) => {
        canvas.getObjects().forEach((obj) => {
          if (isDesign(obj) && obj instanceof fabric.FabricImage) {
            obj.filters = enabled
              ? [
                  new fabric.filters.Grayscale(),
                  new fabric.filters.Contrast({ contrast: 0.42 }),
                ]
              : [];
            obj.applyFilters();
          }
        });
        canvas.requestRenderAll();
      };

      const addImageFromFile = async (file: File, id: string) => {
        const dataUrl = await fileToImageDataUrl(file);
        const image = await fabric.FabricImage.fromURL(dataUrl);
        const safe = product.safe_zone_bounds;
        const maxW = safe.width * 0.72;
        if ((image.width ?? 1) * (image.scaleX ?? 1) > maxW) {
          image.scaleToWidth(maxW);
        }
        image.set({
          left: safe.left + safe.width / 2,
          top: safe.top + safe.height / 2,
          originX: "center",
          originY: "center",
          selectable: true,
          evented: true,
        });
        (image as { isDesignLayer?: boolean }).isDesignLayer = true;
        canvas.add(image);
        canvas.setActiveObject(image);
        applyLaser(laserRef.current);
        checkBleed();
      };

      const addText = () => {
        const draft = textDraftRef.current;
        const safe = product.safe_zone_bounds;
        const text = new fabric.IText(draft.content || "BOO", {
          left: safe.left + safe.width / 2,
          top: safe.top + safe.height / 2,
          originX: "center",
          originY: "center",
          fontFamily: draft.fontFamily,
          fill: draft.fill,
          fontSize: 42,
          selectable: true,
          evented: true,
        });
        (text as { isDesignLayer?: boolean }).isDesignLayer = true;
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        canvas.requestRenderAll();
        checkBleed();
      };

      const applyTextDraft = () => {
        const obj = canvas.getActiveObject();
        const draft = textDraftRef.current;
        if (!obj || (obj.type !== "i-text" && obj.type !== "text")) return;
        obj.set({
          text: draft.content,
          fontFamily: draft.fontFamily,
          fill: draft.fill,
        });
        canvas.requestRenderAll();
        checkBleed();
      };

      const exportMockup = async () => {
        canvas.discardActiveObject();
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.setDimensions({
          width: product.canvasWidth,
          height: product.canvasHeight,
        });
        const overlay = canvas.toDataURL({
          format: "png",
          multiplier: 1,
        });
        fit();
        const dest = document.createElement("canvas");
        dest.width = product.canvasWidth;
        dest.height = product.canvasHeight;
        const ctx = dest.getContext("2d");
        if (!ctx) throw new Error("Could not export mockup");
        ctx.fillStyle = "#f6f3ee";
        ctx.fillRect(0, 0, dest.width, dest.height);
        const productImage = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = product.mockup;
        });
        ctx.drawImage(productImage, 0, 0, dest.width, dest.height);
        const overlayImage = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = overlay;
        });
        ctx.drawImage(overlayImage, 0, 0, dest.width, dest.height);
        return await new Promise<Blob>((resolve, reject) => {
          dest.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("blob failed"))),
            "image/jpeg",
            0.72,
          );
        });
      };

      onReady({
        addImageFromFile,
        addText,
        applyTextDraft,
        applyLaser,
        setPreviewMode: (preview) => {
          canvas.discardActiveObject();
          canvas.selection = !preview;
          canvas.getObjects().forEach((obj) => {
            if (!isDesign(obj) && !(obj as { isDesignLayer?: boolean }).isDesignLayer) return;
            obj.set({
              hasControls: !preview,
              hasBorders: !preview,
              selectable: !preview,
              evented: !preview,
            });
            (obj as { isDesignLayer?: boolean }).isDesignLayer = true;
          });
          canvas.requestRenderAll();
        },
        deleteSelected: () => {
          const obj = canvas.getActiveObject();
          if (obj && isDesign(obj)) {
            canvas.remove(obj);
            checkBleed();
          }
        },
        exportMockup,
        exportJson: () => JSON.stringify(canvas.toJSON()),
        hasDesign: () =>
          canvas.getObjects().some(isDesign),
      });

      canvas.requestRenderAll();
    }

    void boot();

    return () => {
      disposed = true;
      observer?.disconnect();
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
  }, [onReady, product, setBleedWarning, setSelectedKind, setTextDraft]);

  useEffect(() => {
    canvasRef.current
      ?.getObjects()
      .forEach((obj) => {
        const fabric = fabricRef.current;
        if (!fabric || !isDesign(obj) || !(obj instanceof fabric.FabricImage)) {
          return;
        }
        obj.filters = laserPreview
          ? [
              new fabric.filters.Grayscale(),
              new fabric.filters.Contrast({ contrast: 0.42 }),
            ]
          : [];
        obj.applyFilters();
      });
    canvasRef.current?.requestRenderAll();
  }, [laserPreview]);

  return (
    <div
      ref={wrapRef}
      className="relative aspect-square w-full overflow-hidden rounded-[1.6rem] bg-[#f6f3ee] ring-1 ring-foreground/10"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.mockup}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
      />
      {!previewMode && product.showSafeZone !== false ? (
        <div
          className="pointer-events-none absolute z-20 rounded-md border-2 border-dashed border-[#32B7B2]/80"
          style={{
            left: `${(product.safe_zone_bounds.left / product.canvasWidth) * 100}%`,
            top: `${(product.safe_zone_bounds.top / product.canvasHeight) * 100}%`,
            width: `${(product.safe_zone_bounds.width / product.canvasWidth) * 100}%`,
            height: `${(product.safe_zone_bounds.height / product.canvasHeight) * 100}%`,
          }}
        />
      ) : null}
      <canvas ref={hostRef} className="relative z-10" />
    </div>
  );
}

function isDesign(obj: { selectable?: boolean; evented?: boolean; isDesignLayer?: boolean }) {
  return obj.isDesignLayer === true || (obj.selectable !== false && obj.evented !== false);
}

async function fileToImageDataUrl(file: File) {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not rasterize PDF");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    return canvas.toDataURL("image/png");
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
