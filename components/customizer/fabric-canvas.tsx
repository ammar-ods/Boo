"use client";

import { useEffect, useRef } from "react";
import type { Product, ProductView, SafeZone } from "@/lib/products";
import { productViews } from "@/lib/products";
import { useCustomizerStore } from "@/lib/store/customizer-store";

type FabricMod = typeof import("fabric");

export type ViewMockup = {
  id: string;
  label: string;
  blob: Blob;
};

export type CanvasHandle = {
  addImageFromFile: (file: File, id: string) => Promise<void>;
  addText: () => void;
  applyTextDraft: () => void;
  applyLaser: (enabled: boolean) => void;
  setPreviewMode: (preview: boolean) => void;
  applyView: (view: ProductView, json?: string) => Promise<void>;
  deleteSelected: () => void;
  exportMockup: () => Promise<Blob>;
  exportViewMockups: (designs: Record<string, string>) => Promise<ViewMockup[]>;
  exportJson: () => string;
  hasDesign: () => boolean;
};

export function FabricCanvas({
  product,
  view,
  onReady,
}: {
  product: Product;
  view: ProductView;
  onReady: (handle: CanvasHandle) => void;
}) {
  const hostRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const wrapPreviewRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<InstanceType<FabricMod["Canvas"]> | null>(null);
  const fabricRef = useRef<FabricMod | null>(null);
  const viewRef = useRef(view);
  const productRef = useRef(product);
  viewRef.current = view;
  productRef.current = product;

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
  const previewRef = useRef(previewMode);
  previewRef.current = previewMode;

  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;

    async function boot() {
      const fabric = await import("fabric");
      if (disposed || !hostRef.current) return;
      fabricRef.current = fabric;

      fabric.FabricObject.customProperties = [
        ...(fabric.FabricObject.customProperties ?? []),
        "isDesignLayer",
      ];
      fabric.FabricObject.ownDefaults.cornerColor = "#32B7B2";
      fabric.FabricObject.ownDefaults.cornerStyle = "circle";
      fabric.FabricObject.ownDefaults.transparentCorners = false;
      fabric.FabricObject.ownDefaults.borderColor = "#F96C9F";

      const canvas = new fabric.Canvas(hostRef.current, {
        width: productRef.current.canvasWidth,
        height: productRef.current.canvasHeight,
        preserveObjectStacking: true,
        backgroundColor: "transparent",
        selection: true,
      });
      canvasRef.current = canvas;

      const fit = () => {
        const current = productRef.current;
        const width = Math.max(
          280,
          Math.round(wrapRef.current?.clientWidth || current.canvasWidth),
        );
        const zoom = width / current.canvasWidth;
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
        const safe = viewRef.current.safe_zone_bounds;
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
            fontFamily: String((obj as { fontFamily?: string }).fontFamily ?? "Nunito"),
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

      const addImageFromFile = async (file: File) => {
        const dataUrl = await fileToImageDataUrl(file);
        const image = await fabric.FabricImage.fromURL(dataUrl);
        const safe = viewRef.current.safe_zone_bounds;
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
        const safe = viewRef.current.safe_zone_bounds;
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

      const setObjectPreview = (preview: boolean) => {
        canvas.discardActiveObject();
        canvas.selection = !preview;
        canvas.getObjects().forEach((obj) => {
          if (!isDesign(obj)) return;
          obj.set({
            hasControls: !preview,
            hasBorders: !preview,
            selectable: !preview,
            evented: !preview,
          });
          (obj as { isDesignLayer?: boolean }).isDesignLayer = true;
        });
        canvas.requestRenderAll();
      };

      const overlayDataUrl = () => {
        canvas.discardActiveObject();
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.setDimensions({
          width: productRef.current.canvasWidth,
          height: productRef.current.canvasHeight,
        });
        const overlay = canvas.toDataURL({ format: "png", multiplier: 1 });
        fit();
        return overlay;
      };

      const compositeMockup = async (mockupSrc: string, overlaySrc: string, wrap: boolean, safe: SafeZone) => {
        const dest = document.createElement("canvas");
        dest.width = productRef.current.canvasWidth;
        dest.height = productRef.current.canvasHeight;
        const ctx = dest.getContext("2d");
        if (!ctx) throw new Error("Could not export mockup");
        ctx.fillStyle = "#f6f3ee";
        ctx.fillRect(0, 0, dest.width, dest.height);
        const productImage = await loadHtmlImage(mockupSrc);
        ctx.drawImage(productImage, 0, 0, dest.width, dest.height);
        const overlayImage = await loadHtmlImage(overlaySrc);
        if (wrap) drawCylindricalWrap(ctx, overlayImage, safe);
        else ctx.drawImage(overlayImage, 0, 0, dest.width, dest.height);
        return await new Promise<Blob>((resolve, reject) => {
          dest.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("blob failed"))),
            "image/jpeg",
            0.82,
          );
        });
      };

      const paintWrapPreview = async () => {
        const previewCanvas = wrapPreviewRef.current;
        const wrapBox = wrapRef.current;
        if (!previewCanvas || !wrapBox || !viewRef.current.wrap) return;
        const overlay = overlayDataUrl();
        const size = wrapBox.clientWidth || productRef.current.canvasWidth;
        previewCanvas.width = size;
        previewCanvas.height = size;
        const ctx = previewCanvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, size, size);
        const overlayImage = await loadHtmlImage(overlay);
        const scale = size / productRef.current.canvasWidth;
        ctx.save();
        ctx.scale(scale, scale);
        drawCylindricalWrap(ctx, overlayImage, viewRef.current.safe_zone_bounds);
        ctx.restore();
      };

      const exportMockup = async () => {
        const current = viewRef.current;
        const overlay = overlayDataUrl();
        return compositeMockup(current.mockup, overlay, Boolean(current.wrap), current.safe_zone_bounds);
      };

      const loadJson = async (json?: string) => {
        canvas.clear();
        if (json) {
          try {
            await canvas.loadFromJSON(JSON.parse(json));
            canvas.getObjects().forEach((obj) => {
              (obj as { isDesignLayer?: boolean }).isDesignLayer = true;
            });
          } catch {
            /* empty or invalid layer */
          }
        }
        applyLaser(laserRef.current);
        setObjectPreview(previewRef.current);
        checkBleed();
        canvas.requestRenderAll();
      };

      onReady({
        addImageFromFile,
        addText,
        applyTextDraft,
        applyLaser,
        setPreviewMode: (preview) => {
          try {
            setObjectPreview(preview);
            if (preview && viewRef.current.wrap) void paintWrapPreview();
          } catch {
            /* canvas may be mid-render */
          }
        },
        applyView: async (nextView, json) => {
          viewRef.current = nextView;
          await loadJson(json);
          if (previewRef.current && nextView.wrap) await paintWrapPreview();
        },
        deleteSelected: () => {
          const obj = canvas.getActiveObject();
          if (obj && isDesign(obj)) {
            canvas.remove(obj);
            checkBleed();
          }
        },
        exportMockup,
        exportViewMockups: async (designs) => {
          const currentJson = JSON.stringify(canvas.toJSON());
          const currentView = viewRef.current;
          const results: ViewMockup[] = [];
          for (const item of productViews(productRef.current)) {
            viewRef.current = item;
            await loadJson(item.id === currentView.id ? currentJson : designs[item.id]);
            results.push({
              id: item.id,
              label: item.label,
              blob: await exportMockup(),
            });
          }
          viewRef.current = currentView;
          await loadJson(currentJson);
          return results;
        },
        exportJson: () => JSON.stringify(canvas.toJSON()),
        hasDesign: () => canvas.getObjects().some(isDesign),
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
  }, [onReady, setBleedWarning, setSelectedKind, setTextDraft]);

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

  const wrap = Boolean(view.wrap) && previewMode;

  return (
    <div
      ref={wrapRef}
      className="relative aspect-square w-full overflow-hidden rounded-[1.6rem] bg-[#f6f3ee] ring-1 ring-foreground/10"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={view.mockup}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
      />
      <div className={wrap ? "relative z-10 h-full w-full opacity-0" : "relative z-10 h-full w-full"}>
        <canvas ref={hostRef} />
      </div>
      <div
        className={
          !previewMode && product.showSafeZone !== false
            ? "pointer-events-none absolute z-20 rounded-md border-2 border-dashed border-[#32B7B2]/80"
            : "hidden"
        }
        style={{
          left: `${(view.safe_zone_bounds.left / product.canvasWidth) * 100}%`,
          top: `${(view.safe_zone_bounds.top / product.canvasHeight) * 100}%`,
          width: `${(view.safe_zone_bounds.width / product.canvasWidth) * 100}%`,
          height: `${(view.safe_zone_bounds.height / product.canvasHeight) * 100}%`,
        }}
      />
      <canvas
        ref={wrapPreviewRef}
        className={
          wrap
            ? "pointer-events-none absolute inset-0 z-20 h-full w-full"
            : "pointer-events-none absolute inset-0 z-20 hidden h-full w-full"
        }
      />
    </div>
  );
}

function isDesign(obj: { selectable?: boolean; evented?: boolean; isDesignLayer?: boolean }) {
  return obj.isDesignLayer === true;
}

function loadHtmlImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCylindricalWrap(
  ctx: CanvasRenderingContext2D,
  overlay: HTMLImageElement,
  safe: SafeZone,
) {
  const sliceCount = Math.max(120, Math.round(safe.width));
  for (let i = 0; i < sliceCount; i++) {
    const t = i / sliceCount;
    const n = t * 2 - 1;
    const curve = Math.sqrt(Math.max(0.52, 1 - n * n * 0.46));
    const sx = safe.left + t * safe.width;
    const sw = Math.max(1, overlay.width / sliceCount);
    const dx = safe.left + t * safe.width;
    const dw = safe.width / sliceCount + 0.75;
    const dh = safe.height * curve;
    const dy = safe.top + (safe.height - dh) / 2;
    ctx.drawImage(overlay, sx, safe.top, sw, safe.height, dx, dy, dw, dh);
    ctx.fillStyle = `rgba(30, 20, 10, ${0.22 * n * n})`;
    ctx.fillRect(dx, dy, dw, dh);
  }
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
