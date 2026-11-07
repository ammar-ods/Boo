"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export function AdminEditFab() {
  const pathname = usePathname();
  const { t } = useI18n();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed end-4 top-24 z-[60] flex flex-col items-end gap-2">
      <Link href="/?edit=1" className="btn-press btn-press-sm">
        {t("editSite")}
      </Link>
      <Link href="/admin/inquiries" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-oxford shadow">
        {t("studio")}
      </Link>
    </div>
  );
}
