"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { NavAnchor, isNavClickable } from "@/components/layout/nav-anchor";
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
    <nav className="hidden items-center gap-7 text-[13px] font-semibold tracking-[0.08em] text-oxford/70 md:flex">
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
      <NavAnchor link={link} className="hover:text-oxford/55">
        {pick(link.label, locale)}
      </NavAnchor>
    );
  }

  return (
    <div className="group relative">
      <NavAnchor
        link={link}
        className="inline-flex cursor-pointer items-center gap-1 hover:text-oxford/55"
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
              className="block px-4 py-2.5 text-sm text-oxford hover:bg-cream"
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
        className="flex min-h-12 items-center text-base font-medium text-oxford"
        style={{ paddingInlineStart: depth ? depth * 16 : undefined }}
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
            className="flex-1 text-base font-medium text-oxford"
            style={{ paddingInlineStart: depth ? depth * 16 : undefined }}
          >
            {pick(link.label, locale)}
          </NavAnchor>
        ) : (
          <button
            type="button"
            className="flex-1 text-start text-base font-medium text-oxford"
            style={{ paddingInlineStart: depth ? depth * 16 : undefined }}
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
