"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { GalleryItem } from "@/lib/site";

const SLIDE_MS = 520;

function SlideImage({ item }: { item: GalleryItem }) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.src} alt="" className="h-full w-full object-cover" draggable={false} />
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
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
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
      const current = activeRef.current;
      const next = (current + 1) % slides.length;
      setLeaving(current);
      setActive(next);
    }, wait);
    return () => window.clearInterval(timer);
  }, [intervalMs, slides.length]);

  useEffect(() => {
    if (leaving === null) return;
    const timer = window.setTimeout(() => setLeaving(null), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  if (!slides.length) return null;
  const current = slides[Math.min(active, slides.length - 1)];
  const outgoing = leaving !== null ? slides[leaving] : null;

  return (
    <div
      className={`cms-banner-slideshow relative mx-auto overflow-hidden ${rounded ? "rounded-[20px] sm:rounded-[28px]" : ""}`}
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
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
          {slides.map((item, index) => (
            <span
              key={`${item.src}-${index}`}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                active === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
