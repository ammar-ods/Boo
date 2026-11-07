import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { getSite, saveSite } from "@/lib/local-db";
import { migrateSite } from "@/lib/site";

export async function GET() {
  return NextResponse.json({ site: await getSite(), persist: "ok" });
}

export async function POST(request: Request) {
  const token = (await cookies()).get(adminCookieName())?.value;
  if (!(await isValidAdminSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = migrateSite(await request.json());
  if (!Array.isArray(body.sections)) {
    return NextResponse.json({ error: "Invalid site" }, { status: 400 });
  }
  const saved = await saveSite(body);
  revalidatePath("/");
  return NextResponse.json(saved);
}
