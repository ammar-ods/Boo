"use client";

import { ChevronLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BackChevron({ className }: { className?: string }) {
  const { locale } = useI18n();
  return <ChevronLeft className={cn("size-4 shrink-0", locale === "ar" && "rotate-180", className)} aria-hidden />;
}
