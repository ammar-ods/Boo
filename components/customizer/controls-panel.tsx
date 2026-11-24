"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Minus, Plus, Sparkles, Upload } from "lucide-react";
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
import { localizedChoice, productAllowsImage, productAllowsText, productOptions, type Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
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
  const { locale, t } = useI18n();
  const options = productOptions(product);
  const addAsset = useCustomizerStore((s) => s.addAsset);
  const removeAsset = useCustomizerStore((s) => s.removeAsset);
  const assets = useCustomizerStore((s) => s.assets);
  const activeViewId = useCustomizerStore((s) => s.activeViewId);

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
          toast.error(t("couldNotPlace"));
        }
      }
    },
    [addAsset, canvas, t],
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

  const allowImage = productAllowsImage(product);
  const allowText = productAllowsText(product);

  return (
    <div className="space-y-6">
      {bleedWarning ? (
        <div className="rounded-2xl border border-dashed border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
          {t("bleedWarning")}
        </div>
      ) : null}

      {allowImage ? (
      <section className="space-y-2">
        <h3 className="font-heading text-lg">{t("customize")}</h3>
        <p className="text-sm text-oxford/70">
          {t("artworkOnSide").replace("{side}", activeViewId === "back" ? t("sideBack") : t("sideFront"))}
        </p>
        <div
          {...dropzone.getRootProps()}
          className="min-h-32 cursor-pointer rounded-2xl border-2 border-dashed border-boo-teal bg-teal-50/60 px-4 py-5 text-center ring-2 ring-boo-teal/20 sm:min-h-32 sm:bg-white sm:py-6 sm:ring-0"
        >
          <input {...dropzone.getInputProps()} />
          <Upload className="mx-auto mb-2 size-5 text-boo-teal" />
          <p className="font-heading">{t("dropArtwork")}</p>
          <p className="text-xs text-muted-foreground">
            {t("dropArtworkHint")}
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
                  {t("remove")}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      ) : null}

      {allowText ? (
      <section className="space-y-3">
        <h3 className="font-heading text-lg">{t("textHeading")}</h3>
        <div className="space-y-1.5">
          <Label>{t("copyLabel")}</Label>
          <Input
            value={textDraft.content}
            onChange={(e) => {
              setTextDraft({ content: e.target.value });
              canvas?.applyTextDraft();
            }}
            placeholder={t("textPlaceholder")}
          />
        </div>
        {selectedKind !== "none" ? (
          <Button type="button" variant="outline" onClick={() => canvas?.deleteSelected()}>
            {t("remove")}
          </Button>
        ) : null}
      </section>
      ) : null}

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
              <Sparkles className="size-4 text-boo-orange" /> {t("laserTitle")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("laserBody")}
            </p>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{locale === "ar" ? options.label.ar : options.label.en}</Label>
          <Select
            value={material}
            onValueChange={(value) => {
              if (typeof value === "string") setMaterial(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(value) => localizedChoice(typeof value === "string" ? value : material, locale)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.choices.map((item) => (
                <SelectItem key={item} value={item} label={localizedChoice(item, locale)}>
                  {localizedChoice(item, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t("quantity")}</Label>
          <div dir="ltr" className="flex items-center gap-2">
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
