export function adminPhone() {
  return normalizeWhatsAppPhone(
    process.env.NEXT_PUBLIC_ADMIN_PHONE || process.env.ADMIN_PHONE || "20123456789",
  );
}

export function normalizeWhatsAppPhone(raw?: string | null) {
  let digits = (raw || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `20${digits.slice(1)}`;
  return digits;
}

export function whatsappChatUrl(raw?: string | null) {
  const phone = normalizeWhatsAppPhone(raw) || adminPhone();
  if (!phone) return "";
  return `https://wa.me/${phone}`;
}

export function buildWhatsAppUrl(input: {
  referenceCode: string;
  productName: string;
  quantity: number;
}) {
  const text = `Hello, I just submitted an inquiry reference ${input.referenceCode} for ${input.productName}, Quantity: ${input.quantity}. Please review my custom design!`;
  return `https://wa.me/${adminPhone()}?text=${encodeURIComponent(text)}`;
}
