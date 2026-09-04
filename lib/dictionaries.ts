export type BusinessSector = "beauty" | "space" | "auto" | "health";

export interface BusinessDictionary {
  serviceLabel: string;
  bookingLabel: string;
  emptyStateTitle: string;
  emptyStateDesc: string;
  selectServicePrompt: string;
  staffLabel: string;
  themeColor: "teal" | "rose" | "orange" | "violet" | "blue";
  iconName: "Scissors" | "Building" | "Car" | "Stethoscope" | "Store";
}

export function getSectorDictionary(sector: BusinessSector | null | undefined): BusinessDictionary {
  switch (sector) {
    case "beauty":
      return {
        serviceLabel: "Perawatan",
        bookingLabel: "Reservasi",
        emptyStateTitle: "Belum ada perawatan nih",
        emptyStateDesc: "Yuk, tambah perawatan sekarang biar pelanggan bisa mulai reservasi!",
        selectServicePrompt: "Pilih Perawatan Anda",
        staffLabel: "Kapster / Terapis",
        themeColor: "rose",
        iconName: "Scissors",
      };
    case "space":
      return {
        serviceLabel: "Paket Sewa",
        bookingLabel: "Sewa",
        emptyStateTitle: "Belum ada paket sewa",
        emptyStateDesc: "Tambahkan paket penyewaan agar pelanggan bisa mulai menyewa ruang.",
        selectServicePrompt: "Pilih Paket Durasi",
        staffLabel: "Ruangan",
        themeColor: "blue",
        iconName: "Building",
      };
    case "auto":
      return {
        serviceLabel: "Layanan Kendaraan",
        bookingLabel: "Booking",
        emptyStateTitle: "Belum ada paket layanan",
        emptyStateDesc: "Yuk tambah paket layanan kendaraan Anda.",
        selectServicePrompt: "Pilih Paket Layanan Kendaraan",
        staffLabel: "Tim / Teknisi",
        themeColor: "orange",
        iconName: "Car",
      };
    case "health":
      return {
        serviceLabel: "Tindakan",
        bookingLabel: "Buat Janji",
        emptyStateTitle: "Jadwal praktek belum diatur",
        emptyStateDesc: "Tambahkan tindakan untuk mulai menerima pasien.",
        selectServicePrompt: "Pilih Tindakan / Pemeriksaan",
        staffLabel: "Dokter / Perawat",
        themeColor: "teal",
        iconName: "Stethoscope",
      };
    default:
      return {
        serviceLabel: "Layanan",
        bookingLabel: "Booking",
        emptyStateTitle: "Daftar Layanan Kosong",
        emptyStateDesc: "Belum ada layanan yang kamu buat nih. Yuk, tambah sekarang!",
        selectServicePrompt: "Pilih Layanan",
        staffLabel: "Pegawai",
        themeColor: "teal",
        iconName: "Store",
      };
  }
}
