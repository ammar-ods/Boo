import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteCategory, updateCategory } from "@/actions/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { getCatalog, getSite } from "@/lib/local-db";
import { pick } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const site = await getSite();
  const section = (site.chrome.catalogSections ?? []).find((item) => item.id === id);
  if (!section) redirect("/admin/categories?error=missing");
  const products = await getCatalog();

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <Link href="/admin/categories" className="text-sm text-boo-teal">
        ← Categories
      </Link>
      <div className="mb-6 mt-2 flex items-end justify-between gap-4">
        <h1 className="font-heading text-4xl">{pick(section.label, "en")}</h1>
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={section.id} />
          <button className="text-sm text-destructive">Delete</button>
        </form>
      </div>
      {saved ? (
        <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Saved.</p>
      ) : null}
      <CategoryForm
        section={section}
        products={products}
        action={updateCategory}
        error={error ? decodeURIComponent(error) : undefined}
      />
    </div>
  );
}
