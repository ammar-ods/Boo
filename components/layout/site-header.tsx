"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BooLogo } from "@/components/brand/boo-logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#about", label: "About" },
  { href: "/catalog", label: "Shop" },
  { href: "/#creations", label: "Creations" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
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
          <Link
            href="/catalog"
            className="rounded-full bg-boo-pink px-4 py-2 font-heading text-sm text-white shadow-sm transition hover:bg-boo-pink/90"
          >
            Start a custom
          </Link>
        </div>
      </div>
    </header>
  );
}
