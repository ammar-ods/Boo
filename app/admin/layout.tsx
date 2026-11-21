"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/actions/admin";
import { BooLogo } from "@/components/brand/boo-logo";
import { SavedToast } from "@/components/admin/saved-toast";
import { cn } from "@/lib/utils";

const WEBSITE_LINKS = [
  { href: "/admin/website", label: "Overview" },
  { href: "/", label: "Pages" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/promo", label: "Promo" },
  { href: "/admin/forms", label: "Forms" },
  { href: "/admin/settings", label: "Settings" },
];

function inWebsite(pathname: string) {
  return (
    pathname.startsWith("/admin/website") ||
    pathname.startsWith("/admin/products") ||
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/promo") ||
    pathname.startsWith("/admin/forms") ||
    pathname.startsWith("/admin/settings")
  );
}

function navClass(active: boolean) {
  return cn("rounded-full px-3 py-1.5 hover:bg-secondary", active && "bg-secondary font-semibold");
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin/login")) {
    return (
      <div dir="ltr" lang="en" className="admin-desk min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  const website = inWebsite(pathname);

  return (
    <div dir="ltr" lang="en" className="admin-desk min-h-screen bg-background text-foreground">
      <div className="chrome-bar h-2.5 print:hidden" />
      <div className="border-b border-border bg-white print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <BooLogo compact />
            <span className="font-heading text-lg">Studio desk</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-3 font-heading text-sm">
            <Link href="/admin" className={navClass(pathname === "/admin")}>
              Home
            </Link>
            <Link href="/admin/inquiries" className={navClass(pathname.startsWith("/admin/inquiries"))}>
              Orders
            </Link>
            <Link href="/admin/website" className={navClass(website)}>
              Website
            </Link>
            <Link href="/admin/accounting" className={navClass(pathname.startsWith("/admin/accounting"))}>
              Accounting
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
        {website ? (
          <div className="border-t border-oxford/6">
            <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-5 py-2.5 sm:px-8">
              {WEBSITE_LINKS.map((link) => {
                const active =
                  link.href === "/admin/website"
                    ? pathname === "/admin/website"
                    : link.href !== "/" && (pathname === link.href || pathname.startsWith(`${link.href}/`));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn("rounded-full px-3 py-1 text-sm hover:bg-secondary", active && "bg-secondary font-semibold")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      {children}
      <SavedToast />
    </div>
  );
}
