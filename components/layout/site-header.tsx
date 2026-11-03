"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BooLogo } from "@/components/brand/boo-logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#about", label: "About" },
  { href: "/catalog", label: "Shop" },
  { href: "/#how", label: "How it works" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) return null;

  return (
    <header className="sticky top-0 z-40">
      <div className="chrome-bar h-2.5" />
      <div className="border-b border-border/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0">
            <BooLogo />
          </Link>
          <nav className="hidden items-center gap-7 font-heading text-lg text-boo-ink md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-boo-teal",
                  pathname === link.href && "text-boo-teal",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/login"
              className="hidden rounded-full border border-border px-4 py-2 font-heading text-sm text-boo-ink hover:border-boo-teal sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/catalog"
              className="rounded-full bg-boo-pink px-4 py-2 font-heading text-sm text-white shadow-sm transition hover:bg-boo-pink/90"
            >
              Start a custom
            </Link>
            <button
              type="button"
              className="rounded-full p-2 md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="flex flex-col gap-2 border-t border-border px-4 py-3 font-heading md:hidden">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/admin/login" onClick={() => setOpen(false)}>
              Log in
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}
