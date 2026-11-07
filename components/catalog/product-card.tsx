import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/products";

export function ProductCard({
  product,
  layout = "grid",
}: {
  product: Product;
  layout?: "grid" | "list";
}) {
  if (layout === "list") {
    return (
      <Link
        href={`/customize/${product.slug}`}
        className="surface-card flex gap-4 p-3 transition hover:-translate-y-0.5"
      >
        <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-chip">
          <Image src={product.mockup} alt={product.name} fill className="object-cover" />
        </div>
        <div className="min-w-0 py-1">
          <p className="text-[11px] tracking-[0.16em] text-oxford/60">{product.category.toUpperCase()}</p>
          <h3 className="font-heading text-xl text-oxford">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
          <p className="mt-2 text-sm font-semibold text-oxford">Customize →</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/customize/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_16px_36px_-22px_rgba(10,37,64,0.32)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-chip">
          <Image
            src={product.mockup}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-oxford">
            {product.category}
          </span>
          {product.is_laser_cut ? (
            <span className="absolute right-3 top-3 rounded-full bg-oxford px-2 py-0.5 text-[11px] text-white">
              Micro-batch
            </span>
          ) : null}
          <span className="icon-circle absolute bottom-3 right-3 size-11 transition group-hover:translate-y-0.5">
            <Plus className="size-5" />
          </span>
        </div>
      </div>
      <div className="space-y-1 px-1 pt-3">
        <h3 className="font-heading text-lg leading-snug text-oxford">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.tagline}</p>
      </div>
    </Link>
  );
}
