export type BusinessType = 
  | "salon"
  | "klinik"
  | "konsultasi"
  | "studio_foto"
  | "cuci_kendaraan"
  | "olahraga"
  | "servis"
  | "lainnya";

export interface BusinessDictionary {
  serviceLabel: string; // e.g. "Perawatan", "Fasilitas", "Layanan"
  bookingLabel: string; // e.g. "Reservasi", "Booking", "Sewa"
  emptyStateTitle: string;
  emptyStateDesc: string;
  selectServicePrompt: string; // e.g. "Mau Perawatan Apa?"
  staffLabel: string; // e.g. "Pegawai", "Terapis", "Instruktur"
  themeColor: "teal" | "rose" | "orange" | "violet" | "blue";
}

export function getBusinessDictionary(type: string | undefined): BusinessDictionary {
  switch (type) {
    case "salon":
      return {
        serviceLabel: "Perawatan",
        bookingLabel: "Reservasi",
        emptyStateTitle: "Belum ada perawatan nih",
        emptyStateDesc: "Yuk, tambah perawatan sekarang biar pelanggan bisa mulai reservasi!",
        selectServicePrompt: "Mau Perawatan Apa?",
        staffLabel: "Kapster / Stylist",
        themeColor: "rose",
      };
    case "klinik":
      return {
        serviceLabel: "Treatment",
        bookingLabel: "Reservasi",
        emptyStateTitle: "Belum ada treatment terdaftar",
        emptyStateDesc: "Tambahkan daftar treatment klinik Anda agar pasien bisa membuat janji.",
        selectServicePrompt: "Pilih Treatment Anda",
        staffLabel: "Terapis / Dokter",
        themeColor: "teal",
      };
    case "konsultasi":
      return {
        serviceLabel: "Layanan Konsultasi",
        bookingLabel: "Buat Janji",
        emptyStateTitle: "Jadwal praktek belum diatur",
        emptyStateDesc: "Tambahkan layanan konsultasi untuk mulai menerima janji temu.",
        selectServicePrompt: "Pilih Jenis Konsultasi",
        staffLabel: "Konsultan / Pakar",
        themeColor: "blue",
      };
    case "studio_foto":
      return {
        serviceLabel: "Sesi Foto",
        bookingLabel: "Booking",
        emptyStateTitle: "Belum ada paket sesi foto",
        emptyStateDesc: "Tambahkan durasi sewa studio atau sesi foto Anda di sini.",
        selectServicePrompt: "Pilih Paket Sesi Foto",
        staffLabel: "Fotografer",
        themeColor: "violet",
      };
    case "cuci_kendaraan":
      return {
        serviceLabel: "Paket Cuci",
        bookingLabel: "Booking",
        emptyStateTitle: "Belum ada paket cuci",
        emptyStateDesc: "Yuk tambah paket cuci atau detailing kendaraan Anda.",
        selectServicePrompt: "Pilih Paket Cuci / Detailing",
        staffLabel: "Tim Cuci / Detailer",
        themeColor: "orange",
      };
    case "olahraga":
      return {
        serviceLabel: "Fasilitas",
        bookingLabel: "Sewa",
        emptyStateTitle: "Belum ada fasilitas untuk disewa",
        emptyStateDesc: "Tambahkan lapangan atau studio yang bisa disewa oleh pengunjung.",
        selectServicePrompt: "Pilih Lapangan / Fasilitas",
        staffLabel: "Instruktur / Penjaga",
        themeColor: "orange",
      };
    case "servis":
      return {
        serviceLabel: "Jenis Servis",
        bookingLabel: "Booking",
        emptyStateTitle: "Belum ada daftar servis",
        emptyStateDesc: "Tambahkan jasa perbaikan yang Anda tawarkan ke pelanggan.",
        selectServicePrompt: "Pilih Jenis Perbaikan",
        staffLabel: "Teknisi / Mekanik",
        themeColor: "orange",
      };
    case "lainnya":
    default:
      return {
        serviceLabel: "Layanan",
        bookingLabel: "Booking",
        emptyStateTitle: "Daftar Layanan Kosong",
        emptyStateDesc: "Belum ada layanan yang kamu buat nih. Yuk, tambah sekarang!",
        selectServicePrompt: "Pilih Layanan",
        staffLabel: "Pegawai",
        themeColor: "teal",
      };
  }
}
