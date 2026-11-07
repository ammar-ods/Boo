"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS = [
  {
    title: "Creator Kits",
    body: "Audio, optics, streaming, and mobile kits.",
    href: "/catalog?collection=creator-kits",
    image: "/products/classic-tee.svg",
  },
  {
    title: "Studio Gear",
    body: "Boards, desk pads, lightbars, stands.",
    href: "/catalog?collection=studio-gear",
    image: "/products/acrylic-standee.svg",
  },
  {
    title: "Curated Gifts",
    body: "Letterpress, keepsakes, team boxes.",
    href: "/catalog?collection=gifts",
    image: "/products/wood-plaque.svg",
  },
  {
    title: "Drops Under $50",
    body: "Tactile accents and entry lighting.",
    href: "/catalog?collection=under-50",
    image: "/products/die-cut-sticker.svg",
  },
];

export function DisciplineCarousel() {
  const scroller = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    scroller.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  return (
    <section className="relative py-6">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="font-heading text-4xl text-oxford sm:text-5xl">Collections</h2>
      </div>
      <div className="relative mx-auto mt-8 max-w-[1400px]">
        <button
          type="button"
          aria-label="Previous collections"
          onClick={() => scroll(-1)}
          className="icon-circle absolute left-2 top-1/2 z-10 -translate-y-1/2 sm:left-6"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next collections"
          onClick={() => scroll(1)}
          className="icon-circle absolute right-2 top-1/2 z-10 -translate-y-1/2 sm:right-6"
        >
          <ChevronRight className="size-5" />
        </button>
        <div
          ref={scroller}
          className="flex gap-5 overflow-x-auto scroll-px-16 px-16 pb-8 sm:px-20"
          style={{ scrollbarWidth: "none" }}
        >
          {ITEMS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group w-[240px] shrink-0 snap-start sm:w-[280px]"
            >
              <div className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_16px_36px_-22px_rgba(10,37,64,0.32)]">
                <div className="relative aspect-[4/5] bg-chip">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-contain p-8 transition duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
              <h3 className="mt-3 font-heading text-2xl text-oxford">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
