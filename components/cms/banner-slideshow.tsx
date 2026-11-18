"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ResponsiveImg } from "@/components/cms/responsive-img";
import type { GalleryItem } from "@/lib/site";

const SLIDE_MS = 520;
const SWIPE_PX = 48;

function SlideImage({ item }: { item: GalleryItem }) {
  return (
    <div className="absolute inset-0">
      <ResponsiveImg src={item.src} srcMobile={item.srcMobile} className="h-full w-full object-cover" />
    </div>
  );
}

function openHref(router: ReturnType<typeof useRouter>, href?: string) {
  if (!href) return;
  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    window.location.assign(href);
    return;
  }
  router.push(href);
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
  const router = useRouter();
  const slides = items.filter((item) => item.src);
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [tick, setTick] = useState(0);
  const activeRef = useRef(0);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
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
      goTo(activeRef.current + 1, 1);
    }, wait);
    return () => window.clearInterval(timer);
  }, [intervalMs, slides.length, tick]);

  useEffect(() => {
    if (leaving === null) return;
    const timer = window.setTimeout(() => setLeaving(null), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  function goTo(index: number, direction: 1 | -1) {
    const next = (index + slides.length) % slides.length;
    if (next === activeRef.current) return;
    setDir(direction);
    setLeaving(activeRef.current);
    setActive(next);
    setTick((value) => value + 1);
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (slides.length > 1 && Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goTo(activeRef.current + 1, 1);
      else goTo(activeRef.current - 1, -1);
      return;
    }
    openHref(router, slides[activeRef.current]?.href);
  }

  if (!slides.length) return null;
  const current = slides[Math.min(active, slides.length - 1)];
  const outgoing = leaving !== null ? slides[leaving] : null;
  const incomingClass = dir === 1 ? "cms-banner-slide-in" : "cms-banner-slide-in-prev";
  const outgoingClass = dir === 1 ? "cms-banner-slide-out" : "cms-banner-slide-out-prev";

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
          className={`cms-banner-slide pointer-events-none absolute inset-0 z-0 ${outgoingClass}`}
        >
          <SlideImage item={outgoing} />
        </div>
      ) : null}
      <div key={`in-${active}`} className={`cms-banner-slide absolute inset-0 z-[1] ${outgoing ? incomingClass : ""}`}>
        <SlideImage item={current} />
      </div>
      <button
        type="button"
        aria-label={current.href ? "Open banner" : "Banner"}
        className="absolute inset-0 z-[2] touch-pan-y cursor-pointer"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointer.current = null;
        }}
      />
      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-1 text-white/80 sm:left-2"
            onClick={(event) => {
              event.preventDefault();
              goTo(active - 1, -1);
            }}
          >
            <ChevronLeft className="size-4 stroke-[1.4] sm:size-5" />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-1 text-white/80 sm:right-2"
            onClick={(event) => {
              event.preventDefault();
              goTo(active + 1, 1);
            }}
          >
            <ChevronRight className="size-4 stroke-[1.4] sm:size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
            {slides.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                aria-label={`Banner ${index + 1}`}
                aria-current={active === index ? true : undefined}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  active === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
                onClick={() => {
                  const forward = (index - active + slides.length) % slides.length;
                  const backward = (active - index + slides.length) % slides.length;
                  goTo(index, forward <= backward ? 1 : -1);
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
