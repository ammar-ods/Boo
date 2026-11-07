import { notFound } from "next/navigation";
import { ProductWorkspace } from "@/components/shop/product-workspace";
import { getCatalogProduct } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product || product.archived) notFound();
  return <ProductWorkspace product={product} />;
}
