import Link from "next/link";
import { getCatalog } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const products = await getCatalog();
  const { error, created } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      {error ? (
        <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </p>
      ) : null}
      {created ? (
        <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Saved {decodeURIComponent(created)}.
        </p>
      ) : null}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-script text-2xl text-boo-orange">catalog</p>
          <h1 className="font-heading text-4xl">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-boo-pink px-4 py-2 font-heading text-white"
        >
          New product
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/admin/products/${product.slug}`}
            className="overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-foreground/10 transition hover:-translate-y-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.mockup} alt="" className="aspect-square w-full object-cover bg-[#f6f3ee]" />
            <div className="p-4">
              <p className="text-xs text-muted-foreground">{product.category}</p>
              <h2 className="font-heading text-xl">{product.name}</h2>
              {product.archived ? (
                <p className="text-xs text-boo-orange">Hidden from shop</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
