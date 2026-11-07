import Image from "next/image";
import Link from "next/link";
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
        className="flex gap-4 overflow-hidden rounded-[16px] bg-white p-3 ring-1 ring-border transition hover:-translate-y-0.5 atelier-shadow"
      >
        <div className="relative size-28 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image src={product.mockup} alt={product.name} fill className="object-cover" />
        </div>
        <div className="min-w-0 py-1">
          <p className="text-[11px] tracking-[0.16em] text-oxford/60">{product.category.toUpperCase()}</p>
          <h3 className="font-heading text-xl text-oxford">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
          <p className="mt-2 text-sm font-medium text-oxford">Customize →</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/customize/${product.slug}`}
      className="group overflow-hidden rounded-[16px] bg-white ring-1 ring-border transition hover:-translate-y-0.5 atelier-shadow"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.mockup}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-oxford px-2.5 py-1 text-[11px] font-medium tracking-wide text-white">
          {product.category}
        </span>
        {product.is_laser_cut ? (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] text-oxford">
            Micro-batch
          </span>
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-heading text-xl text-oxford">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.tagline}</p>
        <p className="text-sm font-medium text-oxford">Customize →</p>
      </div>
    </Link>
  );
}
