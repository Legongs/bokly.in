import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | bukly.id",
  description: "Kebijakan Privasi terkait pengumpulan, penggunaan, dan perlindungan data di platform bukly.id.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-teal-600 font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
        
        <article className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-stone-100">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                Kebijakan Privasi
              </h1>
              <p className="text-sm text-stone-500 mt-1">Pembaruan Terakhir: 1 September 2025</p>
            </div>
          </div>

          <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-teal">
            <p>
              Selamat datang di bukly.id. Kami sangat menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan platform kami.
            </p>
            
            <h2>1. Informasi yang Kami Kumpulkan</h2>
            <p>
              Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat Anda mendaftar atau menggunakan layanan kami, termasuk namun tidak terbatas pada: nama lengkap, alamat email, nomor telepon (WhatsApp), nama bisnis, dan jadwal reservasi.
            </p>

            <h2>2. Penggunaan Informasi</h2>
            <p>
              Informasi yang dikumpulkan digunakan untuk:
            </p>
            <ul>
              <li>Menyediakan, memelihara, dan meningkatkan layanan kami.</li>
              <li>Memproses transaksi pembayaran Anda (termasuk verifikasi DP via Midtrans).</li>
              <li>Mengirimkan notifikasi dan pengingat reservasi kepada pelanggan Anda melalui WhatsApp.</li>
              <li>Merespons komentar, pertanyaan, dan permintaan dukungan pelanggan.</li>
            </ul>

            <h2>3. Perlindungan Data</h2>
            <p>
              Kami menerapkan langkah-langkah keamanan teknis yang wajar secara komersial untuk melindungi informasi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah. Data Anda dienkripsi dan disimpan di infrastruktur <em>cloud</em> terpercaya (Supabase).
            </p>

            <h2>4. Penyebaran Pihak Ketiga</h2>
            <p>
              Kami tidak akan menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya membagikan informasi dengan layanan pihak ketiga yang membantu kami beroperasi, seperti <em>payment gateway</em> (Midtrans) untuk keperluan verifikasi pembayaran semata.
            </p>

            <h2>5. Hak Pengguna</h2>
            <p>
              Anda memiliki hak untuk meminta akses, koreksi, atau penghapusan data pribadi Anda kapan saja. Silakan hubungi kami melalui alamat email resmi kami untuk permohonan ini.
            </p>

            <div className="mt-12 p-6 bg-stone-50 rounded-2xl text-center border border-stone-100">
              <p className="text-stone-600 mb-2">Punya pertanyaan seputar kebijakan ini?</p>
              <a href="mailto:hello@bukly.id" className="text-teal-600 font-bold hover:underline">
                Hubungi Kami di hello@bukly.id
              </a>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
