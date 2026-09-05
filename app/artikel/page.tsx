import Link from "next/link";
import { Calendar, ArrowRight, CalendarCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

import { Logo } from "@/components/ui/logo";
export const metadata: Metadata = {
  title: "Artikel & Tips Bisnis Jasa UMKM",
  description: "Kumpulan artikel, tips, dan strategi untuk meningkatkan pelanggan dan mengelola bisnis Barbershop, Salon, Klinik, dan Bengkel Anda.",
  openGraph: {
    title: "Artikel & Tips Bisnis Jasa UMKM | bukly.in",
    description: "Kumpulan artikel, tips, dan strategi untuk meningkatkan pelanggan dan mengelola bisnis Jasa.",
  },
};

const articles = [
  {
    slug: "1-cara-meningkatkan-pelanggan-salon",
    title: "5 Cara Jitu Meningkatkan Jumlah Pelanggan Salon Anda di Era Digital",
    excerpt: "Pelajari strategi pemasaran digital yang terbukti ampuh menarik pelanggan baru ke salon kecantikan Anda tanpa biaya iklan yang mahal.",
    category: "Tips Bisnis",
    date: "14 Jul 2025",
    readTime: "4 menit baca",
    imageColor: "bg-rose-100",
    textColor: "text-rose-700",
  },
  {
    slug: "2-pentingnya-sistem-booking-barbershop",
    title: "Mengapa Barbershop Anda Wajib Menggunakan Sistem Booking Online?",
    excerpt: "Tinggalkan buku catatan manual. Lihat bagaimana sistem booking otomatis dapat mengurangi antrean dan meningkatkan omzet barbershop.",
    category: "Teknologi",
    date: "10 Jul 2025",
    readTime: "3 menit baca",
    imageColor: "bg-teal-100",
    textColor: "text-teal-700",
  },
  {
    slug: "3-menghindari-pelanggan-no-show",
    title: "Strategi Ampuh Menghadapi Pelanggan 'No-Show' (Hit & Run)",
    excerpt: "Pelanggan sering tidak datang padahal sudah booking? Terapkan sistem DP dan pengingat otomatis untuk mengatasinya.",
    category: "Manajemen",
    date: "05 Jul 2025",
    readTime: "5 menit baca",
    imageColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
];

export default function ArticleIndexPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans">
      {/* Navigation */}
      <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between" aria-label="Main Navigation">
          <Link href="/" className="flex items-center gap-2" aria-label="Beranda bukly.in">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-stone-900">
              <Logo />
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-600">
            <li><Link href="/#fitur" className="hover:text-teal-600 transition-colors">Fitur</Link></li>
            <li><Link href="/#cara-kerja" className="hover:text-teal-600 transition-colors">Cara Kerja</Link></li>
            <li><Link href="/#faq" className="hover:text-teal-600 transition-colors">FAQ</Link></li>
            <li><Link href="/artikel" className="text-teal-600 transition-colors">Artikel</Link></li>
          </ul>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                className="bg-transparent text-stone-700 hover:bg-stone-200 hover:text-stone-900 font-bold shadow-none transition-all duration-200"
                size="sm"
              >
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-sm transition-all duration-200 hidden sm:flex">
                Coba Gratis
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 sm:py-20 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold mb-6">
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>Blog & Insights</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-[1.15]">
            Jelajahi Tips <span className="text-teal-700">Bisnis Jasa</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-stone-600 leading-relaxed">
            Kumpulan panduan, strategi, dan cerita sukses untuk membantu UMKM Anda berkembang pesat di era digital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link href={`/artikel/${article.slug}`} key={article.slug} className="group flex flex-col bg-white rounded-3xl border border-stone-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              {/* Cover Image Placeholder */}
              <div className={`w-full h-48 ${article.imageColor} flex items-center justify-center p-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 -translate-y-1/2"></div>
                <CalendarCheck2 className={`w-16 h-16 ${article.textColor} opacity-30 relative z-10`} />
              </div>
              
              <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${article.imageColor} ${article.textColor}`}>
                    {article.category}
                  </span>
                  <span className="text-xs font-medium text-stone-500">{article.readTime}</span>
                </div>
                
                <h2 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h2>
                
                <p className="text-sm text-stone-600 line-clamp-3 mb-6 flex-1 leading-relaxed">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                  <span className="text-xs font-semibold text-stone-500">{article.date}</span>
                  <span className="text-teal-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Baca <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-10 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span className="font-extrabold text-stone-900">bukly.in</span>
          </div>
          <p className="text-xs text-stone-500 font-medium text-center md:text-right">
            © {new Date().getFullYear()} Dibuat untuk memajukan UMKM Jasa Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}
