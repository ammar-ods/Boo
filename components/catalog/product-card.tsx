import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

const accentMap = {
  pink: "bg-boo-pink",
  orange: "bg-boo-orange",
  teal: "bg-boo-teal",
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/customize/${product.slug}`}
      className="group overflow-hidden rounded-3xl bg-white ring-1 ring-foreground/10 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.mockup}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-heading text-white ${accentMap[product.accent]}`}
        >
          {product.category}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-xl">{product.name}</h3>
          {product.is_laser_cut ? (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-heading">
              Laser
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{product.tagline}</p>
        <p className="font-heading text-boo-teal">Customize →</p>
      </div>
    </Link>
  );
}
