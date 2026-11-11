"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { pick, type NavLink } from "@/lib/site";

export function NavMenu({
  links,
  locale,
  onNavigate,
  variant = "desktop",
}: {
  links: NavLink[];
  locale: string;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const visible = links.filter((link) => link.visible);
  if (variant === "mobile") {
    return (
      <div className="flex flex-col">
        {visible.map((link) => (
          <MobileItem key={link.id} link={link} locale={locale} onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  return (
    <nav className="hidden items-center gap-6 text-[15px] font-medium text-oxford md:flex">
      {visible.map((link) => (
        <DesktopItem key={link.id} link={link} locale={locale} />
      ))}
    </nav>
  );
}

function DesktopItem({ link, locale }: { link: NavLink; locale: string }) {
  const children = (link.children ?? []).filter((item) => item.visible);
  if (!children.length) {
    return (
      <Link href={link.href} className="hover:text-oxford/55">
        {pick(link.label, locale)}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={link.href}
        className="inline-flex items-center gap-1 hover:text-oxford/55"
        aria-haspopup="menu"
      >
        {pick(link.label, locale)}
        <ChevronDown className="size-3.5 opacity-60 transition group-hover:rotate-180 group-focus-within:rotate-180" />
      </Link>
      <div className="invisible absolute start-0 top-full z-50 min-w-48 origin-top translate-y-1 pt-2 opacity-0 transition duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="overflow-hidden rounded-2xl bg-white py-1.5 shadow-[0_18px_40px_-22px_rgba(10,37,64,0.4)] ring-1 ring-oxford/10">
          {children.map((child) => (
            <Link
              key={child.id}
              href={child.href}
              className="block px-4 py-2.5 text-sm text-oxford hover:bg-cream"
            >
              {pick(child.label, locale)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileItem({
  link,
  locale,
  onNavigate,
}: {
  link: NavLink;
  locale: string;
  onNavigate?: () => void;
}) {
  const children = (link.children ?? []).filter((item) => item.visible);
  const [open, setOpen] = useState(false);

  if (!children.length) {
    return (
      <Link
        href={link.href}
        onClick={onNavigate}
        className="flex min-h-12 items-center text-base font-medium text-oxford"
      >
        {pick(link.label, locale)}
      </Link>
    );
  }

  return (
    <div>
      <div className="flex min-h-12 items-center gap-2">
        <Link
          href={link.href}
          onClick={onNavigate}
          className="flex-1 text-base font-medium text-oxford"
        >
          {pick(link.label, locale)}
        </Link>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full text-oxford"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {children.map((child) => (
            <Link
              key={child.id}
              href={child.href}
              onClick={onNavigate}
              className="flex min-h-11 items-center ps-4 text-sm text-oxford/80"
            >
              {pick(child.label, locale)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
