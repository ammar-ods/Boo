import { notFound } from "next/navigation";
import { CustomizerShell } from "@/components/customizer/customizer-shell";
import { getProduct, PRODUCTS } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export default async function CustomizePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <CustomizerShell product={product} />;
}
