import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const token = (await cookies()).get(adminCookieName())?.value;
  const admin = await isValidAdminSession(token);
  return NextResponse.json({ admin });
}
