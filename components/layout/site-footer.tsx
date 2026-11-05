"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BooLogo } from "@/components/brand/boo-logo";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/customize")) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <BooLogo />
          <p className="font-script mt-3 text-2xl text-boo-teal">
            made with love
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Lorem ipsum dolor sit amet</p>
          <p>consectetur adipiscing elit</p>
          <Link href="/admin/login" className="mt-3 inline-block text-boo-ink/50 hover:text-boo-teal">
            Studio log in
          </Link>
        </div>
      </div>
    </footer>
  );
}
