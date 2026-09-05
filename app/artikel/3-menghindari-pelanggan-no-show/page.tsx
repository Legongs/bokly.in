import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarCheck2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Strategi Ampuh Menghadapi Pelanggan 'No-Show' (Hit & Run) | bukly.id",
  description: "Pelanggan sering tidak datang padahal sudah booking? Terapkan sistem DP dan pengingat otomatis untuk mengatasinya.",
};

export default function Article3Page() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <Link href="/artikel" className="inline-flex items-center gap-2 text-stone-500 hover:text-teal-600 font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Artikel
        </Link>
        
        <article className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-700">Manajemen</span>
            <span className="text-xs font-medium text-stone-500">05 Jul 2025 · 5 menit baca</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-8 leading-tight">
            Strategi Ampuh Menghadapi Pelanggan 'No-Show' (Hit & Run)
          </h1>

          <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-orange">
            <p>
              Kejadian <em>no-show</em> (pelanggan sudah <em>booking</em> tapi tidak datang) adalah salah satu hal yang paling merugikan bisnis jasa. Selain kehilangan pendapatan, Anda juga kehilangan waktu berharga yang sebenarnya bisa diberikan kepada pelanggan lain.
            </p>
            
            <h2>1. Wajibkan Uang Muka (Down Payment)</h2>
            <p>
              Ini adalah filter terbaik. Pelanggan yang serius tidak akan keberatan membayar DP 20% - 50%. Jika mereka tidak datang, setidaknya waktu kerja Anda yang hilang terkompensasi. Sistem seperti <strong>bukly.id</strong> memungkinkan Anda mengaktifkan pengaturan wajib DP untuk layanan tertentu.
            </p>

            <h2>2. Terapkan Kebijakan Pembatalan (Cancellation Policy) yang Tegas</h2>
            <p>
              Beri tahu pelanggan sejak awal bahwa pembatalan hanya boleh dilakukan maksimal H-1. Jika dibatalkan mendadak, DP akan hangus. Tuliskan kebijakan ini dengan jelas di halaman reservasi Anda agar tidak ada kesalahpahaman.
            </p>

            <h2>3. Sistem Pengingat Otomatis</h2>
            <p>
              Seringkali pelanggan tidak berniat buruk, mereka hanya lupa. Mengirimkan pengingat <em>(reminder)</em> via WhatsApp sangat efektif menurunkan tingkat <em>no-show</em> secara drastis.
            </p>

            <div className="my-8 p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="flex items-start gap-4">
                <CalendarCheck2 className="w-8 h-8 text-orange-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-stone-900 text-lg mb-2">Amankan Jadwal Anda</h3>
                  <p className="text-stone-600 mb-4">Filter pelanggan iseng dengan fitur proteksi jadwal dan syarat <em>booking</em>.</p>
                  <Link href="/register" className="inline-flex items-center justify-center bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-700 transition-colors">
                    Daftar Tenant Sekarang
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-200">
            <h3 className="text-xl font-bold text-stone-900 mb-4">Baca Juga</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/artikel/1-cara-meningkatkan-pelanggan-salon" className="p-4 rounded-2xl border border-stone-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group">
                <span className="text-xs font-bold text-teal-600 mb-1 block">Bisnis</span>
                <h4 className="font-bold text-stone-800 group-hover:text-teal-700 leading-tight">5 Cara Meningkatkan Retensi Pelanggan Salon Kecantikan Anda</h4>
              </Link>
              <Link href="/artikel/2-pentingnya-sistem-booking-barbershop" className="p-4 rounded-2xl border border-stone-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group">
                <span className="text-xs font-bold text-teal-600 mb-1 block">Teknologi</span>
                <h4 className="font-bold text-stone-800 group-hover:text-teal-700 leading-tight">Mengapa Barbershop Anda Wajib Menggunakan Sistem Booking Online?</h4>
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
