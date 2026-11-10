import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { getSite } from "@/lib/local-db";
import { cmsPagePath, pageSlugify, RESERVED_PAGE_SLUGS } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LooseCmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = pageSlugify(decodeURIComponent(raw || ""));
  if (!slug || RESERVED_PAGE_SLUGS.has(slug)) notFound();
  const site = await getSite();
  const page = site.pages.find((item) => item.slug === slug);
  let isAdmin = false;
  try {
    const token = (await cookies()).get(adminCookieName())?.value;
    isAdmin = await isValidAdminSession(token);
  } catch {
    isAdmin = false;
  }
  if (page || isAdmin) redirect(cmsPagePath(slug));
  notFound();
}
