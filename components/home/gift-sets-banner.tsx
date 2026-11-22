"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Gift, Heart, Sparkles } from "lucide-react";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick, type SiteSection } from "@/lib/site";
import { whatsappChatUrl } from "@/lib/whatsapp";
import type { Bundle } from "@/lib/bundles";
import { productThumbnail, type Product } from "@/lib/products";

const TILE_ICONS = [Sparkles, Heart, Gift] as const;

export function GiftSetsBanner({
  products,
  bundles = [],
  section,
}: {
  products: Product[];
  bundles?: Bundle[];
  section: SiteSection;
}) {
  const { locale } = useI18n();
  const { site, editing } = useEdit();
  const wa = whatsappChatUrl(site.chrome.whatsappPhone || site.chrome.payPhone);
  const gallery = (section.content.gallery ?? []).map((item) => item.src).filter(Boolean);
  const mainImage = pick(section.content.image, locale);
  const thumbs = [
    ...gallery,
    mainImage,
    pick(section.content.imageMobile, locale),
    ...bundles.flatMap((bundle) => (bundle.image ? [bundle.image] : [])),
    ...products.map((product) => productThumbnail(product)).filter(Boolean),
  ]
    .filter(Boolean)
    .filter((src, index, all) => all.indexOf(src) === index)
    .slice(0, 2);
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const tiles = section.content.tiles?.length
    ? section.content.tiles
    : [
        { title: { ar: "", en: "" }, body: { ar: "", en: "" } },
        { title: { ar: "", en: "" }, body: { ar: "", en: "" } },
        { title: { ar: "", en: "" }, body: { ar: "", en: "" } },
      ];
  const showPrimary =
    section.style.showPrimaryCta !== false && Boolean(pick(section.content.ctaLabel, locale));
  const showSecondary =
    section.style.showSecondaryCta !== false && Boolean(pick(section.content.secondaryCtaLabel, locale));
  const primaryHref = section.content.ctaHref || "/bundles";
  const secondaryHref = section.content.secondaryCtaHref || wa;
  const eyebrow = pick(section.content.eyebrow, locale);
  const title = pick(section.content.title, locale);
  const body = pick(section.content.body, locale);
  const rounded = Boolean(section.style.imageRounded);

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-oxford p-8 text-white shadow-2xl dark:bg-card dark:text-foreground dark:ring-1 dark:ring-white/10 sm:p-12 lg:p-16">
      <div className="pointer-events-none absolute -top-24 -start-24 size-80 rounded-full bg-[#C59B27]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -end-24 size-80 rounded-full bg-[#eec14b]/10 blur-3xl" />
      <div className="relative z-10 grid items-start gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          {eyebrow ? (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#C59B27]/20 px-3.5 py-1.5 text-[11px] font-bold text-[#eec14b]">
              <Gift className="size-4" />
              {eyebrow}
            </div>
          ) : null}
          {title ? (
            <h2
              className="mb-4 font-heading text-[30px] font-bold leading-[44px] tracking-tight sm:text-[44px] sm:leading-[60px]"
              style={{ fontSize: `clamp(28px, 6vw, ${section.style.fontSize ?? 44}px)` }}
            >
              {title}
            </h2>
          ) : null}
          {body ? <p className="mb-8 max-w-xl text-base leading-7 text-white/70 dark:text-foreground/70">{body}</p> : null}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {tiles.slice(0, 3).map((tile, index) => {
              const Icon = TILE_ICONS[index] ?? Gift;
              const tileTitle = pick(tile.title, locale);
              const tileBody = pick(tile.body, locale);
              if (!tileTitle && !tileBody) return null;
              return (
                <div key={index} className="rounded-[12px] bg-black/25 p-3.5 backdrop-blur-sm dark:bg-white/8">
                  <Icon className="mb-1 size-5 text-[#eec14b]" />
                  {tileTitle ? <h3 className="text-sm font-bold">{tileTitle}</h3> : null}
                  {tileBody ? <p className="text-xs text-white/65 dark:text-foreground/65">{tileBody}</p> : null}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {showPrimary ? (
              editing ? (
                <span
                  className="inline-flex items-center gap-2 rounded-[12px] px-8 py-3.5 text-sm font-bold shadow-lg"
                  style={{
                    background: section.style.ctaBackground ?? "#C59B27",
                    color: section.style.ctaColor ?? "#0a2540",
                  }}
                >
                  {pick(section.content.ctaLabel, locale)}
                  <Arrow className="size-4" />
                </span>
              ) : (
                <Link
                  href={primaryHref}
                  className="inline-flex items-center gap-2 rounded-[12px] px-8 py-3.5 text-sm font-bold shadow-lg transition hover:brightness-110"
                  style={{
                    background: section.style.ctaBackground ?? "#C59B27",
                    color: section.style.ctaColor ?? "#0a2540",
                  }}
                >
                  {pick(section.content.ctaLabel, locale)}
                  <Arrow className="size-4" />
                </Link>
              )
            ) : null}
            {showSecondary && secondaryHref ? (
              <a
                href={editing ? undefined : secondaryHref}
                target={editing || secondaryHref.startsWith("/") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline dark:text-foreground/70 dark:hover:text-foreground"
                onClick={(event) => {
                  if (editing) event.preventDefault();
                }}
              >
                {pick(section.content.secondaryCtaLabel, locale)}
              </a>
            ) : null}
          </div>
        </div>
        <div className="min-w-0 lg:col-span-5">
          <div className="rounded-[16px] bg-white p-6 text-center text-oxford shadow-xl dark:bg-background dark:text-foreground">
            {pick(section.content.boxBadge, locale) ? (
              <span className="mb-4 inline-block rounded-full bg-[#FBF5E6] px-3 py-1 text-[11px] font-bold text-[#C59B27] dark:bg-[#C59B27]/15">
                {pick(section.content.boxBadge, locale)}
              </span>
            ) : null}
            <div className="mb-4 grid grid-cols-2 gap-3">
              {thumbs.length
                ? thumbs.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div
                      key={src}
                      className={`aspect-square overflow-hidden bg-cream ${rounded ? "rounded-[12px]" : ""}`}
                    >
                      <img src={src} alt="" className="size-full object-cover" />
                    </div>
                  ))
                : [0, 1].map((n) => (
                    <div key={n} className={`aspect-square bg-cream ${rounded ? "rounded-[12px]" : ""}`} />
                  ))}
            </div>
            <div className="flex items-center justify-between text-start">
              {pick(section.content.boxTitle, locale) ? (
                <h4 className="font-heading text-lg font-bold">{pick(section.content.boxTitle, locale)}</h4>
              ) : null}
              {pick(section.content.boxPrice, locale) ? (
                <span className="text-sm font-bold text-[#C59B27]">{pick(section.content.boxPrice, locale)}</span>
              ) : null}
            </div>
            {pick(section.content.boxBody, locale) ? (
              <p className="mt-1 text-start text-xs text-muted-foreground">{pick(section.content.boxBody, locale)}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
