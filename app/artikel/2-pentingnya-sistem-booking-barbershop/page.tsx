import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarCheck2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Mengapa Barbershop Anda Wajib Menggunakan Sistem Booking Online? | bukly.id",
  description: "Tinggalkan buku catatan manual. Lihat bagaimana sistem booking otomatis dapat mengurangi antrean dan meningkatkan omzet barbershop.",
};

export default function Article2Page() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <Link href="/artikel" className="inline-flex items-center gap-2 text-stone-500 hover:text-teal-600 font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Artikel
        </Link>
        
        <article className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-700">Teknologi</span>
            <span className="text-xs font-medium text-stone-500">10 Jul 2025 · 3 menit baca</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-8 leading-tight">
            Mengapa Barbershop Anda Wajib Menggunakan Sistem Booking Online?
          </h1>

          <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-teal">
            <p>
              Hari Sabtu adalah hari yang paling ditunggu-tunggu oleh pemilik <em>barbershop</em>. Namun, tanpa sistem yang baik, hari yang seharusnya mendatangkan cuan justru bisa menjadi sumber stres karena antrean yang membludak.
            </p>
            
            <h2>1. Mengurangi Antrean Fisik yang Membuat Jenuh</h2>
            <p>
              Tidak ada pelanggan yang suka menunggu terlalu lama, apalagi saat <em>weekend</em>. Dengan sistem <em>booking</em>, pelanggan hanya perlu datang 5 menit sebelum jadwal. Ruang tunggu yang lega akan meningkatkan kenyamanan pelanggan lainnya.
            </p>

            <h2>2. Meminimalisir Kesalahan Catat</h2>
            <p>
              Mencatat jadwal menggunakan buku tulis atau papan tulis sangat rentan terhadap kesalahan (*human error*). Bagaimana jika ada dua pelanggan yang dijadwalkan pada jam yang sama secara tidak sengaja? Sistem otomatis seperti <strong>bukly.id</strong> mencegah terjadinya bentrok jadwal secara presisi.
            </p>

            <h2>3. Meningkatkan Profesionalisme</h2>
            <p>
              Barbershop yang menyediakan tautan reservasi otomatis (misalnya <code>bukly.id/barber-keren</code>) akan terlihat jauh lebih modern dan profesional dibandingkan barbershop yang mengharuskan pelanggan mengirim pesan WhatsApp panjang hanya untuk bertanya <em>"Jam 3 kosong bang?"</em>.
            </p>

            <div className="my-8 p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="flex items-start gap-4">
                <CalendarCheck2 className="w-8 h-8 text-teal-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-stone-900 text-lg mb-2">Tinggalkan Cara Lama</h3>
                  <p className="text-stone-600 mb-4">Mulai kelola jadwal barbershop-mu secara otomatis tanpa ribet.</p>
                  <Link href="/register" className="inline-flex items-center justify-center bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-teal-700 transition-colors">
                    Coba bukly.id Gratis
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
              <Link href="/artikel/3-menghindari-pelanggan-no-show" className="p-4 rounded-2xl border border-stone-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group">
                <span className="text-xs font-bold text-orange-600 mb-1 block">Manajemen</span>
                <h4 className="font-bold text-stone-800 group-hover:text-teal-700 leading-tight">Strategi Ampuh Menghadapi Pelanggan 'No-Show' (Hit & Run)</h4>
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
