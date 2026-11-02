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
      <svg
        viewBox="0 0 220 92"
        className={cn(compact ? "h-10 w-auto" : "h-12 w-auto sm:h-14")}
        aria-label="BOO"
      >
        <text x="8" y="22" fontSize="16" fill="#F99B36">✦</text>
        <text
          x="18"
          y="72"
          fontFamily="Fredoka, Nunito, sans-serif"
          fontSize="72"
          fontWeight="700"
          fill="#F96C9F"
        >
          B
        </text>
        <text
          x="78"
          y="72"
          fontFamily="Fredoka, Nunito, sans-serif"
          fontSize="72"
          fontWeight="700"
          fill="#F99B36"
        >
          O
        </text>
        <text
          x="138"
          y="72"
          fontFamily="Fredoka, Nunito, sans-serif"
          fontSize="72"
          fontWeight="700"
          fill="#32B7B2"
        >
          O
        </text>
        <text x="198" y="28" fontSize="16" fill="#32B7B2">✦</text>
      </svg>
      {!compact ? (
        <span className="mt-0.5 font-heading text-[0.68rem] font-semibold tracking-[0.22em] text-[#333333] sm:text-xs">
          CUSTOM CREATIONS
        </span>
      ) : null}
    </span>
  );
}
