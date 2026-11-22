"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { NavAnchor, isNavClickable } from "@/components/layout/nav-anchor";
import { itemMatches } from "@/components/shop/shop-sidebar";
import { pick, type NavLink } from "@/lib/site";
import { cn } from "@/lib/utils";

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
  const pathname = usePathname();
  const search = useSearchParams().toString();
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

  function active(link: NavLink) {
    if (!isNavClickable(link)) {
      return (link.children ?? []).some((child) => child.visible && itemMatches(child.href, pathname, search));
    }
    return itemMatches(link.href, pathname, search);
  }

  return (
    <nav
      className="hidden items-center gap-2 overflow-x-auto whitespace-nowrap text-oxford/70 md:flex"
      style={{ fontSize: "var(--nav-font-size, 14px)" }}
    >
      {visible.map((link) => (
        <DesktopItem key={link.id} link={link} locale={locale} current={active(link)} />
      ))}
    </nav>
  );
}

function DesktopItem({ link, locale, current }: { link: NavLink; locale: string; current: boolean }) {
  const children = (link.children ?? []).filter((item) => item.visible);
  const itemClass = cn(
    "transition-colors py-1",
    current
      ? "font-bold text-oxford bg-[#eae8e4] rounded-lg px-3"
      : "hover:text-oxford px-1",
  );
  if (!children.length) {
    return (
      <NavAnchor link={link} className={itemClass} aria-current={current ? "page" : undefined}>
        {pick(link.label, locale)}
      </NavAnchor>
    );
  }

  return (
    <div className="group relative">
      <NavAnchor
        link={link}
        className={cn(itemClass, "inline-flex cursor-pointer items-center gap-1")}
        aria-current={current ? "page" : undefined}
      >
        {pick(link.label, locale)}
        <ChevronDown className="size-3.5 opacity-60 transition group-hover:rotate-180 group-focus-within:rotate-180" />
      </NavAnchor>
      <div className="invisible absolute start-0 top-full z-50 min-w-48 origin-top translate-y-1 pt-2 opacity-0 transition duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="overflow-hidden rounded-2xl bg-white py-1.5 shadow-[0_18px_40px_-22px_rgba(10,37,64,0.4)] ring-1 ring-oxford/10">
          {children.map((child) => (
            <NavAnchor
              key={child.id}
              link={child}
              className="block px-4 py-2.5 text-oxford hover:bg-cream"
            >
              {pick(child.label, locale)}
            </NavAnchor>
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
  depth = 0,
}: {
  link: NavLink;
  locale: string;
  onNavigate?: () => void;
  depth?: number;
}) {
  const children = (link.children ?? []).filter((item) => item.visible);
  const [open, setOpen] = useState(false);

  if (!children.length) {
    return (
      <NavAnchor
        link={link}
        onClick={onNavigate}
        className="flex min-h-12 items-center font-medium text-oxford"
        style={{ fontSize: "var(--nav-font-size, 16px)", paddingInlineStart: depth ? depth * 16 : undefined }}
      >
        {pick(link.label, locale)}
      </NavAnchor>
    );
  }

  const clickable = isNavClickable(link);

  return (
    <div>
      <div className="flex min-h-12 items-center gap-1">
        {clickable ? (
          <NavAnchor
            link={link}
            onClick={onNavigate}
            className="flex-1 font-medium text-oxford"
            style={{ fontSize: "var(--nav-font-size, 16px)", paddingInlineStart: depth ? depth * 16 : undefined }}
          >
            {pick(link.label, locale)}
          </NavAnchor>
        ) : (
          <button
            type="button"
            className="flex-1 text-start font-medium text-oxford"
            style={{ fontSize: "var(--nav-font-size, 16px)", paddingInlineStart: depth ? depth * 16 : undefined }}
            onClick={() => setOpen((value) => !value)}
          >
            {pick(link.label, locale)}
          </button>
        )}
        <button
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-full text-oxford"
          aria-expanded={open}
          aria-label={pick(link.label, locale)}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen((value) => !value);
          }}
        >
          <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open ? (
        <div className="pb-1">
          {children.map((child) => (
            <MobileItem
              key={child.id}
              link={child}
              locale={locale}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
