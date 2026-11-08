"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/site";

function dismissKey(text: string) {
  return `boo-promo:${text}`;
}

export function PromoDialog({
  text,
  image,
  onClose,
}: {
  text: string;
  image?: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-oxford/45 p-5 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="promo-pop relative flex aspect-square w-[min(88vw,26rem)] flex-col overflow-hidden rounded-[2.25rem] bg-white p-5 shadow-[0_28px_80px_-24px_rgba(10,37,64,0.55)] ring-1 ring-oxford/10 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute end-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white/90 text-oxford/50 shadow-sm hover:bg-cream hover:text-oxford"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-0 min-h-0 w-full flex-1 rounded-[1.6rem] object-cover" />
        ) : (
          <div className="grid min-h-0 flex-1 place-items-center rounded-[1.6rem] bg-oxford">
            <span className="font-heading text-7xl text-white">%</span>
          </div>
        )}
        <p dir="auto" className="mt-4 text-center font-heading text-xl leading-snug text-oxford sm:text-2xl">
          {text}
        </p>
      </div>
    </div>
  );
}

export function PromoPopup() {
  const pathname = usePathname();
  const { site } = useEdit();
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const promo = site.promo;
  const text = pick(promo.text, locale);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (!promo.live || !text) return;
    if (sessionStorage.getItem(dismissKey(text)) === "1") return;
    const show = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(show);
  }, [pathname, promo.live, text]);

  if (pathname.startsWith("/admin") || !open || !promo.live || !text) return null;

  function close() {
    setOpen(false);
    sessionStorage.setItem(dismissKey(text), "1");
  }

  return <PromoDialog text={text} image={promo.image} onClose={close} />;
}
