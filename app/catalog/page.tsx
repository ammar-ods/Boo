import { ProductGrid } from "@/components/catalog/product-grid";
import { getLiveCatalog } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CatalogPage() {
  const products = await getLiveCatalog();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="font-script text-3xl text-boo-pink">shop</p>
      <h1 className="font-heading text-5xl">Catalog</h1>
      <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">
        Choose a product and jump straight into the customizer. Every inquiry is saved
        for the studio desk, with a mockup thumbnail plus your original files.
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
