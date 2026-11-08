import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.CLEANUP_WEBHOOK_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    skipped: true,
    reason: "Artwork is kept until an admin deletes the order.",
  });
}
