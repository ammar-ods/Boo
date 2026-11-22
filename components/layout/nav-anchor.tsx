import Link from "next/link";
import type { NavLink } from "@/lib/site";

export function isNavClickable(link: NavLink) {
  return link.clickable !== false;
}

export function NavAnchor({
  link,
  className,
  style,
  onClick,
  children,
  "aria-current": ariaCurrent,
}: {
  link: NavLink;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  children: React.ReactNode;
  "aria-current"?: "page";
}) {
  if (!isNavClickable(link)) {
    return (
      <span
        className={className}
        style={style}
        aria-current={ariaCurrent}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onClick?.();
        }}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {children}
      </span>
    );
  }
  return (
    <Link href={link.href} className={className} style={style} onClick={onClick} aria-current={ariaCurrent}>
      {children}
    </Link>
  );
}
