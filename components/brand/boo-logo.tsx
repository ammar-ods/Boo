import { cn } from "@/lib/utils";

export function BooLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col items-start leading-none", className)}>
      <span className="relative inline-flex items-end font-heading text-[2rem] font-semibold tracking-tight sm:text-[2.35rem]">
        <span className="absolute -left-3 top-1 text-boo-orange">✦</span>
        <span className="text-boo-pink">B</span>
        <span className="-ml-1 text-boo-orange">O</span>
        <span className="-ml-1 text-boo-teal">O</span>
        <span className="absolute -right-4 top-0 text-sm text-boo-teal">✦</span>
      </span>
      {!compact ? (
        <span className="mt-1 font-heading text-[0.7rem] font-semibold tracking-[0.22em] text-boo-ink sm:text-xs">
          CUSTOM CREATIONS
        </span>
      ) : null}
    </span>
  );
}
