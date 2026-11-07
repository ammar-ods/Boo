"use client";

import Image from "next/image";
import { toast } from "sonner";
import type { Bundle } from "@/lib/bundles";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export function BundlesGrid({ bundles, products }: { bundles: Bundle[]; products: Product[] }) {
  const { t, locale, formatPrice } = useI18n();
  const addItem = useCart((s) => s.addItem);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-5xl text-oxford">{t("bundlesTitle")}</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">{t("bundlesBody")}</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {bundles.map((bundle) => {
          const names = bundle.productSlugs
            .map((slug) => products.find((product) => product.slug === slug))
            .filter(Boolean)
            .map((product) => (locale === "ar" ? product!.nameAr : product!.name));
          return (
            <article key={bundle.slug} className="surface-card overflow-hidden">
              <div className="relative aspect-[4/3] bg-chip">
                <Image src={bundle.image} alt="" fill className="object-cover" />
              </div>
              <div className="p-5">
                <h2 className="font-heading text-3xl text-oxford">{locale === "ar" ? bundle.nameAr : bundle.name}</h2>
                <p className="mt-2 text-muted-foreground">{locale === "ar" ? bundle.taglineAr : bundle.tagline}</p>
                <p className="mt-2 text-sm text-oxford/70">{names.join(" · ")}</p>
                <p className="mt-3 text-xl font-semibold">{formatPrice(bundle.priceEgp)}</p>
                <button
                  type="button"
                  className="btn-press mt-5"
                  onClick={() => {
                    addItem({
                      slug: bundle.slug,
                      name: bundle.name,
                      nameAr: bundle.nameAr,
                      image: bundle.image,
                      color: "Pack",
                      quantity: 1,
                      priceEgp: bundle.priceEgp,
                      kind: "bundle",
                    });
                    toast.success(t("added"));
                  }}
                >
                  {t("addToCart")}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
