"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { BooLogo } from "@/components/brand/boo-logo";

const LINKS = [
  { href: "/catalog?collection=creator-kits", label: "Creator Kits" },
  { href: "/catalog?collection=studio-gear", label: "Studio Gear" },
  { href: "/catalog?collection=gifts", label: "Curated Gifts" },
  { href: "/catalog?collection=staff-picks", label: "Staff Picks" },
  { href: "/catalog?collection=under-50", label: "Drops Under $50" },
];

const CURRENCIES = ["USD $", "EUR €", "GBP £", "EGP ج.م"];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("USD $");

  useEffect(() => {
    const stored = window.localStorage.getItem("boo-currency");
    if (stored) setCurrency(stored);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) return null;

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-oxford text-[11px] tracking-[0.18em] text-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 sm:px-6">
          <p>MICRO-BATCH ATELIER · FREE SHIPPING OVER $75</p>
          <select
            value={currency}
            onChange={(event) => {
              setCurrency(event.target.value);
              window.localStorage.setItem("boo-currency", event.target.value);
            }}
            className="bg-transparent text-white/90 outline-none"
            aria-label="Currency"
          >
            {CURRENCIES.map((item) => (
              <option key={item} value={item} className="text-oxford">
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="border-b border-border bg-[#FAF9F6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0">
            <BooLogo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-oxford lg:flex">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-oxford/60">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-xs text-muted-foreground"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded bg-secondary px-1.5 py-0.5 text-[10px] md:inline">⌘K</kbd>
            </button>
            <Link
              href="/catalog"
              className="rounded-full bg-oxford px-4 py-2 text-sm font-medium text-white"
            >
              Shop drops
            </Link>
            <button
              type="button"
              className="rounded-full p-2 lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm lg:hidden">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      {searchOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-start bg-oxford/40 px-4 pt-28">
          <form
            className="mx-auto w-full max-w-xl rounded-2xl bg-white p-4 atelier-shadow"
            onSubmit={(event) => {
              event.preventDefault();
              setSearchOpen(false);
              router.push(`/catalog?q=${encodeURIComponent(query)}`);
            }}
          >
            <div className="flex items-center gap-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search kits, gear, gifts…"
                className="h-10 w-full outline-none"
              />
              <button type="button" className="text-sm text-muted-foreground" onClick={() => setSearchOpen(false)}>
                Esc
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </header>
  );
}
