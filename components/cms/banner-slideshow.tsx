"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ResponsiveImg } from "@/components/cms/responsive-img";
import { useI18n } from "@/lib/i18n";
import type { GalleryItem } from "@/lib/site";

const SLIDE_MS = 520;

function SlideImage({ item }: { item: GalleryItem }) {
  const image = (
    <ResponsiveImg src={item.src} srcMobile={item.srcMobile} className="h-full w-full object-cover" />
  );
  if (item.href) {
    return (
      <Link href={item.href} className="absolute inset-0 block">
        {image}
      </Link>
    );
  }
  return <div className="absolute inset-0">{image}</div>;
}

export function BannerSlideshow({
  items,
  height,
  widthPct,
  aspect,
  rounded,
  intervalMs,
}: {
  items: GalleryItem[];
  height: number;
  widthPct: number;
  aspect: string;
  rounded: boolean;
  intervalMs: number;
}) {
  const slides = items.filter((item) => item.src);
  const { locale } = useI18n();
  const flip = locale === "ar" ? "rotate-180" : "";
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const activeRef = useRef(0);
  const useRatio = aspect && aspect !== "auto";
  activeRef.current = active;

  useEffect(() => {
    setActive(0);
    setLeaving(null);
    activeRef.current = 0;
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const wait = Math.max(1200, intervalMs || 2000);
    const timer = window.setInterval(() => {
      goTo((activeRef.current + 1) % slides.length);
    }, wait);
    return () => window.clearInterval(timer);
  }, [intervalMs, slides.length, tick]);

  useEffect(() => {
    if (leaving === null) return;
    const timer = window.setTimeout(() => setLeaving(null), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  function goTo(index: number) {
    const next = (index + slides.length) % slides.length;
    if (next === activeRef.current) return;
    setLeaving(activeRef.current);
    setActive(next);
    setTick((value) => value + 1);
  }

  if (!slides.length) return null;
  const current = slides[Math.min(active, slides.length - 1)];
  const outgoing = leaving !== null ? slides[leaving] : null;

  return (
    <div
      className={`cms-banner-slideshow group/banner relative mx-auto overflow-hidden ${rounded ? "rounded-[20px] sm:rounded-[28px]" : ""}`}
      style={{
        width: `${Math.min(100, Math.max(20, widthPct || 100))}%`,
        aspectRatio: useRatio ? aspect : undefined,
        height: useRatio ? undefined : `${Math.max(160, height || 360)}px`,
      }}
    >
      {outgoing ? (
        <div
          key={`out-${leaving}`}
          className="cms-banner-slide cms-banner-slide-out pointer-events-none absolute inset-0 z-0"
        >
          <SlideImage item={outgoing} />
        </div>
      ) : null}
      <div
        key={`in-${active}`}
        className={`cms-banner-slide absolute inset-0 z-[1] ${outgoing ? "cms-banner-slide-in" : ""}`}
      >
        <SlideImage item={current} />
      </div>
      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            className="absolute start-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-1 text-white/80 opacity-70 backdrop-blur-[1px] transition hover:opacity-100 sm:start-2"
            onClick={(event) => {
              event.preventDefault();
              goTo(active - 1);
            }}
          >
            <ChevronLeft className={`size-4 stroke-[1.4] sm:size-5 ${flip}`} />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            className="absolute end-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-1 text-white/80 opacity-70 backdrop-blur-[1px] transition hover:opacity-100 sm:end-2"
            onClick={(event) => {
              event.preventDefault();
              goTo(active + 1);
            }}
          >
            <ChevronRight className={`size-4 stroke-[1.4] sm:size-5 ${flip}`} />
          </button>
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
            {slides.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                aria-label={`Banner ${index + 1}`}
                aria-current={active === index ? true : undefined}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  active === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
