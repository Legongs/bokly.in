import Link from "next/link";
import { Calendar, ArrowLeft, Clock, User, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "5 Cara Jitu Meningkatkan Jumlah Pelanggan Salon",
  description: "Pelajari strategi pemasaran digital yang terbukti ampuh menarik pelanggan baru ke salon kecantikan Anda tanpa biaya iklan yang mahal.",
  openGraph: {
    title: "5 Cara Jitu Meningkatkan Jumlah Pelanggan Salon",
    description: "Pelajari strategi pemasaran digital yang terbukti ampuh menarik pelanggan baru ke salon kecantikan Anda.",
    type: "article",
    publishedTime: "2025-07-14T08:00:00Z",
    authors: ["Tim maubooking.in"],
  },
};

export default function ArticleDetailPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "5 Cara Jitu Meningkatkan Jumlah Pelanggan Salon Anda di Era Digital",
    "image": [
      "https://maubooking.in/og-image.jpg"
    ],
    "datePublished": "2025-07-14T08:00:00+08:00",
    "dateModified": "2025-07-14T08:00:00+08:00",
    "author": [{
        "@type": "Organization",
        "name": "maubooking.in",
        "url": "https://maubooking.in"
      }]
  };

  return (
    <div className="min-h-screen bg-white text-stone-800 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between" aria-label="Main Navigation">
          <Link href="/" className="flex items-center gap-2" aria-label="Beranda maubooking.in">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-stone-900 hidden sm:block">
              maubooking<span className="text-teal-600">.in</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/artikel">
              <Button variant="ghost" className="text-stone-600 hover:text-stone-900 font-bold" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Artikel
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Article Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <article className="prose prose-stone prose-teal md:prose-lg max-w-none">
          <div className="mb-10 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-4 mb-6 text-sm font-medium text-stone-500">
              <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                Tips Bisnis
              </span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 4 mnt baca</span>
              <span className="flex items-center gap-1.5 hidden sm:flex"><User className="w-4 h-4" /> Tim Redaksi</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 leading-tight mb-6 tracking-tight">
              5 Cara Jitu Meningkatkan Jumlah Pelanggan Salon Anda di Era Digital
            </h1>
            
            <p className="text-lg sm:text-xl text-stone-600 leading-relaxed font-medium">
              Persaingan bisnis salon saat ini tidak hanya terjadi di jalanan, tapi juga di layar HP pelanggan. Jika salon Anda sulit mendapat pelanggan baru, mungkin Anda melewatkan strategi digital ini.
            </p>
          </div>

          <div className="w-full h-64 sm:h-96 bg-stone-100 rounded-3xl mb-12 flex items-center justify-center border border-stone-200">
            <span className="text-stone-400 font-medium">[Ilustrasi Artikel]</span>
          </div>

          <p>
            Memiliki penata rambut terbaik atau produk paling premium tidak akan berarti jika tidak ada pelanggan yang tahu. Di era di mana semua orang mencari rekomendasi di Instagram dan TikTok, salon Anda harus hadir dan mudah dijangkau. Berikut adalah lima cara teruji untuk mendatangkan lebih banyak pelanggan ke salon Anda:
          </p>

          <h2>1. Optimalkan Google Profil Bisnis (Google Maps)</h2>
          <p>
            Ketika seseorang butuh potong rambut atau perawatan, hal pertama yang mereka lakukan adalah mencari "salon terdekat" di Google Maps. Jika profil bisnis Anda tidak muncul di sana, Anda telah kehilangan puluhan pelanggan potensial setiap harinya.
          </p>
          <ul>
            <li>Klaim bisnis Anda di Google My Business.</li>
            <li>Pastikan titik lokasi akurat dan jam operasional tertulis dengan benar.</li>
            <li>Unggah foto-foto hasil potongan rambut, interior salon yang bersih, dan daftar harga.</li>
          </ul>

          <h2>2. Gunakan Sistem Booking Online (Reservasi Digital)</h2>
          <p>
            Pelanggan sangat benci menunggu di ruang tunggu yang penuh, atau harus menelepon hanya untuk bertanya "jam berapa yang kosong?". Dengan menggunakan <strong>sistem reservasi online</strong> seperti <a href="/">maubooking.in</a>, pelanggan bisa melihat sendiri jam berapa salon Anda kosong dan memesan jadwal langsung dari HP mereka 24 jam penuh.
          </p>
          <blockquote>
            "Kemudahan memesan jadwal adalah salah satu alasan terbesar pelanggan generasi Z dan Milenial memilih sebuah salon."
          </blockquote>

          <h2>3. Buat Portofolio Visual di Instagram & TikTok</h2>
          <p>
            Salon adalah bisnis visual. Orang ingin melihat bukti sebelum mereka mempercayakan rambut atau wajah mereka kepada Anda. Jangan hanya mengunggah foto brosur promosi; unggah proses transformasi (<em>before-after</em>).
          </p>
          <p>
            Tips tambahan: Jangan lupa taruh link <em>booking online</em> Anda langsung di Bio Instagram agar pengunjung profil bisa langsung membuat janji temu saat mereka sedang terpukau dengan hasil kerja Anda.
          </p>

          <h2>4. Kumpulkan Review dan Testimoni</h2>
          <p>
            Bintang 5 di Google Review sangat krusial. Setelah pelanggan selesai perawatan, mintalah mereka dengan sopan untuk meninggalkan ulasan di Google Maps Anda. Anda bahkan bisa memberikan diskon kecil 5% untuk kunjungan berikutnya sebagai tanda terima kasih atas ulasan mereka.
          </p>

          <h2>5. Terapkan Sistem Pengingat (Reminder) Otomatis</h2>
          <p>
            Mendapatkan pelanggan baru itu penting, tapi memastikan pelanggan yang sudah pesan <strong>benar-benar datang</strong> jauh lebih penting. Banyak salon merugi karena masalah <em>No-Show</em> (pelanggan pesan tapi lupa datang).
          </p>
          <p>
            Gunakan sistem yang dapat mengirim pesan WhatsApp H-1 secara otomatis kepada pelanggan untuk mengingatkan jadwal mereka. Ini terbukti menurunkan tingkat ketidakhadiran hingga 80%.
          </p>

          <hr className="my-10 border-stone-200" />

          <div className="bg-teal-50 border border-teal-100 rounded-3xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-teal-900 m-0 mb-2">Siap mendigitalisasi salon Anda?</h3>
              <p className="text-teal-700 m-0 text-sm">Gunakan maubooking.in gratis dan buat halaman booking Anda sendiri dalam 1 menit.</p>
            </div>
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl whitespace-nowrap w-full sm:w-auto">
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-stone-50 border-t border-stone-200 py-10 px-4 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span className="font-extrabold text-stone-900">maubooking.in</span>
          </div>
          <p className="text-xs text-stone-500 font-medium text-center md:text-right">
            © {new Date().getFullYear()} Dibuat untuk memajukan UMKM Jasa Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}
