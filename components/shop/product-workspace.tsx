"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { flashStatus, hideFlash } from "@/components/status-flash";
import {
  productViews,
  productGallery,
  productThumbnail,
  localizedName,
  localizedDescription,
  optionPreview,
  productOptions,
  sellingPrice,
  type Product,
} from "@/lib/products";
import { useCustomizerStore } from "@/lib/store/customizer-store";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { FabricCanvas, type CanvasHandle } from "@/components/customizer/fabric-canvas";
import { ControlsPanel } from "@/components/customizer/controls-panel";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { PriceTag } from "@/components/catalog/price-tag";
import { storeOrderAsset } from "@/lib/order-assets";
import { allRememberedFiles, clearRememberedFiles, rememberFile, uploadRegistry } from "@/lib/upload-registry";

export function ProductWorkspace({ product }: { product: Product }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const hydrateProduct = useCustomizerStore((s) => s.hydrateProduct);
  const material = useCustomizerStore((s) => s.material);
  const setMaterial = useCustomizerStore((s) => s.setMaterial);
  const quantity = useCustomizerStore((s) => s.quantity);
  const setQuantity = useCustomizerStore((s) => s.setQuantity);
  const activeViewId = useCustomizerStore((s) => s.activeViewId);
  const setActiveViewId = useCustomizerStore((s) => s.setActiveViewId);
  const addItem = useCart((s) => s.addItem);
  const addAsset = useCustomizerStore((s) => s.addAsset);
  const assets = useCustomizerStore((s) => s.assets);
  const [canvases, setCanvases] = useState<Record<string, CanvasHandle>>({});
  const [preview, setPreview] = useState<{ id: string; label: string; url: string }[] | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const [step, setStep] = useState<"product" | "checkout">("product");
  const detailsRef = useRef<HTMLDivElement>(null);
  const options = productOptions(product);
  const colors = options.choices;
  const choiceImage = optionPreview(product, material || colors[0]);
  const views = productViews(product).map((view) =>
    choiceImage ? { ...view, mockup: choiceImage } : view,
  );
  const gallery = (() => {
    const photos = productGallery(product);
    if (choiceImage) return [choiceImage, ...photos.filter((src) => src !== choiceImage)];
    return photos;
  })();
  const activeCanvas = canvases[activeViewId] ?? canvases[views[0]?.id];
  const customizable = product.customizable !== false;
  const multiView = customizable && views.length > 1;

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

  async function addToCart(options?: { quiet?: boolean }) {
    if (cartBusy) return;
    setCartBusy(true);
    if (customizable) flashStatus(t("addingToCart"), true);
    try {
      if (!customizable) {
        const images = gallery.length ? gallery : [choiceImage || productThumbnail(product)].filter(Boolean);
        addItem({
          slug: product.slug,
          name: product.name,
          nameAr: product.nameAr,
          image: images[0] || product.mockup,
          color: material || colors[0],
          quantity,
          priceEgp: sellingPrice(product) || 100,
          kind: "product",
          custom: false,
          viewMockups: images.map((url, index) => ({
            id: `gallery-${index}`,
            label: `${index + 1}`,
            url,
          })),
          uploads: [],
        });
        if (!options?.quiet) flashStatus(t("addedSuccess"));
        return true;
      }
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
        image: viewMockups[0]?.url || choiceImage || product.mockup,
        color: material || colors[0],
        quantity,
        priceEgp: sellingPrice(product) || 100,
        kind: "product",
        custom: true,
        viewMockups,
        uploads,
      });
      hideFlash();
      if (!options?.quiet) flashStatus(t("addedSuccess"));
      return true;
    } catch (error) {
      hideFlash();
      toast.error(error instanceof Error ? error.message : "Could not save the design");
      return false;
    } finally {
      setCartBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8 sm:py-10 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
      <Link href="/catalog" className="inline-flex min-h-11 items-center text-sm text-oxford lg:col-span-2">
        ← {t("catalogTitle")}
      </Link>
      <div
        className={`order-1 lg:col-start-2 lg:row-start-2 ${
          step === "checkout" ? "lg:hidden" : ""
        }`}
      >
        <p className="text-xs font-medium text-oxford/60">{product.category}</p>
        <h1 className="mt-1 font-heading text-3xl leading-tight text-oxford sm:text-4xl">{localizedName(product, locale)}</h1>
        <PriceTag product={product} size="lg" className="mt-2" />
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{localizedDescription(product, locale)}</p>
      </div>
      <div className="order-2 space-y-4 lg:col-start-1 lg:row-start-2 lg:row-span-2">
        {customizable ? (
        <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-boo-teal bg-teal-50/70 px-3 py-3 text-sm font-semibold text-oxford lg:hidden">
          <Upload className="size-4" />
          {locale === "ar" ? "اضغط لإضافة صورة" : "Tap to add an image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,application/pdf"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file || !activeCanvas) return;
              const id = crypto.randomUUID();
              rememberFile(id, file);
              addAsset({
                id,
                name: file.name,
                type: file.type,
                previewUrl: URL.createObjectURL(file),
              });
              try {
                await activeCanvas.addImageFromFile(file, id);
              } catch {
                toast.error(`Could not place ${file.name}`);
              }
            }}
          />
        </label>
        ) : null}
        {customizable ? (
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
          <button
            type="button"
            className="ms-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-oxford ring-1 ring-oxford/15"
            onClick={() => void openPreview()}
            disabled={previewBusy}
          >
            <Eye className="size-4" />
            {previewBusy ? "…" : t("previewProduct")}
          </button>
        </div>
        ) : null}
        {customizable ? (
        <div
          className={`grid items-start justify-items-center gap-4 py-2 sm:gap-6 sm:py-4 ${multiView ? "sm:grid-cols-2" : ""}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) void openPreview();
          }}
        >
          {views.map((view) => {
            const active = !multiView || activeViewId === view.id;
            return (
              <div
                key={view.id}
                className={`w-full max-w-[min(100%,22rem)] origin-center space-y-2 transition duration-300 sm:max-w-md ${
                  active
                    ? "z-10 scale-100 opacity-100 sm:scale-[1.03]"
                    : "hidden scale-[0.86] opacity-40 grayscale brightness-90 sm:block"
                }`}
                onPointerDown={() => {
                  if (multiView) setActiveViewId(view.id);
                }}
              >
                <p className="text-sm font-medium text-oxford">
                  {viewLabel(view)}
                  {active ? (
                    <span className="ms-2 rounded-full bg-oxford px-2 py-0.5 text-[11px] text-white">
                      {t("editingSide")}
                    </span>
                  ) : null}
                </p>
                <div className={active ? "rounded-[1.8rem] ring-4 ring-oxford/30" : "rounded-[1.8rem]"}>
                  <div className={active ? "" : "pointer-events-none"}>
                    <FabricCanvas
                      product={product}
                      view={view}
                      onReady={(handle) => {
                        onReady(view.id, handle);
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <ProductPhotoGallery
            key={material || colors[0]}
            images={gallery.length ? gallery : [choiceImage || productThumbnail(product)].filter(Boolean)}
            name={localizedName(product, locale)}
          />
        )}
      </div>

      <aside
        ref={detailsRef}
        className={`order-3 scroll-mt-28 surface-card p-4 sm:p-6 lg:col-start-2 ${
          step === "checkout" ? "lg:row-start-2 lg:row-span-2" : "lg:row-start-3"
        }`}
      >
        {step === "checkout" ? (
          <div key="checkout" className="panel-swap-in">
            <CheckoutForm embedded onBack={() => setStep("product")} />
          </div>
        ) : (
          <div key="product" className="panel-swap-in">
            <div>
              <p className="mb-2 text-sm font-medium">{locale === "ar" ? options.label.ar : options.label.en}</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const photo = optionPreview(product, color);
                  const active = (material || colors[0]) === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setMaterial(color)}
                      className={`inline-flex items-center gap-2 rounded-full border-2 py-1.5 ps-1.5 pe-4 text-sm ${
                        active ? "border-oxford bg-oxford text-white" : "border-oxford/15 bg-white"
                      }`}
                    >
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt="" className="size-8 rounded-full object-cover" />
                      ) : null}
                      {color}
                    </button>
                  );
                })}
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

            {customizable ? (
              <div className="mt-6 border-t border-border pt-5">
                <p className="mb-3 font-heading text-xl">{t("customize")}</p>
                <ControlsPanel product={product} canvas={activeCanvas ?? null} />
              </div>
            ) : null}

            <div className="mt-6 border-t border-border pt-5">
              <h2 className="font-heading text-xl">{t("details")}</h2>
              <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted-foreground">
                <li>
                  <PriceTag product={product} size="sm" />
                </li>
                <li>{colors.join(" · ")}</li>
                <li>{product.category}</li>
              </ul>
            </div>

            <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-oxford/10 bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
              <button
                type="button"
                disabled={cartBusy}
                onClick={() => {
                  void addToCart({ quiet: true }).then((ok) => {
                    if (!ok) return;
                    setStep("checkout");
                    window.requestAnimationFrame(() => {
                      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    });
                  });
                }}
                className="btn-press mt-0 w-full sm:mt-8"
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
            </div>
          </div>
        )}
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

function ProductPhotoGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] || images[0];

  if (!current) {
    return (
      <div className="grid aspect-square place-items-center rounded-[1.8rem] bg-chip text-sm text-muted-foreground">
        Photos coming soon
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-[1.8rem] bg-chip">
        <Image src={current} alt={name} fill className="object-contain" sizes="(min-width: 1024px) 32rem, 100vw" />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative size-16 shrink-0 overflow-hidden rounded-2xl bg-chip ring-2 transition ${
                active === index ? "ring-oxford" : "ring-transparent hover:ring-oxford/30"
              }`}
              aria-label={`${name} ${index + 1}`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
