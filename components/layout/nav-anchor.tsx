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
}: {
  link: NavLink;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (!isNavClickable(link)) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }
  return (
    <Link href={link.href} className={className} style={style} onClick={onClick}>
      {children}
    </Link>
  );
}
