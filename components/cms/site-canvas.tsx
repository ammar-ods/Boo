"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { DisciplineCarousel } from "@/components/home/discipline-carousel";
import { AutoScroller } from "@/components/cms/auto-scroller";
import { BannerSlideshow } from "@/components/cms/banner-slideshow";
import { PageProducts } from "@/components/cms/page-products";
import { SectionInspector } from "@/components/cms/section-inspector";
import { SectionTypeMenu } from "@/components/cms/section-type-menu";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import {
  pick,
  sectionGallery,
  sectionSurface,
  type ImagePlacement,
  type Localized,
  type SiteSection,
} from "@/lib/site";

export function SiteCanvas({ products }: { products: Product[] }) {
  const { editing, selectedId, setSelectedId, patchSection, moveSection, removeSection, addSection, pageSections } =
    useEdit();
  const { locale } = useI18n();
  const [insertFor, setInsertFor] = useState<string | null>(null);
  const visible = editing ? pageSections : pageSections.filter((section) => section.visible);

  useEffect(() => {
    if (!insertFor) return;
    const close = () => setInsertFor(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [insertFor]);

  function animateMove(id: string, dir: -1 | 1) {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-section-id]"));
    const before = new Map(nodes.map((node) => [node.dataset.sectionId ?? "", node.getBoundingClientRect()]));
    flushSync(() => moveSection(id, dir));
    requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>("[data-section-id]").forEach((node) => {
        const prev = before.get(node.dataset.sectionId ?? "");
        if (!prev) return;
        const next = node.getBoundingClientRect();
        const dy = prev.top - next.top;
        if (Math.abs(dy) < 1) return;
        node.animate([{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }], {
          duration: 480,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        });
      });
    });
  }

  return (
    <div className={editing && selectedId ? "sm:pe-[24.5rem]" : ""}>
      {visible.map((section) => (
        <div
          key={section.id}
          data-section-id={section.id}
          className={`relative ${editing && selectedId === section.id ? "ring-2 ring-oxford/25" : ""}`}
          onClickCapture={(event) => {
            if (!editing) return;
            const target = event.target as HTMLElement;
            if (target.closest("a")) event.preventDefault();
          }}
          onClick={() => {
            if (editing) setSelectedId(section.id);
          }}
        >
          {editing ? (
            <div className="absolute start-3 top-3 z-30 flex items-center rounded-full bg-white/95 p-1 shadow-lg ring-1 ring-oxford/10">
              <button
                type="button"
                className="grid size-8 place-items-center rounded-full text-oxford hover:bg-cream"
                onClick={(event) => {
                  event.stopPropagation();
                  animateMove(section.id, -1);
                }}
                aria-label="Move up"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                className="grid size-8 place-items-center rounded-full text-oxford hover:bg-cream"
                onClick={(event) => {
                  event.stopPropagation();
                  animateMove(section.id, 1);
                }}
                aria-label="Move down"
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                className="grid size-8 place-items-center rounded-full text-oxford hover:bg-cream"
                onClick={(event) => {
                  event.stopPropagation();
                  patchSection(section.id, { visible: !section.visible });
                }}
                aria-label={section.visible ? "Hide" : "Show"}
              >
                {section.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
              <button
                type="button"
                className="grid size-8 place-items-center rounded-full text-red-700 hover:bg-red-50"
                onClick={(event) => {
                  event.stopPropagation();
                  removeSection(section.id);
                }}
                aria-label="Delete section"
              >
                <Trash2 className="size-4" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-full bg-oxford text-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    setInsertFor((current) => (current === section.id ? null : section.id));
                  }}
                  aria-label="Add section above"
                >
                  <Plus className="size-4" />
                </button>
                {insertFor === section.id ? (
                  <div
                    className="absolute start-0 top-10 z-40"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <SectionTypeMenu
                      heading="Insert above"
                      onPick={(type) => {
                        addSection(type, section.id);
                        setInsertFor(null);
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <SectionView
            section={section}
            products={products}
            locale={locale}
            index={visible.indexOf(section)}
          />
        </div>
      ))}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-20 text-center">
            {editing ? (
              <>
                <p className="font-heading text-3xl text-oxford">This page is empty.</p>
                <p className="mt-2 max-w-md text-sm text-oxford/60">
                  Add a hero, product cards, banners, or any other section — then save.
                </p>
                <div className="mt-6">
                  <SectionTypeMenu heading="Add a section" onPick={(type) => addSection(type)} />
                </div>
              </>
            ) : null}
          </div>
        ) : null}
        {editing && selectedId ? (
        <SectionInspector
          section={pageSections.find((item) => item.id === selectedId) ?? null}
          products={products}
        />
      ) : null}
    </div>
  );
}

function imageAspect(section: SiteSection) {
  if (section.style.aspect && section.style.aspect !== "auto") return section.style.aspect;
  if (section.type === "banner" || section.type === "slideshow") return "5 / 2";
  return "";
}

function SectionMedia({
  src,
  height,
  widthPct,
  bleed,
  rounded,
  href,
  aspect,
}: {
  src: string;
  height: number;
  widthPct: number;
  bleed?: boolean;
  rounded?: boolean;
  href?: string;
  aspect?: string;
}) {
  const inset = bleed && rounded;
  const imgW = bleed ? 100 : Math.min(100, Math.max(20, widthPct));
  const ratio = aspect && aspect !== "auto";
  const image = (
    <div
      className={`cms-media mx-auto ${ratio ? "is-ratio" : ""} ${inset ? "px-3 sm:px-6" : ""}`}
      style={{
        ["--cms-img-w" as string]: `${imgW}%`,
        ["--cms-img-h" as string]: `${Math.max(48, height)}px`,
        ["--cms-img-aspect" as string]: aspect || "5 / 2",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={`cms-media-img ${rounded ? "rounded-[20px] sm:rounded-[28px]" : ""}`}
      />
    </div>
  );
  if (!href) return image;
  return (
    <Link href={href} className="block">
      {image}
    </Link>
  );
}

function CmsButton({
  href,
  children,
  outline,
  background,
  color,
}: {
  href: string;
  children: React.ReactNode;
  outline?: boolean;
  background?: string;
  color?: string;
}) {
  return (
    <Link
      href={href}
      className={`btn-press w-full sm:w-auto ${outline ? "btn-press-outline" : ""}`}
      style={
        background || color
          ? {
              background: outline ? undefined : background,
              color,
              borderColor: outline ? background || color : undefined,
              boxShadow: outline || !background ? undefined : `0 6px 0 0 ${background}`,
            }
          : undefined
      }
    >
      {children}
    </Link>
  );
}

function SectionShell({
  section,
  index,
  children,
  className = "",
  cover,
}: {
  section: SiteSection;
  index: number;
  children: React.ReactNode;
  className?: string;
  cover?: { src: string; height: number; href?: string };
}) {
  const surface = sectionSurface(section.style);
  const pad = Math.max(0, section.style.paddingY ?? 48);
  const width = Math.min(100, Math.max(20, section.style.blockWidth ?? 100));
  const minHeight = Math.max(0, section.style.minHeight ?? 0);
  const marginX = Math.max(0, section.style.marginX ?? 0);
  const marginY = Math.max(0, section.style.marginY ?? 0);
  const rounded = Boolean(section.style.rounded);
  const resolvedMin = cover ? Math.max(minHeight, cover.height) : minHeight;
  return (
    <div
      className="cms-block-frame"
      style={{
        ["--cms-mx" as string]: `${marginX}px`,
        ["--cms-my" as string]: `${marginY}px`,
      }}
    >
      <section
        className={`cms-block reveal relative overflow-hidden ${cover ? "cms-block-cover" : ""} ${rounded ? "rounded-[22px] sm:rounded-[28px]" : ""} ${className}`}
        style={{
          background: cover || section.type === "banner" || section.type === "slideshow" ? undefined : surface.background,
          color: surface.color,
          ["--cms-w" as string]: `${width}%`,
          ["--cms-pad" as string]: `${pad}px`,
          ["--cms-min-h" as string]: `${resolvedMin}px`,
          animationDelay: `${index * 80}ms`,
        }}
      >
        {cover ? (
          <>
            <div className="absolute inset-0">
              {cover.href ? (
                <Link href={cover.href} className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover.src} alt="" className="h-full w-full object-cover object-top" />
                </Link>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover.src} alt="" className="h-full w-full object-cover object-top" />
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-oxford/35" />
          </>
        ) : null}
        {children}
      </section>
    </div>
  );
}

function SectionView({
  section,
  products,
  locale,
  index = 0,
}: {
  section: SiteSection;
  products: Product[];
  locale: string;
  index?: number;
}) {
  const { pageKey } = useEdit();
  const fontSize = section.style.fontSize ?? 36;
  const image = pick(section.content.image, locale);
  const placement: ImagePlacement =
    section.style.imagePlacement ?? (image ? "below" : "hidden");
  const showImage = placement !== "hidden" && Boolean(image);
  const widthPct = section.style.imageWidth ?? (placement === "bleed" || placement === "cover" ? 100 : 70);
  const height = section.style.imageHeight ?? 280;
  const rounded =
    section.style.imageRounded ?? (placement === "below" || placement === "start" || placement === "end");
  const showPrimary =
    section.style.showPrimaryCta !== false && Boolean(pick(section.content.ctaLabel, locale));
  const showSecondary =
    section.style.showSecondaryCta !== false && Boolean(pick(section.content.secondaryCtaLabel, locale));

  function text(key: keyof SiteSection["content"], className: string, as: "h1" | "h2" | "p" = "p") {
    const Tag = as;
    const value = pick(section.content[key] as Localized | undefined, locale);
    if (!value) return null;
    const min = Math.min(22, Math.round(fontSize * 0.42));
    return (
      <Tag
        className={className}
        style={as === "h1" || as === "h2" ? { fontSize: `clamp(${min}px, 6.2vw, ${fontSize}px)` } : undefined}
      >
        {value}
      </Tag>
    );
  }

  const centered = section.style.align === "center";
  const copy = (
    <>
      {text("eyebrow", "text-xs font-medium tracking-[0.18em] opacity-70")}
      {text("title", "mt-2 font-heading leading-[1.15] text-pretty", "h1")}
      {text(
        "body",
        `mt-3 max-w-xl text-pretty text-[15px] leading-relaxed opacity-80 sm:mt-4 sm:text-base ${centered ? "mx-auto" : ""}`,
      )}
    </>
  );
  const imageHref = section.content.imageHref;
  const actions = showPrimary || showSecondary ? (
    <div className={`mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap ${centered ? "sm:justify-center" : ""}`}>
      {showPrimary ? (
        <CmsButton
          href={section.content.ctaHref || "/catalog"}
          background={section.style.ctaBackground}
          color={section.style.ctaColor}
        >
          {pick(section.content.ctaLabel, locale)}
        </CmsButton>
      ) : null}
      {showSecondary ? (
        <CmsButton
          href={section.content.secondaryCtaHref || "/bundles"}
          outline
          background={section.style.secondaryCtaBackground}
          color={section.style.secondaryCtaColor}
        >
          {pick(section.content.secondaryCtaLabel, locale)}
        </CmsButton>
      ) : null}
    </div>
  ) : null;

  const aspect = imageAspect(section);

  if (section.type === "slideshow") {
    return (
      <SectionShell section={section} index={index}>
        <BannerSlideshow
          items={sectionGallery(section, locale)}
          height={height}
          widthPct={widthPct}
          aspect={aspect || "5 / 2"}
          rounded={Boolean(section.style.imageRounded)}
          intervalMs={section.style.intervalMs ?? 2000}
        />
      </SectionShell>
    );
  }

  if (section.type === "marquee") {
    return (
      <SectionShell section={section} index={index}>
        <div className={`cms-copy mb-4 ${centered ? "text-center" : "text-start"}`}>
          {text("title", "font-heading", "h2")}
        </div>
        <AutoScroller
          items={section.content.gallery ?? []}
          height={height}
          rounded={section.style.imageRounded !== false}
        />
      </SectionShell>
    );
  }

  if (section.type === "collections") {
    return (
      <SectionShell section={section} index={index}>
        <div className={`cms-copy ${centered ? "text-center" : "text-start"}`}>
          {text("title", "font-heading", "h2")}
        </div>
        <DisciplineCarousel />
      </SectionShell>
    );
  }

  if (section.type === "products") {
    return (
      <SectionShell section={section} index={index}>
        <div id="creations">
          <div className="cms-copy text-start">
            {text("title", "font-heading", "h2")}
            {text("body", "mt-2 text-muted-foreground")}
          </div>
          <div className="mt-6 sm:mt-8">
            {pageKey && pageKey !== "home" ? (
              <PageProducts
                section={{
                  ...section,
                  content: { ...section.content, productSlugs: section.content.productSlugs ?? [] },
                }}
                products={products}
              />
            ) : (
              <div className="cms-copy">
                <ProductGrid products={products} compact />
              </div>
            )}
          </div>
        </div>
      </SectionShell>
    );
  }

  if (placement === "cover" && showImage) {
    return (
      <SectionShell section={section} index={index} cover={{ src: image, height, href: imageHref }}>
        <div className={`cms-copy relative z-10 ${centered ? "text-center" : "text-start"}`}>
          {copy}
          {actions}
        </div>
      </SectionShell>
    );
  }

  if ((placement === "start" || placement === "end") && showImage) {
    const imageCol = (
      <SectionMedia src={image} height={height} widthPct={100} rounded={rounded} href={imageHref} aspect={aspect} />
    );
    return (
      <SectionShell section={section} index={index}>
        <div className="cms-copy grid items-center gap-5 lg:grid-cols-2 lg:gap-8">
          {placement === "start" ? imageCol : null}
          <div className={centered ? "text-center" : "text-start"}>
            {copy}
            {actions}
          </div>
          {placement === "end" ? imageCol : null}
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell section={section} index={index}>
      {placement === "bleed" && showImage ? (
        <SectionMedia src={image} height={height} widthPct={100} bleed rounded={rounded} href={imageHref} aspect={aspect} />
      ) : null}
      <div className={`cms-copy ${placement === "bleed" && showImage ? "pt-5 sm:pt-6" : ""} ${centered ? "text-center" : "text-start"}`}>
        {copy}
        {placement === "below" && showImage ? (
          <div className={`mt-5 ${centered ? "flex justify-center" : ""} sm:mt-6`}>
            <SectionMedia src={image} height={height} widthPct={widthPct} rounded={rounded} href={imageHref} aspect={aspect} />
          </div>
        ) : null}
        {actions}
      </div>
    </SectionShell>
  );
}
