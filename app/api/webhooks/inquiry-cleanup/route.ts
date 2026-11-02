import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteInquiryStorage } from "@/lib/storage-cleanup";
import type { InquiryRecord } from "@/lib/inquiry-types";

export async function POST(request: Request) {
  const secret = process.env.CLEANUP_WEBHOOK_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; record?: { id?: string } };
  const id = body.id ?? body.record?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing inquiry id" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("inquiries").select("*").eq("id", id).single();
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 });
  }

  if (data.status !== "fulfilled" && data.status !== "cancelled") {
    return NextResponse.json({ skipped: true });
  }

  const result = await deleteInquiryStorage(data as InquiryRecord);
  return NextResponse.json({ ok: true, ...result });
}
