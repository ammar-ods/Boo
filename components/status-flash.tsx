"use client";

import { useEffect, useState } from "react";

let showFlash: ((message: string, hold?: boolean) => void) | null = null;
let hideFlashFn: (() => void) | null = null;

export function flashStatus(message: string, hold = false) {
  showFlash?.(message, hold);
}

export function hideFlash() {
  hideFlashFn?.();
}

export function StatusFlashHost() {
  const [message, setMessage] = useState<string | null>(null);
  const [hold, setHold] = useState(false);
  const [token, setToken] = useState(0);

  useEffect(() => {
    showFlash = (next, nextHold = false) => {
      setMessage(next);
      setHold(nextHold);
      setToken((value) => value + 1);
    };
    hideFlashFn = () => {
      setMessage(null);
      setHold(false);
    };
    return () => {
      showFlash = null;
      hideFlashFn = null;
    };
  }, []);

  useEffect(() => {
    if (!message || hold) return;
    const hide = window.setTimeout(() => setMessage(null), 1800);
    return () => window.clearTimeout(hide);
  }, [message, token, hold]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[95] grid place-items-center">
      <div
        key={token}
        role="status"
        className="saved-toast flex max-w-[min(22rem,calc(100vw-2rem))] items-center gap-2 rounded-full bg-oxford px-7 py-4 text-center font-heading text-lg text-white shadow-xl ring-1 ring-white/30 sm:text-xl"
      >
        {hold ? (
          <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <span className="grid size-6 place-items-center rounded-full bg-white/20 text-sm">✓</span>
        )}
        {message}
      </div>
    </div>
  );
}
