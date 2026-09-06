export function getWhatsAppUrl(whatsappNumber: string): string {
  if (!whatsappNumber) return "#";
  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}`;
}
