import { cn } from "@/lib/utils";

export function BooLogo({
  className,
  compact = false,
  onDark = false,
  src,
}: {
  className?: string;
  compact?: boolean;
  onDark?: boolean;
  src?: string;
}) {
  const image = src || "/brand/boo-mark.png";
  const isDefault = image === "/brand/boo-mark.png";
  return (
    <span className={cn("inline-flex items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt="Boo"
        data-default={isDefault ? "1" : undefined}
        className={cn(
          compact ? "h-9 w-auto sm:h-10" : "h-11 w-auto sm:h-[3.25rem]",
          onDark && isDefault ? "brightness-0 invert" : "",
        )}
      />
    </span>
  );
}
