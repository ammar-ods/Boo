import { createProduct } from "@/actions/products";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-heading text-4xl">New product</h1>
      <ProductForm action={createProduct} />
    </div>
  );
}
