"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const ITEMS = [
  {
    title: "White tee",
    titleAr: "تيشيرت أبيض",
    href: "/product/white-tee",
    image: "/products/white-tee-front.jpg",
  },
  {
    title: "Thermal tumbler",
    titleAr: "مج حراري",
    href: "/product/thermal-tumbler",
    image: "/products/thermal-tumbler.jpg",
  },
  {
    title: "Wood coaster",
    titleAr: "كوستر خشب",
    href: "/product/wood-coaster",
    image: "/products/wood-coaster.png",
  },
];

export function DisciplineCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const { locale } = useI18n();

  function scroll(direction: -1 | 1) {
    scroller.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  return (
    <section className="relative py-6">
      <div className="relative mx-auto mt-4 max-w-[1400px]">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scroll(-1)}
          className="icon-circle absolute start-1 top-1/2 z-10 -translate-y-1/2 sm:start-6"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scroll(1)}
          className="icon-circle absolute end-1 top-1/2 z-10 -translate-y-1/2 sm:end-6"
        >
          <ChevronRight className="size-5" />
        </button>
        <div
          ref={scroller}
          className="flex gap-4 overflow-x-auto scroll-px-12 px-12 pb-6 sm:gap-5 sm:scroll-px-16 sm:px-20 sm:pb-8"
          style={{ scrollbarWidth: "none" }}
        >
          {ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="group w-[min(68vw,240px)] shrink-0 sm:w-[280px]">
              <div className="relative overflow-hidden rounded-[28px] bg-card shadow-[0_16px_36px_-22px_rgba(10,37,64,0.32)]">
                <div className="relative aspect-[4/5] bg-chip">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
              <h3 className="mt-3 font-heading text-2xl text-oxford">
                {locale === "ar" ? item.titleAr : item.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
