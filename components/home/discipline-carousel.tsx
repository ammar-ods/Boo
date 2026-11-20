"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { normalizeCategoryId, productThumbnail, type Product } from "@/lib/products";
import { pick } from "@/lib/site";

export function DisciplineCarousel({ products = [] }: { products?: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const { locale } = useI18n();
  const { site } = useEdit();
  const flip = locale === "ar" ? "rotate-180" : "";
  const items = (site.chrome.catalogSections ?? [])
    .filter((section) => section.visible !== false)
    .map((section) => {
      const fromCategory = products.find(
        (product) => normalizeCategoryId(product.category) === section.id,
      );
      const image = section.image || (fromCategory ? productThumbnail(fromCategory) : "");
      return {
        id: section.id,
        href: section.href || `/p/${section.id}`,
        title: pick(section.label, locale) || section.id,
        image,
      };
    })
    .filter((item) => item.image);

  function scroll(direction: -1 | 1) {
    scroller.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  if (!items.length) return null;

  return (
    <section className="relative py-6">
      <div className="relative mx-auto mt-4 max-w-[1400px]">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scroll(-1)}
          className="icon-circle absolute start-1 top-1/2 z-10 -translate-y-1/2 sm:start-6"
        >
          <ChevronLeft className={`size-5 ${flip}`} />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scroll(1)}
          className="icon-circle absolute end-1 top-1/2 z-10 -translate-y-1/2 sm:end-6"
        >
          <ChevronRight className={`size-5 ${flip}`} />
        </button>
        <div
          ref={scroller}
          className="flex gap-4 overflow-x-auto scroll-px-12 px-12 pb-6 sm:gap-5 sm:scroll-px-16 sm:px-20 sm:pb-8"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="group w-[min(68vw,240px)] shrink-0 sm:w-[280px]">
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
              <h3 className="mt-3 font-heading text-2xl text-oxford">{item.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
