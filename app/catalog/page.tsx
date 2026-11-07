import { ProductGrid } from "@/components/catalog/product-grid";
import { getLiveCatalog } from "@/lib/local-db";
import { CatalogIntro } from "@/components/shop/catalog-intro";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; q?: string }>;
}) {
  const products = await getLiveCatalog();
  const { collection, q } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <CatalogIntro query={q} collection={collection} />
      <ProductGrid products={products} collection={collection} query={q} />
    </div>
  );
}
