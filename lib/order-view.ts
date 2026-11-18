import type { InquiryRecord } from "@/lib/inquiry-types";

export type OrderLineItem = {
  slug?: string;
  name: string;
  nameAr?: string;
  quantity: number;
  color?: string;
  priceEgp: number;
  image?: string;
  custom?: boolean;
  dimensions?: { length?: string; width?: string };
  viewMockups?: { id?: string; label?: string; url: string }[];
  uploads?: { name?: string; url: string }[];
};

export type OrderPayload = {
  items?: OrderLineItem[];
  fields?: Record<string, string>;
  views?: { id?: string; label?: string; url?: string }[];
  uploads?: { name?: string; url?: string }[];
  commerce?: {
    subtotal?: number;
    discount?: number;
    promoCode?: string;
    shippingCharged?: number;
    shippingFree?: boolean;
    expressCharged?: number;
    express?: boolean;
    total?: number;
  };
  payment?: { method?: string; transferPhone?: string; receiptUrl?: string };
  express?: boolean;
};

export function orderPayload(inquiry: InquiryRecord): OrderPayload {
  return (inquiry.canvas_json ?? {}) as OrderPayload;
}

export function orderLineItems(inquiry: InquiryRecord): OrderLineItem[] {
  const items = orderPayload(inquiry).items;
  if (items?.length) {
    return items.map((item) => ({
      ...item,
      name: item.name || inquiry.product_name,
      quantity: Math.max(1, Number(item.quantity) || 1),
      priceEgp: Number(item.priceEgp) || 0,
    }));
  }
  return [
    {
      slug: inquiry.product_slug,
      name: inquiry.product_name,
      quantity: inquiry.quantity || 1,
      color: inquiry.material || "",
      priceEgp: inquiry.quoted_price || 0,
      image: inquiry.mockup_path || undefined,
    },
  ];
}

export function orderCustomer(inquiry: InquiryRecord) {
  const fields = orderPayload(inquiry).fields ?? {};
  return {
    name: inquiry.customer_name,
    phone: inquiry.customer_phone,
    email: inquiry.customer_email || fields.email || "",
    address: fields.address || "",
    notes: fields.notes || "",
  };
}
