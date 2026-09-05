import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | bukly.id",
  description: "Syarat dan ketentuan penggunaan platform bukly.id untuk penyedia jasa (tenant) dan pelanggan.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-teal-600 font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
        
        <article className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-stone-100">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                Syarat & Ketentuan
              </h1>
              <p className="text-sm text-stone-500 mt-1">Pembaruan Terakhir: 1 September 2025</p>
            </div>
          </div>

          <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-teal">
            <p>
              Syarat dan Ketentuan ini ("Ketentuan") mengatur akses dan penggunaan Anda terhadap situs web, aplikasi, dan layanan bukly.id (selanjutnya disebut "Layanan"). Dengan mengakses Layanan kami, Anda menyetujui Ketentuan ini.
            </p>
            
            <h2>1. Akun Pengguna (Tenant)</h2>
            <p>
              Saat Anda membuat akun di bukly.id, Anda harus memberikan informasi yang akurat dan lengkap. Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi Anda dan untuk setiap aktivitas yang terjadi di bawah akun Anda.
            </p>

            <h2>2. Penggunaan Layanan</h2>
            <p>
              Anda setuju untuk menggunakan Layanan hanya untuk tujuan yang sah, yakni mengelola reservasi dan operasional bisnis UMKM jasa Anda. Anda dilarang menggunakan platform ini untuk kegiatan penipuan, prostitusi, atau tindakan melanggar hukum lainnya di Republik Indonesia.
            </p>

            <h2>3. Transaksi & Uang Muka (DP)</h2>
            <p>
              bukly.id hanya bertindak sebagai fasilitator platform perangkat lunak. 
            </p>
            <ul>
              <li>Kami tidak bertanggung jawab atas kualitas jasa yang diberikan oleh <em>Tenant</em> kepada pelanggan.</li>
              <li>Penyelesaian masalah terkait pembayaran, uang muka (DP), atau pembatalan <em>(refund)</em> adalah tanggung jawab penuh antara Pelanggan dan Pemilik Bisnis <em>(Tenant)</em>.</li>
            </ul>

            <h2>4. Langganan dan Tagihan</h2>
            <p>
              Untuk fitur berbayar (paket Pro atau Bisnis), tagihan dilakukan sesuai dengan periode yang Anda pilih (Bulanan atau Tahunan). Anda dapat membatalkan langganan kapan saja, namun tidak ada pengembalian dana <em>(refund)</em> secara proporsional untuk sisa masa aktif langganan.
            </p>

            <h2>5. Penghentian Akses</h2>
            <p>
              Kami berhak untuk menangguhkan atau menghentikan akses Anda ke Layanan kapan saja, tanpa pemberitahuan atau kewajiban, jika Anda melanggar Ketentuan ini.
            </p>

            <h2>6. Perubahan Ketentuan</h2>
            <p>
              Kami berhak merevisi Ketentuan ini kapan saja. Kami akan memberitahu Anda tentang perubahan material melalui email atau pengumuman di dasbor. Penggunaan lanjutan Layanan setelah revisi efektif merupakan persetujuan Anda terhadap Ketentuan yang direvisi.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
