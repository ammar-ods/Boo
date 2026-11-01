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
  const canvasRef = useRef<InstanceType<FabricMod["Canvas"]> | null>(null);
  const fabricRef = useRef<FabricMod | null>(null);
  const setBleedWarning = useCustomizerStore((s) => s.setBleedWarning);
  const setSelectedKind = useCustomizerStore((s) => s.setSelectedKind);
  const setTextDraft = useCustomizerStore((s) => s.setTextDraft);
  const laserPreview = useCustomizerStore((s) => s.laserPreview);
  const textDraft = useCustomizerStore((s) => s.textDraft);

  const textDraftRef = useRef(textDraft);
  textDraftRef.current = textDraft;
  const laserRef = useRef(laserPreview);
  laserRef.current = laserPreview;

  useEffect(() => {
    let disposed = false;

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
        backgroundColor: "#f6f3ee",
        selection: true,
      });
      canvasRef.current = canvas;

      const mockup = await fabric.FabricImage.fromURL(product.mockup, {
        crossOrigin: "anonymous",
      });
      mockup.set({
        selectable: false,
        evented: false,
        name: "mockup",
        originX: "left",
        originY: "top",
      });
      mockup.scaleToWidth(product.canvasWidth);
      canvas.add(mockup);
      canvas.sendObjectToBack(mockup);

      const zone = new fabric.Rect({
        left: product.safe_zone_bounds.left,
        top: product.safe_zone_bounds.top,
        width: product.safe_zone_bounds.width,
        height: product.safe_zone_bounds.height,
        fill: "rgba(50,183,178,0.06)",
        stroke: "#32B7B2",
        strokeDashArray: [10, 7],
        strokeWidth: 2,
        selectable: false,
        evented: false,
        name: "safe-zone",
      });
      canvas.add(zone);

      const checkBleed = () => {
        const safe = product.safe_zone_bounds;
        const designs = canvas.getObjects().filter((obj) => (obj as any).name === "design");
        const outside = designs.some((obj) => {
          const box = obj.getBoundingRect();
          return (
            box.left < safe.left - 1 ||
            box.top < safe.top - 1 ||
            box.left + box.width > safe.left + safe.width + 1 ||
            box.top + box.height > safe.top + safe.height + 1
          );
        });
        zone.set("stroke", outside ? "#e11d48" : "#32B7B2");
        zone.set("strokeDashArray", outside ? [6, 4] : [10, 7]);
        setBleedWarning(outside);
        canvas.requestRenderAll();
      };

      const syncSelection = () => {
        const obj = canvas.getActiveObject();
        if (!obj || (obj as any).name !== "design") {
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
          if ((obj as any).name === "design" && obj instanceof fabric.FabricImage) {
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
          name: "design",
          assetId: id,
        } as never);
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
          name: "design",
        });
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
        const dataUrl = canvas.toDataURL({
          format: "jpeg",
          quality: 0.72,
          multiplier: 0.55,
        });
        const res = await fetch(dataUrl);
        return res.blob();
      };

      onReady({
        addImageFromFile,
        addText,
        applyTextDraft,
        applyLaser,
        deleteSelected: () => {
          const obj = canvas.getActiveObject();
          if (obj && (obj as any).name === "design") {
            canvas.remove(obj);
            checkBleed();
          }
        },
        exportMockup,
        exportJson: () => JSON.stringify(canvas.toJSON()),
        hasDesign: () =>
          canvas.getObjects().some((obj) => (obj as any).name === "design"),
      });

      canvas.requestRenderAll();
    }

    void boot();

    return () => {
      disposed = true;
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
  }, [onReady, product, setBleedWarning, setSelectedKind, setTextDraft]);

  useEffect(() => {
    canvasRef.current
      ?.getObjects()
      .forEach((obj) => {
        const fabric = fabricRef.current;
        if (!fabric || (obj as any).name !== "design" || !(obj instanceof fabric.FabricImage)) {
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
      className={`overflow-hidden rounded-[1.6rem] bg-[#f6f3ee] ring-1 ring-foreground/10 ${
        useCustomizerStore.getState().bleedWarning ? "ring-2 ring-red-500" : ""
      }`}
    >
      <canvas ref={hostRef} className="h-auto w-full" />
    </div>
  );
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
