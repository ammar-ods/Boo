import { ProductGrid } from "@/components/catalog/product-grid";
import { getLiveCatalog } from "@/lib/local-db";
import { CatalogIntro } from "@/components/shop/catalog-intro";
import { CatalogSections } from "@/components/shop/catalog-sections";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; q?: string; all?: string }>;
}) {
  const products = await getLiveCatalog();
  const { collection, q, all } = await searchParams;
  const showSections = !collection && !q && all !== "1";

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
      {showSections ? (
        <CatalogSections />
      ) : (
        <>
          <CatalogIntro query={q} collection={collection} />
          <ProductGrid products={products} collection={collection} query={q} />
        </>
      )}
    </div>
  );
}
