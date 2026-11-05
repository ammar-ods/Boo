"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Minus, Plus, Sparkles, Type, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANVAS_FONTS } from "@/lib/fonts";
import type { Product } from "@/lib/products";
import { useCustomizerStore } from "@/lib/store/customizer-store";
import { forgetFile, rememberFile } from "@/lib/upload-registry";
import type { CanvasHandle } from "./fabric-canvas";
import { toast } from "sonner";

export function ControlsPanel({
  product,
  canvas,
}: {
  product: Product;
  canvas: CanvasHandle | null;
}) {
  const material = useCustomizerStore((s) => s.material);
  const quantity = useCustomizerStore((s) => s.quantity);
  const laserPreview = useCustomizerStore((s) => s.laserPreview);
  const bleedWarning = useCustomizerStore((s) => s.bleedWarning);
  const selectedKind = useCustomizerStore((s) => s.selectedKind);
  const textDraft = useCustomizerStore((s) => s.textDraft);
  const setMaterial = useCustomizerStore((s) => s.setMaterial);
  const setQuantity = useCustomizerStore((s) => s.setQuantity);
  const setLaserPreview = useCustomizerStore((s) => s.setLaserPreview);
  const setTextDraft = useCustomizerStore((s) => s.setTextDraft);
  const addAsset = useCustomizerStore((s) => s.addAsset);
  const removeAsset = useCustomizerStore((s) => s.removeAsset);
  const assets = useCustomizerStore((s) => s.assets);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!canvas) return;
      for (const file of files) {
        const id = crypto.randomUUID();
        rememberFile(id, file);
        addAsset({
          id,
          name: file.name,
          type: file.type,
          previewUrl: URL.createObjectURL(file),
        });
        try {
          await canvas.addImageFromFile(file, id);
        } catch {
          toast.error(`Could not place ${file.name}`);
        }
      }
    },
    [addAsset, canvas],
  );

  const dropzone = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/svg+xml": [".svg"],
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  return (
    <div className="space-y-6">
      {bleedWarning ? (
        <div className="rounded-2xl border border-dashed border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
          Artwork crosses the safe zone. This may clip or bleed in production.
        </div>
      ) : null}

      <section className="space-y-2">
        <h3 className="font-heading text-lg">Upload artwork</h3>
        <div
          {...dropzone.getRootProps()}
          className="cursor-pointer rounded-2xl border border-dashed border-boo-teal bg-white px-4 py-6 text-center"
        >
          <input {...dropzone.getInputProps()} />
          <Upload className="mx-auto mb-2 size-5 text-boo-teal" />
          <p className="font-heading">Drop PNG, JPG, SVG, or PDF</p>
          <p className="text-xs text-muted-foreground">
            Freeform placement — scale, rotate, and move anywhere.
          </p>
        </div>
        {assets.length ? (
          <ul className="space-y-2">
            {assets.map((asset) => (
              <li
                key={asset.id}
                className="flex items-center gap-3 rounded-2xl bg-secondary/70 px-3 py-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.previewUrl}
                  alt=""
                  className="size-10 rounded-lg bg-white object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-sm">{asset.name}</span>
                <button
                  type="button"
                  className="shrink-0 font-heading text-sm text-boo-pink"
                  onClick={() => {
                    canvas?.removeAsset(asset.id);
                    forgetFile(asset.id);
                    URL.revokeObjectURL(asset.previewUrl);
                    removeAsset(asset.id);
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="space-y-3">
        <h3 className="font-heading text-lg">Text</h3>
        <div className="space-y-1.5">
          <Label>Copy</Label>
          <Input
            value={textDraft.content}
            onChange={(e) => {
              setTextDraft({ content: e.target.value });
              canvas?.applyTextDraft();
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Font</Label>
            <Select
              value={textDraft.fontFamily}
              onValueChange={(value) => {
                if (typeof value !== "string") return;
                setTextDraft({ fontFamily: value });
                canvas?.applyTextDraft();
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CANVAS_FONTS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <Input
              type="color"
              value={textDraft.fill}
              onChange={(e) => {
                setTextDraft({ fill: e.target.value });
                canvas?.applyTextDraft();
              }}
              className="h-8 p-1"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => canvas?.addText()}>
            <Type />
            Add text layer
          </Button>
          {selectedKind !== "none" ? (
            <Button type="button" variant="outline" onClick={() => canvas?.deleteSelected()}>
              Remove
            </Button>
          ) : null}
        </div>
      </section>

      {product.is_laser_cut ? (
        <section className="flex items-start gap-3 rounded-2xl bg-secondary p-3">
          <Checkbox
            checked={laserPreview}
            onCheckedChange={(value) => {
              const next = value === true;
              setLaserPreview(next);
              canvas?.applyLaser(next);
            }}
          />
          <div>
            <p className="flex items-center gap-1 font-heading">
              <Sparkles className="size-4 text-boo-orange" /> Laser etch preview
            </p>
            <p className="text-xs text-muted-foreground">
              Grayscale high-contrast filter approximates wood/acrylic engraving.
            </p>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Material</Label>
          <Select
            value={material}
            onValueChange={(value) => {
              if (typeof value === "string") setMaterial(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {product.materials.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Quantity</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={() => setQuantity(quantity - 1)}
            >
              <Minus />
            </Button>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="text-center"
            />
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
