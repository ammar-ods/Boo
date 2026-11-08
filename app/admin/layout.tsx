"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/actions/admin";
import { BooLogo } from "@/components/brand/boo-logo";
import { SavedToast } from "@/components/admin/saved-toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin/login")) {
    return (
      <div dir="ltr" lang="en" className="admin-desk min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  return (
    <div dir="ltr" lang="en" className="admin-desk min-h-screen bg-background text-foreground">
      <div className="chrome-bar h-2.5" />
      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/admin/inquiries" className="flex items-center gap-3">
            <BooLogo compact />
            <span className="font-heading text-lg">Studio desk</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-3 font-heading text-sm">
            <Link href="/admin/inquiries" className="rounded-full px-3 py-1.5 hover:bg-secondary">
              Orders
            </Link>
            <Link href="/admin/products" className="rounded-full px-3 py-1.5 hover:bg-secondary">
              Products
            </Link>
            <Link href="/admin/promo" className="rounded-full px-3 py-1.5 hover:bg-secondary">
              Promo
            </Link>
            <Link href="/" className="rounded-full px-3 py-1.5 hover:bg-secondary">
              View site
            </Link>
            <form action={logoutAdmin}>
              <button className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-boo-pink">
                Log out
              </button>
            </form>
          </nav>
        </div>
      </div>
      {children}
      <SavedToast />
    </div>
  );
}
