// lib/template-matcher.ts
import { BusinessSector } from "./dictionaries";

export type InferredTemplate = BusinessSector | "barber" | "default";

/**
 * Menganalisis business_type (teks bebas dari user saat memilih "Lainnya")
 * dan mencoba mencocokkannya dengan template terdekat berdasarkan regex.
 */
export function inferTemplateFromType(businessType: string | null | undefined): InferredTemplate {
  if (!businessType) return "default";
  
  const typeStr = businessType.toLowerCase();

  // Keyword untuk Barber
  const barberRegex = /(barber|cukur|pangkas|potong rambut pria|gentleman|pomade)/i;
  if (barberRegex.test(typeStr)) return "barber";

  // Keyword untuk Beauty
  const beautyRegex = /(salon|spa|kecantikan|pijat|nail|lashes|makeup|alis|hair|eyelash|beauty)/i;
  if (beautyRegex.test(typeStr)) return "beauty";

  // Keyword untuk Health
  const healthRegex = /(klinik|gigi|medis|hewan|vet|dokter|terapi|psikolog|fisioterapi|health|care)/i;
  if (healthRegex.test(typeStr)) return "health";

  // Keyword untuk Space
  const spaceRegex = /(studio|lapangan|sewa|gedung|ruang|aula|meeting|kos|kost|apartemen|lapang)/i;
  if (spaceRegex.test(typeStr)) return "space";

  // Keyword untuk Auto
  const autoRegex = /(bengkel|motor|mobil|cuci|wash|detailing|servis|service|ganti oli)/i;
  if (autoRegex.test(typeStr)) return "auto";

  return "default";
}
