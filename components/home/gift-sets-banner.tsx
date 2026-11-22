"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Gift, Heart, Sparkles } from "lucide-react";
import { EditableCopy } from "@/components/cms/editable-copy";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { whatsappChatUrl } from "@/lib/whatsapp";
import type { Bundle } from "@/lib/bundles";
import { productThumbnail, type Product } from "@/lib/products";

export function GiftSetsBanner({ products, bundles = [] }: { products: Product[]; bundles?: Bundle[] }) {
  const { locale } = useI18n();
  const { site, editing } = useEdit();
  const wa = whatsappChatUrl(site.chrome.whatsappPhone || site.chrome.payPhone);
  const thumbs = [
    ...bundles.flatMap((bundle) => (bundle.image ? [bundle.image] : [])),
    ...products.map((product) => productThumbnail(product)).filter(Boolean),
  ].slice(0, 2);
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section className="bg-[#f5f3ef] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-[24px] bg-oxford p-8 text-white shadow-2xl sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -top-24 -start-24 size-80 rounded-full bg-[#C59B27]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -end-24 size-80 rounded-full bg-[#eec14b]/10 blur-3xl" />
          <div className="relative z-10 grid items-start gap-10 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#C59B27]/20 px-3.5 py-1.5 text-[11px] font-bold text-[#eec14b]">
                <Gift className="size-4" />
                <EditableCopy k="giftSetsEyebrow" />
              </div>
              <EditableCopy
                k="giftSetsTitle"
                as="h2"
                className="mb-4 block font-heading text-[30px] font-bold leading-[44px] tracking-tight sm:text-[44px] sm:leading-[60px]"
              />
              <EditableCopy k="giftSetsBody" as="p" className="mb-8 block max-w-xl text-base leading-7 text-white/70" />
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {(
                  [
                    { icon: Sparkles, title: "giftSetsMatchTitle", body: "giftSetsMatchBody" },
                    { icon: Heart, title: "giftSetsSaveTitle", body: "giftSetsSaveBody" },
                    { icon: Gift, title: "giftSetsCardTitle", body: "giftSetsCardBody" },
                  ] as const
                ).map((item) => (
                  <div key={item.title} className="rounded-[12px] bg-black/25 p-3.5 backdrop-blur-sm">
                    <item.icon className="mb-1 size-5 text-[#eec14b]" />
                    <EditableCopy k={item.title} as="h3" className="block text-sm font-bold" />
                    <EditableCopy k={item.body} as="p" className="block text-xs text-white/65" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {editing ? (
                  <span className="inline-flex items-center gap-2 rounded-[12px] bg-[#C59B27] px-8 py-3.5 text-sm font-bold text-oxford shadow-lg">
                    <EditableCopy k="giftSetsCta" />
                    <Arrow className="size-4" />
                  </span>
                ) : (
                  <Link
                    href="/bundles"
                    className="inline-flex items-center gap-2 rounded-[12px] bg-[#C59B27] px-8 py-3.5 text-sm font-bold text-oxford shadow-lg transition hover:bg-[#eec14b]"
                  >
                    <EditableCopy k="giftSetsCta" />
                    <Arrow className="size-4" />
                  </Link>
                )}
                {wa ? (
                  <a
                    href={editing ? undefined : wa}
                    target={editing ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
                    onClick={(event) => {
                      if (editing) event.preventDefault();
                    }}
                  >
                    <EditableCopy k="chatWhatsApp" />
                  </a>
                ) : null}
              </div>
            </div>
            <div className="min-w-0 lg:col-span-5">
              <div className="rounded-[16px] bg-white p-6 text-center text-oxford shadow-xl">
                <EditableCopy
                  k="giftSetsBoxBadge"
                  as="span"
                  className="mb-4 inline-block rounded-full bg-[#FBF5E6] px-3 py-1 text-[11px] font-bold text-[#C59B27]"
                />
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {thumbs.length
                    ? thumbs.map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <div key={src} className="aspect-square overflow-hidden rounded-[12px] bg-[#f5f3ef]">
                          <img src={src} alt="" className="size-full object-cover" />
                        </div>
                      ))
                    : [0, 1].map((n) => <div key={n} className="aspect-square rounded-[12px] bg-[#f5f3ef]" />)}
                </div>
                <div className="flex items-center justify-between text-start">
                  <EditableCopy k="giftSetsBoxTitle" as="h4" className="font-heading text-lg font-bold" />
                  <EditableCopy k="giftSetsBoxPrice" as="span" className="text-sm font-bold text-[#C59B27]" />
                </div>
                <EditableCopy k="giftSetsBoxBody" as="p" className="mt-1 block text-start text-xs text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
