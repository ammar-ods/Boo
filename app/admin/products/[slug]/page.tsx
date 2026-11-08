import Link from "next/link";
import { redirect } from "next/navigation";
import { removeProduct, updateProduct } from "@/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import { getCatalogProduct } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const product = await getCatalogProduct(slug);
  if (!product) {
    redirect(
      `/admin/products?error=${encodeURIComponent(`Saved, but "${slug}" is not readable yet. Check Table Editor → products.`)}`,
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <Link href="/admin/products" className="text-sm text-boo-teal">
        ← Products
      </Link>
      <div className="mb-6 mt-2 flex items-end justify-between gap-4">
        <h1 className="font-heading text-4xl">{product.name}</h1>
        <form action={removeProduct}>
          <input type="hidden" name="slug" value={product.slug} />
          <button className="text-sm text-destructive">Delete</button>
        </form>
      </div>
      <ProductForm
        product={product}
        action={updateProduct}
        error={error ? decodeURIComponent(error) : undefined}
      />
    </div>
  );
}
