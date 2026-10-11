// WhatsApp Click-to-Chat URL Generator for CrystalClean
// STRICT COMPLIANCE: NEVER includes prices, currency, subtotals, or plaintext access codes.

export interface WhatsAppMessagePayload {
  reference: string;
  customer_name: string;
  company_name: string;
  delivery_city: string;
  notes?: string;
  items: Array<{
    product_name: string;
    variant?: string | null;
    pack_size?: string | null;
    quantity: number;
  }>;
}

export function generateWhatsAppLink(
  payload: WhatsAppMessagePayload,
  businessPhone: string = '919149953610'
): { url: string; formattedMessage: string } {
  // Strip any non-digit characters for standard wa.me format
  const sanitizedPhone = businessPhone.replace(/\D/g, '');

  let productLines = '';
  payload.items.forEach((item, index) => {
    const variantPart = item.variant ? ` — ${item.variant}` : '';
    const packPart = item.pack_size ? ` (${item.pack_size})` : '';
    productLines += `${index + 1}. ${item.product_name}${variantPart}${packPart} — Quantity: ${item.quantity} units\n`;
  });

  const notesPart = payload.notes ? `\nAdditional Notes: ${payload.notes.trim()}` : '';

  const message = [
    `Hello CrystalClean,`,
    ``,
    `I would like to inquire about these hotel amenities.`,
    ``,
    `Inquiry Reference: ${payload.reference}`,
    `Customer Verification: Verified Access Code`,
    ``,
    `Products requested:`,
    productLines.trim(),
    ``,
    `Hotel/Company: ${payload.company_name}`,
    `Contact Person: ${payload.customer_name}`,
    `Delivery City: ${payload.delivery_city}${notesPart}`,
    ``,
    `Please share your pricing, bulk discounts, product availability, and delivery details.`,
    ``,
    `Thank you.`
  ].join('\n');

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${sanitizedPhone}?text=${encodedMessage}`;

  return {
    url,
    formattedMessage: message
  };
}
