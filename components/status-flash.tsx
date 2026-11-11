"use client";

import { useEffect, useState } from "react";

let showFlash: ((message: string) => void) | null = null;

export function flashStatus(message: string) {
  showFlash?.(message);
}

export function StatusFlashHost() {
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    showFlash = (next) => {
      setMessage(next);
      setToken((value) => value + 1);
    };
    return () => {
      showFlash = null;
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const hide = window.setTimeout(() => setMessage(null), 1800);
    return () => window.clearTimeout(hide);
  }, [message, token]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[95] grid place-items-center">
      <div
        key={token}
        role="status"
        className="saved-toast flex items-center gap-2 rounded-full bg-oxford px-7 py-4 font-heading text-xl text-white shadow-xl ring-1 ring-white/30"
      >
        <span className="grid size-6 place-items-center rounded-full bg-white/20 text-sm">✓</span>
        {message}
      </div>
    </div>
  );
}
