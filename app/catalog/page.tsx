import { ProductGrid } from "@/components/catalog/product-grid";

export default function CatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="font-script text-3xl text-boo-pink">shop</p>
      <h1 className="font-heading text-5xl">Catalog</h1>
      <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">
        Choose a product and jump straight into the customizer. Every inquiry includes a
        mockup thumbnail plus your original production files.
      </p>
      <ProductGrid />
    </div>
  );
}
