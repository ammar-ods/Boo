"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ResponsiveImg } from "@/components/cms/responsive-img";
import type { GalleryItem } from "@/lib/site";

const SLIDE_MS = 520;
const SWIPE_PX = 42;

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
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const activeRef = useRef(0);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const ignoreClick = useRef(false);
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

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId || slides.length < 2) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    ignoreClick.current = true;
    goTo(dx < 0 ? activeRef.current + 1 : activeRef.current - 1);
  }

  function onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!ignoreClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    ignoreClick.current = false;
  }

  if (!slides.length) return null;
  const current = slides[Math.min(active, slides.length - 1)];
  const outgoing = leaving !== null ? slides[leaving] : null;

  return (
    <div
      className={`cms-banner-slideshow group/banner relative mx-auto touch-pan-y overflow-hidden ${rounded ? "rounded-[20px] sm:rounded-[28px]" : ""}`}
      style={{
        width: `${Math.min(100, Math.max(20, widthPct || 100))}%`,
        aspectRatio: useRatio ? aspect : undefined,
        height: useRatio ? undefined : `${Math.max(160, height || 360)}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        pointer.current = null;
      }}
      onClickCapture={onClickCapture}
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
            className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-1 text-white/80 opacity-70 backdrop-blur-[1px] transition hover:opacity-100 sm:left-2"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              goTo(active - 1);
            }}
          >
            <ChevronLeft className="size-4 stroke-[1.4] sm:size-5" />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-1 text-white/80 opacity-70 backdrop-blur-[1px] transition hover:opacity-100 sm:right-2"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              goTo(active + 1);
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
                  active === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  goTo(index);
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
