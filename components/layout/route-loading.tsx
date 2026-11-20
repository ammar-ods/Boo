"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

let start: (() => void) | null = null;
let stop: (() => void) | null = null;

export function startRouteLoading() {
  start?.();
}

export function hideRouteLoading() {
  stop?.();
}

function isInternalHref(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
    return false;
  }
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  return `${url.pathname}${url.search}` !== `${window.location.pathname}${window.location.search}`;
}

export function RouteLoading() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    start = () => setVisible(true);
    stop = () => setVisible(false);
    return () => {
      start = null;
      stop = null;
    };
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || !isInternalHref(anchor)) return;
      setVisible(true);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 8000);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-[color:var(--background)]/88 backdrop-blur-[2px]" aria-live="polite" aria-busy="true">
      <div className="relative size-24 sm:size-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/boo-mark.png" alt="" className="h-full w-full object-contain opacity-20" />
        <div className="boo-load-fill absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/boo-mark.png" alt="Loading" className="h-full w-full object-contain" />
        </div>
      </div>
    </div>
  );
}
