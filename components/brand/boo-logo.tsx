import { cn } from "@/lib/utils";

export function BooLogo({
  className,
  compact = false,
  onDark = false,
}: {
  className?: string;
  compact?: boolean;
  onDark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/boo-mark.png"
        alt="Boo"
        className={cn(
          compact ? "h-8 w-auto sm:h-9" : "h-10 w-auto sm:h-12",
          onDark ? "brightness-0 invert" : "dark:brightness-0 dark:invert",
        )}
      />
    </span>
  );
}
