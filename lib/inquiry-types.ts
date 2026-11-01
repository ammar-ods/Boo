import type { InquiryStatus } from "@/lib/schemas/inquiry";

export type InquiryRecord = {
  id: string;
  reference_code: string;
  product_slug: string;
  product_name: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  material: string | null;
  quantity: number;
  notes: string | null;
  status: InquiryStatus;
  quoted_price: number | null;
  mockup_path: string | null;
  production_paths: string[] | null;
  canvas_json: unknown;
  created_at: string;
  updated_at: string;
  cleanup_requested_at: string | null;
};
