"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GalleryItem } from "@/lib/site";

export function BannerSlideshow({
  items,
  height,
  rounded,
  intervalMs,
}: {
  items: GalleryItem[];
  height: number;
  rounded: boolean;
  intervalMs: number;
}) {
  const slides = items.filter((item) => item.src);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const wait = Math.max(800, intervalMs || 2000);
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, wait);
    return () => window.clearInterval(timer);
  }, [intervalMs, slides.length]);

  if (!slides.length) return null;
  const current = slides[Math.min(active, slides.length - 1)];
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current.src}
      alt=""
      className={`h-full w-full object-cover ${rounded ? "rounded-[20px] sm:rounded-[28px]" : ""}`}
    />
  );

  return (
    <div className="relative overflow-hidden" style={{ height: `${Math.max(160, height)}px` }}>
      {current.href ? (
        <Link href={current.href} className="absolute inset-0 block">
          {image}
        </Link>
      ) : (
        <div className="absolute inset-0">{image}</div>
      )}
      {slides.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {slides.map((item, index) => (
            <span
              key={`${item.src}-${index}`}
              className={`h-1.5 rounded-full ${active === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
