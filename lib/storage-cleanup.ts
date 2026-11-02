import { createAdminClient } from "@/lib/supabase/admin";
import type { InquiryRecord } from "@/lib/inquiry-types";

export function inquiryFilePaths(inquiry: Pick<InquiryRecord, "mockup_path" | "production_paths">) {
  return [
    inquiry.mockup_path,
    ...(inquiry.production_paths ?? []),
  ].filter((path): path is string => Boolean(path));
}

export async function deleteInquiryStorage(inquiry: Pick<InquiryRecord, "id" | "mockup_path" | "production_paths">) {
  const paths = inquiryFilePaths(inquiry);
  if (!paths.length) return { deleted: [] as string[] };

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from("inquiry-assets").remove(paths);
  if (error) throw error;

  await supabase
    .from("inquiries")
    .update({
      mockup_path: null,
      production_paths: [],
      cleanup_requested_at: new Date().toISOString(),
    })
    .eq("id", inquiry.id);

  return { deleted: paths };
}
