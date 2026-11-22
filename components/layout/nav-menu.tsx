"use client";

import { useEffect, useRef, useState } from "react";
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
    if (itemMatches(link.href, pathname, search)) return true;
    return (link.children ?? []).some((child) => child.visible && itemMatches(child.href, pathname, search));
  }

  return (
    <nav
      className="hidden flex-wrap items-center justify-center gap-x-4 gap-y-1 overflow-visible py-1.5 text-foreground/70 sm:gap-x-6 md:flex"
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemClass = cn(
    "rounded-lg px-4 py-2 transition-colors",
    current ? "bg-chip font-bold text-foreground" : "hover:text-foreground",
  );

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!children.length) {
    return (
      <NavAnchor link={link} className={itemClass} aria-current={current ? "page" : undefined}>
        {pick(link.label, locale)}
      </NavAnchor>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className={cn(itemClass, "inline-flex items-center gap-0.5")}>
        <NavAnchor
          link={link}
          className={cn("inline-flex items-center", !isNavClickable(link) && "cursor-pointer")}
          aria-current={current ? "page" : undefined}
          onClick={() => {
            if (!isNavClickable(link)) setOpen((value) => !value);
          }}
        >
          {pick(link.label, locale)}
        </NavAnchor>
        <button
          type="button"
          className="grid size-7 place-items-center rounded-md text-foreground/60 hover:text-foreground"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={pick(link.label, locale)}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen((value) => !value);
          }}
        >
          <ChevronDown className={`size-3.5 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open ? (
        <div className="absolute top-full left-1/2 z-[80] min-w-52 -translate-x-1/2 pt-1">
          <div className="overflow-hidden rounded-xl bg-card py-1.5 shadow-[0_18px_40px_-22px_rgba(10,37,64,0.4)] ring-1 ring-oxford/10">
            {children.map((child) => (
              <ChildLink key={child.id} link={child} locale={locale} onPick={() => setOpen(false)} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChildLink({
  link,
  locale,
  onPick,
}: {
  link: NavLink;
  locale: string;
  onPick: () => void;
}) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const current = itemMatches(link.href, pathname, search);
  return (
    <NavAnchor
      link={link}
      className={cn("block px-4 py-2.5 text-foreground hover:bg-cream", current && "bg-cream font-semibold")}
      aria-current={current ? "page" : undefined}
      onClick={onPick}
    >
      {pick(link.label, locale)}
    </NavAnchor>
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
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const current =
    itemMatches(link.href, pathname, search) ||
    (link.children ?? []).some((child) => child.visible && itemMatches(child.href, pathname, search));
  const children = (link.children ?? []).filter((item) => item.visible);
  const [open, setOpen] = useState(false);

  if (!children.length) {
    return (
      <NavAnchor
        link={link}
        onClick={onNavigate}
        aria-current={current ? "page" : undefined}
        className={cn("flex min-h-12 items-center px-2 font-medium text-foreground", current && "rounded-lg bg-chip font-bold")}
        style={{ fontSize: "var(--nav-font-size, 16px)", paddingInlineStart: depth ? depth * 16 : undefined }}
      >
        {pick(link.label, locale)}
      </NavAnchor>
    );
  }

  const clickable = isNavClickable(link);

  return (
    <div>
      <div className={cn("flex min-h-12 items-center gap-1 px-2", current && "rounded-lg bg-chip")}>
        {clickable ? (
          <NavAnchor
            link={link}
            onClick={onNavigate}
            className="flex-1 font-medium text-foreground"
            style={{ fontSize: "var(--nav-font-size, 16px)", paddingInlineStart: depth ? depth * 16 : undefined }}
          >
            {pick(link.label, locale)}
          </NavAnchor>
        ) : (
          <button
            type="button"
            className="flex-1 text-start font-medium text-foreground"
            style={{ fontSize: "var(--nav-font-size, 16px)", paddingInlineStart: depth ? depth * 16 : undefined }}
            onClick={() => setOpen((value) => !value)}
          >
            {pick(link.label, locale)}
          </button>
        )}
        <button
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-full text-foreground"
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
