import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { savePublicUpload } from "@/lib/local-db";

export async function POST(request: Request) {
  const token = (await cookies()).get(adminCookieName())?.value;
  if (!(await isValidAdminSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const url = await savePublicUpload(
    "products",
    `site-${Date.now()}.${ext}`,
    Buffer.from(await file.arrayBuffer()),
    file.type || undefined,
  );
  return NextResponse.json({ url });
}
