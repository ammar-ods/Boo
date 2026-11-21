"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/accounting", label: "Dashboard" },
  { href: "/admin/accounting/sales", label: "Sales" },
  { href: "/admin/accounting/spendings", label: "Spendings" },
  { href: "/admin/accounting/assets", label: "Assets" },
  { href: "/admin/accounting/settings", label: "Settings" },
];

export function FinanceNav() {
  const pathname = usePathname();
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold tracking-[0.04em] transition",
              active ? "bg-oxford text-white" : "bg-white text-oxford/60 ring-1 ring-oxford/8 hover:text-oxford",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
