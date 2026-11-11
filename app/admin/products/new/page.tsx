import { createProduct } from "@/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import { getSite } from "@/lib/local-db";
import { pick } from "@/lib/site";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; category?: string }>;
}) {
  const { error, category } = await searchParams;
  const site = await getSite();
  const categories = (site.chrome.catalogSections ?? []).map((section) => ({
    id: section.id,
    label: pick(section.label, "en") || section.id,
  }));
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <h1 className="mb-6 font-heading text-4xl">New product</h1>
      <ProductForm
        action={createProduct}
        error={error ? decodeURIComponent(error) : undefined}
        categories={categories}
        defaultCategory={category}
      />
    </div>
  );
}
