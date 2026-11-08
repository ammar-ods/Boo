import { createProduct } from "@/actions/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <h1 className="mb-6 font-heading text-4xl">New product</h1>
      <ProductForm action={createProduct} error={error ? decodeURIComponent(error) : undefined} />
    </div>
  );
}
