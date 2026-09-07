export type BusinessSubsector = 
  | "salon"
  | "barber"
  | "eyelash"
  | "nailart"
  | "spa_pijat"
  | "bengkel"
  | "detailing"
  | "studio_foto"
  | "lapangan_futsal"
  | "lapangan_padel"
  | "coworking"
  | "klinik"
  | "konsultasi"
  | "lainnya";

export interface BusinessDictionary {
  serviceLabel: string; 
  bookingLabel: string; 
  emptyStateTitle: string;
  emptyStateDesc: string;
  selectServicePrompt: string; 
  staffLabel: string | null;
  resourceLabel: string | null;
  themeColor: "teal" | "rose" | "orange" | "violet" | "blue" | "stone";
  heroTagline: string;
  extraFields?: string[];
}

export function getBusinessDictionary(subsector: string | undefined): BusinessDictionary {
  switch (subsector) {
    case "salon":
      return {
        serviceLabel: "Perawatan",
        bookingLabel: "Reservasi",
        emptyStateTitle: "Belum ada perawatan nih",
        emptyStateDesc: "Yuk, tambah perawatan sekarang biar pelanggan bisa mulai reservasi!",
        selectServicePrompt: "Mau Perawatan Apa?",
        staffLabel: "Stylist / Kapster",
        resourceLabel: null,
        themeColor: "rose",
        heroTagline: "Tampil menawan setiap saat",
      };
    case "barber":
      return {
        serviceLabel: "Cukur / Grooming",
        bookingLabel: "Booking",
        emptyStateTitle: "Belum ada layanan cukur",
        emptyStateDesc: "Tambah layanan cukur agar pelanggan bisa segera booking.",
        selectServicePrompt: "Pilih Layanan Cukur",
        staffLabel: "Barber",
        resourceLabel: null,
        themeColor: "stone",
        heroTagline: "Tampil rapi, percaya diri maksimal",
      };
    case "eyelash":
      return {
        serviceLabel: "Treatment",
        bookingLabel: "Reservasi",
        emptyStateTitle: "Belum ada treatment",
        emptyStateDesc: "Tambahkan treatment agar klien bisa memilih layanannya.",
        selectServicePrompt: "Pilih Treatment",
        staffLabel: "Eyelash Tech / Terapis",
        resourceLabel: null,
        themeColor: "rose",
        heroTagline: "Mata indah mempesona setiap hari",
      };
    case "nailart":
      return {
        serviceLabel: "Treatment",
        bookingLabel: "Reservasi",
        emptyStateTitle: "Belum ada treatment",
        emptyStateDesc: "Tambahkan treatment kuku agar klien bisa booking.",
        selectServicePrompt: "Pilih Treatment Kuku",
        staffLabel: "Nail Artist",
        resourceLabel: null,
        themeColor: "rose",
        heroTagline: "Kuku cantik, mood naik",
      };
    case "spa_pijat":
      return {
        serviceLabel: "Treatment",
        bookingLabel: "Reservasi",
        emptyStateTitle: "Belum ada paket spa/pijat",
        emptyStateDesc: "Tambah paket agar pelanggan bisa segera rileks.",
        selectServicePrompt: "Pilih Paket Treatment",
        staffLabel: "Terapis",
        resourceLabel: "Ruangan / Kasur",
        themeColor: "teal",
        heroTagline: "Relaksasi total untuk tubuh dan pikiran",
      };
    case "bengkel":
      return {
        serviceLabel: "Jenis Servis",
        bookingLabel: "Booking Servis",
        emptyStateTitle: "Belum ada daftar servis",
        emptyStateDesc: "Tambahkan jasa perbaikan yang Anda tawarkan ke pelanggan.",
        selectServicePrompt: "Pilih Jenis Servis",
        staffLabel: "Mekanik",
        resourceLabel: null,
        themeColor: "orange",
        heroTagline: "Kendaraan prima, perjalanan aman",
        extraFields: ["vehicle_brand", "complaint_notes"],
      };
    case "detailing":
      return {
        serviceLabel: "Paket Cuci / Detailing",
        bookingLabel: "Booking",
        emptyStateTitle: "Belum ada paket",
        emptyStateDesc: "Yuk tambah paket cuci atau detailing kendaraan Anda.",
        selectServicePrompt: "Pilih Paket Cuci / Detailing",
        staffLabel: "Detailer / Tim",
        resourceLabel: "Bay",
        themeColor: "blue",
        heroTagline: "Kendaraan mengkilap seperti baru",
        extraFields: ["vehicle_brand"],
      };
    case "studio_foto":
      return {
        serviceLabel: "Paket Foto",
        bookingLabel: "Booking",
        emptyStateTitle: "Belum ada paket sesi foto",
        emptyStateDesc: "Tambahkan paket foto atau sewa studio di sini.",
        selectServicePrompt: "Pilih Paket Sesi Foto",
        staffLabel: "Fotografer",
        resourceLabel: "Studio / Latar",
        themeColor: "violet",
        heroTagline: "Abadikan momen berharga dengan sempurna",
      };
    case "lapangan_futsal":
      return {
        serviceLabel: "Slot Sewa",
        bookingLabel: "Booking Lapangan",
        emptyStateTitle: "Belum ada slot sewa",
        emptyStateDesc: "Tambahkan lapangan agar bisa disewa pelanggan.",
        selectServicePrompt: "Pilih Durasi / Paket",
        staffLabel: null,
        resourceLabel: "Lapangan",
        themeColor: "teal",
        heroTagline: "Fasilitas terbaik untuk main bareng teman",
      };
    case "lapangan_padel":
      return {
        serviceLabel: "Slot Sewa",
        bookingLabel: "Booking Padel",
        emptyStateTitle: "Belum ada slot sewa",
        emptyStateDesc: "Tambahkan court agar bisa disewa.",
        selectServicePrompt: "Pilih Durasi / Paket",
        staffLabel: null,
        resourceLabel: "Padel Court",
        themeColor: "teal",
        heroTagline: "Bermain padel dengan fasilitas premium",
      };
    case "coworking":
      return {
        serviceLabel: "Paket Sewa",
        bookingLabel: "Booking Ruang",
        emptyStateTitle: "Belum ada paket sewa ruang",
        emptyStateDesc: "Tambahkan ruang meeting atau meja agar bisa dibooking.",
        selectServicePrompt: "Pilih Ruangan / Durasi",
        staffLabel: null,
        resourceLabel: "Ruang Meeting / Meja",
        themeColor: "blue",
        heroTagline: "Ruang kerja nyaman, produktivitas maksimal",
      };
    case "klinik":
      return {
        serviceLabel: "Treatment / Konsultasi",
        bookingLabel: "Buat Janji",
        emptyStateTitle: "Belum ada daftar layanan",
        emptyStateDesc: "Tambahkan daftar treatment agar pasien bisa membuat janji.",
        selectServicePrompt: "Pilih Layanan",
        staffLabel: "Dokter / Perawat",
        resourceLabel: "Ruang Periksa",
        themeColor: "teal",
        heroTagline: "Kesehatan Anda, prioritas utama kami",
      };
    case "konsultasi":
      return {
        serviceLabel: "Sesi Konsultasi",
        bookingLabel: "Buat Janji",
        emptyStateTitle: "Jadwal belum diatur",
        emptyStateDesc: "Tambahkan layanan konsultasi untuk mulai menerima janji temu.",
        selectServicePrompt: "Pilih Jenis Konsultasi",
        staffLabel: "Konsultan / Terapis",
        resourceLabel: null,
        themeColor: "blue",
        heroTagline: "Solusi tepat dari ahlinya",
      };
    case "lainnya":
    default:
      return {
        serviceLabel: "Layanan",
        bookingLabel: "Booking",
        emptyStateTitle: "Daftar Layanan Kosong",
        emptyStateDesc: "Belum ada layanan yang kamu buat nih. Yuk, tambah sekarang!",
        selectServicePrompt: "Pilih Layanan",
        staffLabel: "Staf",
        resourceLabel: null,
        themeColor: "stone",
        heroTagline: "Sistem booking terpercaya",
      };
  }
}
