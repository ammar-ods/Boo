export function adminPhone() {
  return (
    process.env.NEXT_PUBLIC_ADMIN_PHONE ||
    process.env.ADMIN_PHONE ||
    "20123456789"
  ).replace(/[^\d]/g, "");
}

export function buildWhatsAppUrl(input: {
  referenceCode: string;
  productName: string;
  quantity: number;
}) {
  const text = `Hello, I just submitted an inquiry reference ${input.referenceCode} for ${input.productName}, Quantity: ${input.quantity}. Please review my custom design!`;
  return `https://wa.me/${adminPhone()}?text=${encodeURIComponent(text)}`;
}
