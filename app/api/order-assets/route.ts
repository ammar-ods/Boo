import { NextResponse } from "next/server";
import { savePublicUpload } from "@/lib/local-db";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File is too large" }, { status: 400 });
    }
    const allowed = file.type.startsWith("image/") || file.type === "application/pdf";
    if (file.type && !allowed) {
      return NextResponse.json({ error: "Unsupported file" }, { status: 400 });
    }
    const rawExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const ext = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : "jpg";
    const url = await savePublicUpload(
      "orders",
      `design-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`,
      Buffer.from(await file.arrayBuffer()),
      file.type || undefined,
    );
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
