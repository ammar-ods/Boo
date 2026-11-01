import { z } from "zod";

export const inquirySchema = z.object({
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  customerName: z.string().min(2, "Please tell us your name"),
  customerEmail: z
    .string()
    .email("Enter a valid email")
    .or(z.literal(""))
    .optional(),
  customerPhone: z.string().min(8, "WhatsApp number helps us reply faster"),
  material: z.string().min(1, "Pick a material"),
  quantity: z.coerce.number().int().min(1).max(500),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const inquiryStatusSchema = z.enum([
  "pending",
  "quoted",
  "fulfilled",
  "cancelled",
]);

export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;
