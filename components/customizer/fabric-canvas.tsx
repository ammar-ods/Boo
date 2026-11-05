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

      const compositeMockup = async (mockupSrc: string, overlaySrc: string) => {
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
        const wrapBox = viewRef.current.wrapBounds;
        if (viewRef.current.wrap && wrapBox) {
          drawArtworkOnCylinder(ctx, overlayImage, dest.width, dest.height, wrapBox);
        } else {
          ctx.drawImage(overlayImage, 0, 0, dest.width, dest.height);
        }
        return await new Promise<Blob>((resolve, reject) => {
          dest.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("blob failed"))),
            "image/jpeg",
            0.82,
          );
        });
      };

      const exportMockup = async () => {
        const overlay = overlayDataUrl();
        return compositeMockup(viewRef.current.mockup, overlay);
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
          } catch {
            /* canvas may be mid-render */
          }
        },
        applyView: async (nextView, json) => {
          viewRef.current = nextView;
          await loadJson(json);
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

  const wrapBox = view.wrapBounds;
  const clipStyle = wrapBox
    ? {
        clipPath: `inset(${(wrapBox.top / product.canvasHeight) * 100}% ${(1 - (wrapBox.left + wrapBox.width) / product.canvasWidth) * 100}% ${(1 - (wrapBox.top + wrapBox.height) / product.canvasHeight) * 100}% ${(wrapBox.left / product.canvasWidth) * 100}% round ${((wrapBox.radius ?? 40) / product.canvasWidth) * 100}%)`,
      }
    : undefined;

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
      <div className="relative z-10 h-full w-full" style={view.wrap ? clipStyle : undefined}>
        <canvas ref={hostRef} />
      </div>
      {view.wrap && wrapBox ? (
        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: `${(wrapBox.left / product.canvasWidth) * 100}%`,
            top: `${(wrapBox.top / product.canvasHeight) * 100}%`,
            width: `${(wrapBox.width / product.canvasWidth) * 100}%`,
            height: `${(wrapBox.height / product.canvasHeight) * 100}%`,
            borderRadius: `${((wrapBox.radius ?? 40) / product.canvasWidth) * 100}% / ${((wrapBox.radius ?? 40) / product.canvasHeight) * 100}%`,
            background:
              "linear-gradient(90deg, rgba(40,28,18,0.28) 0%, rgba(40,28,18,0.06) 18%, rgba(255,255,255,0.16) 48%, rgba(40,28,18,0.06) 82%, rgba(40,28,18,0.32) 100%)",
            mixBlendMode: "multiply",
          }}
        />
      ) : null}
      <div
        className={
          !previewMode && product.showSafeZone !== false
            ? "pointer-events-none absolute z-30 rounded-md border-2 border-dashed border-[#32B7B2]/80"
            : "hidden"
        }
        style={{
          left: `${(view.safe_zone_bounds.left / product.canvasWidth) * 100}%`,
          top: `${(view.safe_zone_bounds.top / product.canvasHeight) * 100}%`,
          width: `${(view.safe_zone_bounds.width / product.canvasWidth) * 100}%`,
          height: `${(view.safe_zone_bounds.height / product.canvasHeight) * 100}%`,
        }}
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
    if (/^https?:/i.test(src)) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawArtworkOnCylinder(
  ctx: CanvasRenderingContext2D,
  overlay: HTMLImageElement,
  destWidth: number,
  destHeight: number,
  wrapBox: SafeZone & { radius?: number },
) {
  ctx.save();
  roundedRectPath(
    ctx,
    wrapBox.left,
    wrapBox.top,
    wrapBox.width,
    wrapBox.height,
    wrapBox.radius ?? 40,
  );
  ctx.clip();
  ctx.drawImage(overlay, 0, 0, destWidth, destHeight);
  const shade = ctx.createLinearGradient(wrapBox.left, 0, wrapBox.left + wrapBox.width, 0);
  shade.addColorStop(0, "rgba(40, 28, 18, 0.32)");
  shade.addColorStop(0.18, "rgba(40, 28, 18, 0.08)");
  shade.addColorStop(0.48, "rgba(255, 255, 255, 0.14)");
  shade.addColorStop(0.82, "rgba(40, 28, 18, 0.08)");
  shade.addColorStop(1, "rgba(40, 28, 18, 0.34)");
  ctx.fillStyle = shade;
  ctx.fillRect(wrapBox.left, wrapBox.top, wrapBox.width, wrapBox.height);
  ctx.restore();
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
