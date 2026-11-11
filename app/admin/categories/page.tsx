import Link from "next/link";
import { getSite } from "@/lib/local-db";
import { pick } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string }>;
}) {
  const site = await getSite();
  const { error, deleted } = await searchParams;
  const sections = site.chrome.catalogSections ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      {error ? (
        <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{decodeURIComponent(error)}</p>
      ) : null}
      {deleted ? (
        <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Category removed.</p>
      ) : null}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-script text-2xl text-boo-teal">shop</p>
          <h1 className="font-heading text-4xl">Categories</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            These tiles appear on the shop page, under Shop in the nav, and in Discipline.
          </p>
        </div>
        <Link href="/admin/categories/new" className="rounded-full bg-boo-pink px-4 py-2 font-heading text-white">
          New category
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`/admin/categories/${section.id}`}
            className="overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-foreground/10 transition hover:-translate-y-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.image || "/products/white-tee-front.jpg"}
              alt=""
              className="aspect-[4/5] w-full bg-[#f6f3ee] object-cover"
            />
            <div className="p-4">
              <h2 className="font-heading text-xl">{pick(section.label, "en")}</h2>
              <p className="text-xs text-muted-foreground">{section.id}</p>
              {section.visible === false ? <p className="mt-1 text-xs text-boo-orange">Hidden</p> : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
