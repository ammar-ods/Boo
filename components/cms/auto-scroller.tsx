"use client";

import Link from "next/link";
import type { GalleryItem } from "@/lib/site";

export function AutoScroller({
  items,
  height,
  rounded,
}: {
  items: GalleryItem[];
  height: number;
  rounded: boolean;
}) {
  if (items.length === 0) return null;
  const loop = [...items, ...items];
  const duration = Math.max(18, items.length * 7);

  return (
    <div className="overflow-hidden">
      <div
        className="marquee-track flex w-max gap-5 pe-5"
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((item, index) => {
          const image = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.src}
              alt=""
              className={`w-auto object-contain ${rounded ? "rounded-[24px]" : ""}`}
              style={{ height: Math.max(96, height) }}
            />
          );
          const className = "shrink-0";
          return item.href ? (
            <Link key={`${item.src}-${index}`} href={item.href} className={className}>
              {image}
            </Link>
          ) : (
            <div key={`${item.src}-${index}`} className={className}>
              {image}
            </div>
          );
        })}
      </div>
    </div>
  );
}
