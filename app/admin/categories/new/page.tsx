import { createCategory } from "@/actions/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { getCatalog } from "@/lib/local-db";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const products = await getCatalog();
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="mb-6 font-heading text-4xl">New category</h1>
      <CategoryForm
        products={products}
        action={createCategory}
        error={error ? decodeURIComponent(error) : undefined}
      />
    </div>
  );
}
