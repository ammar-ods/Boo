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
    const hide = window.setTimeout(() => {
      setOpen(false);
      sessionStorage.setItem(dismissKey(text), "1");
    }, 8600);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [pathname, promo.live, text]);

  if (pathname.startsWith("/admin") || !open || !promo.live || !text) return null;

  function close() {
    setOpen(false);
    sessionStorage.setItem(dismissKey(text), "1");
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[85] flex justify-center px-4">
      <div className="promo-pop pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-[1.6rem] bg-white p-3 pe-2 shadow-[0_18px_50px_-20px_rgba(10,37,64,0.45)] ring-1 ring-oxford/10">
        {promo.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={promo.image} alt="" className="size-14 shrink-0 rounded-2xl object-cover" />
        ) : (
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-oxford font-heading text-lg text-white">
            %
          </div>
        )}
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-oxford">{text}</p>
        <button
          type="button"
          className="grid size-9 shrink-0 place-items-center rounded-full text-oxford/50 hover:bg-cream hover:text-oxford"
          onClick={close}
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
