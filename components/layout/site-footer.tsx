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
    <footer className="mt-8 rounded-t-[32px] bg-[#121214] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <BooLogo onDark />
          <p className="font-script mt-4 text-2xl text-white/80">Selected with taste.</p>
          <p className="mt-3 max-w-sm text-sm text-white/55">
            An Oxford atelier for digital creators and modern gifters — micro-batch
            hardware, letterpress keepsakes, and desk tools built to last.
          </p>
        </div>
        <div className="text-sm text-white/70">
          <p className="mb-3 font-medium text-white">Collections</p>
          <Link href="/catalog?collection=creator-kits" className="block py-1 hover:text-white">
            Creator Kits
          </Link>
          <Link href="/catalog?collection=studio-gear" className="block py-1 hover:text-white">
            Studio Gear
          </Link>
          <Link href="/catalog?collection=gifts" className="block py-1 hover:text-white">
            Curated Gifts
          </Link>
          <Link href="/catalog?collection=under-50" className="block py-1 hover:text-white">
            Drops Under $50
          </Link>
        </div>
        <div className="text-sm text-white/70">
          <p className="mb-3 font-medium text-white">Atelier</p>
          <p>30-day studio trial</p>
          <p>Carbon-neutral courier</p>
          <p>USD · EUR · GBP · EGP</p>
          <Link href="/admin/login" className="mt-4 inline-block text-white/40 hover:text-white">
            Studio log in
          </Link>
        </div>
      </div>
    </footer>
  );
}
