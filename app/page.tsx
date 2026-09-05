import Link from "next/link";
import type { Metadata } from "next";
import {
  Calendar,
  Scissors,
  ArrowRight,
  Store,
  CheckCircle2,
  Clock,
  Car,
  Stethoscope,
  PenTool,
  MessageCircle,
  Zap,
  Star,
  Quote,
  Bell,
  Shield,
  Users,
  TrendingUp,
  ChevronRight,
  CalendarCheck2,
  Smile,
  BarChart2,
  Camera,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ScrollObserver } from "@/components/ui/scroll-observer";

export const metadata: Metadata = {
  title: "bukly.id | Bikin Web Booking Usahamu dalam 1 Menit — Gratis",
  description:
    "Capek balas chat booking satu-satu? bukly.id bikin halaman reservasi online otomatis buat Barbershop, Salon, Klinik, Bengkel & UMKM jasa lainnya. Pelanggan atur jadwal sendiri, kamu fokus kerja.",
  keywords: [
    "aplikasi booking online gratis",
    "sistem reservasi barbershop",
    "booking salon online",
    "jadwal online UMKM",
    "web booking otomatis",
    "aplikasi antrean online",
    "reservasi klinik online",
    "bukly.id",
  ],
  openGraph: {
    title: "bukly.id — Web Booking Otomatis untuk UMKM Jasa",
    description:
      "Gak perlu balas chat booking lagi. Buat halaman reservasi online usahamu dalam 1 menit, gratis. Pelanggan pilih jadwal sendiri, notif langsung ke WA-mu.",
    url: "https://bukly.id",
    siteName: "bukly.id",
    locale: "id_ID",
    type: "website",
  },
};

// ─── Structured Data (JSON-LD) untuk SEO, AIO & GIO ───────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "bukly.id",
      url: "https://bukly.id",
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IDR",
        availability: "https://schema.org/InStock",
      },
      description:
        "Aplikasi reservasi online gratis untuk Barbershop, Salon, Klinik, Bengkel, dan UMKM Jasa Indonesia. Buat halaman booking dalam 1 menit tanpa coding.",
      featureList: [
        "Halaman booking unik per usaha",
        "Notifikasi otomatis ke WhatsApp",
        "Dashboard manajemen jadwal",
        "Anti-bentrok jadwal otomatis",
        "Manajemen staf dan layanan",
      ],
    },
    {
      "@type": "WebSite",
      name: "bukly.id",
      url: "https://bukly.id",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://bukly.id/artikel?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "bukly.id",
      url: "https://bukly.id",
      description:
        "Platform reservasi online untuk UMKM jasa di Indonesia. Membantu barbershop, salon, klinik, dan usaha jasa lain mengelola jadwal pelanggan secara otomatis.",
      areaServed: "ID",
      serviceType: "Online Booking System",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Apakah bukly.id gratis?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ya, fitur dasar bukly.id 100% gratis. Kamu sudah bisa bikin halaman booking, atur layanan dan jadwal, serta terima reservasi pelanggan tanpa biaya langganan bulanan.",
          },
        },
        {
          "@type": "Question",
          name: "Apakah pelanggan perlu install aplikasi untuk booking?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Tidak perlu. Pelanggan cukup buka link unik usahamu (contoh: bukly.id/salon-siska) langsung di browser HP mereka. Tidak ada aplikasi yang perlu diunduh.",
          },
        },
        {
          "@type": "Question",
          name: "Usaha apa saja yang cocok pakai bukly.id?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Barbershop, Salon Kecantikan, Nail Art, Bengkel, Klinik Dokter, Studio Foto, Jasa Laundry, dan semua usaha jasa yang butuh manajemen jadwal antrean.",
          },
        },
        {
          "@type": "Question",
          name: "Berapa lama waktu setup bukly.id?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Kurang dari 5 menit. Daftar akun, isi nama usahamu, jam operasional, dan daftar layanan — halaman booking langsung aktif dan bisa disebarkan ke pelanggan.",
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-stone-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── INLINE CSS: Scroll Animations ──────────────────────────────────── */}
      <style>{`
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes notification-pop {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .anim-float-up { animation: float-up 0.7s ease-out both; }
        .anim-float-up-delay-1 { animation: float-up 0.7s 0.15s ease-out both; }
        .anim-float-up-delay-2 { animation: float-up 0.7s 0.3s ease-out both; }
        .anim-float-up-delay-3 { animation: float-up 0.7s 0.45s ease-out both; }
        .anim-notif-1 { animation: notification-pop 0.5s 0.8s ease-out both; }
        .anim-notif-2 { animation: notification-pop 0.5s 1.3s ease-out both; }
        .pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }

        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-left {
          opacity: 0;
          transform: translateX(-30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .reveal-left.visible { opacity: 1; transform: translateX(0); }
        .reveal-right {
          opacity: 0;
          transform: translateX(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .reveal-right.visible { opacity: 1; transform: translateX(0); }
      `}</style>

      {/* ─── Scroll-reveal Script ────────────────────────────────────────── */}
      <ScrollObserver />

      {/* ─── NAVIGATION ───────────────────────────────────────────────────── */}
      <header className="border-b border-stone-200/80 bg-[#FAFAF7]/90 backdrop-blur-md sticky top-0 z-50">
        <nav
          className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between"
          aria-label="Navigasi Utama bukly.id"
        >
          <Link href="/" className="flex items-center gap-2" aria-label="Beranda bukly.id">
            <Logo className="text-2xl" />
          </Link>

          <ul className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-500">
            <li><Link href="#storefront" className="hover:text-indigo-600 transition-colors duration-200">Aplikasi Booking</Link></li>
            <li><Link href="#demo" className="hover:text-indigo-600 transition-colors duration-200">Demo</Link></li>
            <li><Link href="#cara-kerja" className="hover:text-indigo-600 transition-colors duration-200">Cara Kerja</Link></li>
            <li><Link href="#fitur" className="hover:text-indigo-600 transition-colors duration-200">Fitur</Link></li>
            <li><Link href="#testimoni" className="hover:text-indigo-600 transition-colors duration-200">Cerita Pengguna</Link></li>
            <li><Link href="/artikel" className="hover:text-indigo-600 transition-colors duration-200">Artikel</Link></li>
          </ul>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-semibold transition-all duration-200" aria-label="Masuk ke Dashboard bukly.id">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all duration-200" aria-label="Daftar gratis bukly.id">
                Coba Gratis
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 w-full">
        {/* ─── HERO: Live Storefront Preview ──────────────────────────────── */}
        <section
          id="storefront"
          className="max-w-6xl mx-auto px-4 pt-16 pb-12 sm:pt-24 sm:pb-20 scroll-mt-16"
          aria-labelledby="hero-heading"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-12 items-center">
            {/* Kolom Kiri — Copy */}
            <div className="flex flex-col items-start">
              <div className="anim-float-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 pulse-dot" />
                Udah dipakai 500+ UMKM Jasa Indonesia
              </div>

              <h1
                id="hero-heading"
                className="anim-float-up-delay-1 text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-[1.12]"
              >
                Begini tampilan{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-indigo-700">halaman booking</span>
                  <span className="absolute -bottom-1 left-0 w-full h-3 bg-indigo-100 -z-0 rounded" aria-hidden="true" />
                </span>{" "}
                usahamu di mata pelanggan.
              </h1>

              <p className="anim-float-up-delay-2 mt-5 text-base sm:text-lg text-stone-500 max-w-md leading-relaxed">
                Pelanggan buka link-mu, pilih layanan, pilih jam — langsung terkonfirmasi. Kamu terima notif di WA. Sesimpel itu.
              </p>

              <ul className="anim-float-up-delay-2 mt-6 space-y-2.5 text-sm text-stone-600">
                {[
                  "Aktif dalam 5 menit, tanpa perlu coding",
                  "Gratis — tidak ada biaya tersembunyi",
                  "Link unik usahamu: bukly.id/nama-usahamu",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="anim-float-up-delay-3 mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button id="cta-hero-daftar" size="lg" className="w-full sm:w-auto bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/15 hover:shadow-lg hover:shadow-indigo-600/25 hover:-translate-y-0.5 transition-all duration-200">
                    Bikin Halaman Booking Sekarang
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/demo-salon" className="w-full sm:w-auto">
                  <Button id="cta-hero-demo" size="lg" variant="outline" className="w-full sm:w-auto border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold transition-all duration-200">
                    Lihat Contoh Halaman
                  </Button>
                </Link>
              </div>
            </div>

            {/* Kolom Kanan — Storefront Mockup */}
            <div className="relative w-full max-w-lg mx-auto lg:mx-0" aria-hidden="true">
              <div className="absolute -inset-6 bg-gradient-to-br from-indigo-50 via-stone-50 to-orange-50 rounded-[40px] -z-10" />

              {/* Browser chrome */}
              <div className="bg-white rounded-2xl shadow-2xl shadow-stone-300/40 border border-stone-200 overflow-hidden">
                <div className="bg-stone-100 px-4 py-3 flex items-center gap-2 border-b border-stone-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-3 bg-white rounded-md px-3 py-1 text-xs text-stone-400 font-mono border border-stone-200 flex items-center gap-1.5">
                    <span className="text-indigo-600">🔒</span>
                    bukly.id/salon-keren
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-b from-stone-50 to-white">
                  {/* Toko header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">S</div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm leading-tight">Salon Keren By Aurel</h3>
                      <p className="text-xs text-stone-400 mt-0.5">✨ Buka sekarang · Pulogadung, Jakarta</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      4.9
                    </div>
                  </div>

                  {/* Pilih Layanan */}
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2.5">Pilih Layanan</p>
                  <div className="space-y-2 mb-5">
                    {[
                      { name: "Creambath + Blowdry", price: "Rp85.000", duration: "60 min", selected: true },
                      { name: "Keriting Spiral", price: "Rp200.000", duration: "90 min", selected: false },
                      { name: "Nail Art Fullset", price: "Rp120.000", duration: "75 min", selected: false },
                    ].map((svc) => (
                      <div key={svc.name} className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${svc.selected ? "border-indigo-500 bg-indigo-50" : "border-stone-200 bg-white"}`}>
                        <div>
                          <p className={`font-bold ${svc.selected ? "text-indigo-800" : "text-stone-700"}`}>{svc.name}</p>
                          <p className={`mt-0.5 ${svc.selected ? "text-indigo-600" : "text-stone-400"}`}>{svc.duration}</p>
                        </div>
                        <span className={`font-bold ${svc.selected ? "text-indigo-700" : "text-stone-600"}`}>{svc.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Time slots */}
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2.5">Pilih Jam — Selasa, 5 Sep</p>
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {[
                      { time: "09:00", ok: false },
                      { time: "10:00", ok: true, active: true },
                      { time: "11:00", ok: false },
                      { time: "13:00", ok: true },
                    ].map((slot) => (
                      <div key={slot.time} className={`text-center py-2 rounded-lg text-xs font-bold border ${!slot.ok ? "bg-stone-100 border-stone-200 text-stone-400 line-through" : (slot as any).active ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-stone-200 text-stone-700"}`}>
                        {slot.time}
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-sm shadow-indigo-600/20 cursor-default">
                    Amankan Slot Ini →
                  </button>
                </div>
              </div>

              {/* Floating: Booking masuk */}
              <div className="anim-notif-1 absolute -left-6 top-20 bg-white rounded-2xl shadow-lg shadow-stone-200/60 border border-stone-100 px-4 py-3 flex items-center gap-3 max-w-[210px]">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Booking Masuk! 🎉</p>
                  <p className="text-xs text-stone-500 mt-0.5">Rina · Hari ini 10:00</p>
                </div>
              </div>

              {/* Floating: No app */}
              <div className="anim-notif-2 absolute -right-4 bottom-16 bg-white rounded-2xl shadow-lg shadow-stone-200/60 border border-stone-100 px-4 py-3 flex items-center gap-3 max-w-[200px]">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Smile className="w-4 h-4 text-indigo-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Tanpa install app</p>
                  <p className="text-xs text-stone-500 mt-0.5">Langsung dari browser</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SOCIAL PROOF BAR ─────────────────────────────────────────── */}
        <div className="border-y border-stone-200 bg-stone-100/60 py-5">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-stone-500 font-medium">
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-indigo-600" />500+ usaha aktif</span>
              <span className="hidden sm:block text-stone-300">·</span>
              <span className="flex items-center gap-2"><CalendarCheck2 className="w-4 h-4 text-indigo-600" />10.000+ booking diproses</span>
              <span className="hidden sm:block text-stone-300">·</span>
              <span className="flex items-center gap-2"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />Rating 4.9 dari pengguna</span>
              <span className="hidden sm:block text-stone-300">·</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-600" />100% gratis, tanpa kartu kredit</span>
            </div>
          </div>
        </div>

        {/* ─── DEMO SECTION ─────────────────────────────────────────────── */}
        <section id="demo" className="py-16 sm:py-20 max-w-6xl mx-auto px-4 scroll-mt-16 bg-stone-50/50">
          <div className="reveal text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Lihat Contoh Halaman Booking</h2>
            <p className="text-stone-500 mt-3 max-w-xl mx-auto text-sm sm:text-base">Pilih jenis usahamu dan lihat bagaimana pelanggan akan melakukan booking.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: "demo-barbershop", name: "Barbershop", desc: "Tema maskulin, vintage & tegas", icon: Scissors, color: "text-amber-700", bg: "bg-amber-100" },
              { id: "demo-fisioterapi", name: "Klinik Fisioterapi", desc: "Tema medis, bersih & profesional", icon: Stethoscope, color: "text-blue-700", bg: "bg-blue-100" },
              { id: "demo-auto-detailing", name: "Auto Detailing", desc: "Tema industrial & mekanikal", icon: Car, color: "text-slate-700", bg: "bg-slate-200" },
              { id: "demo-studio-foto", name: "Studio Foto", desc: "Tema minimalis & estetik", icon: Camera, color: "text-emerald-700", bg: "bg-emerald-100" },
              { id: "demo-kelas-yoga", name: "Kelas Yoga", desc: "Tema wellness, lembut & tenang", icon: User, color: "text-rose-700", bg: "bg-rose-100" },
            ].map((demo, i) => (
              <Link key={demo.id} href={`/${demo.id}`} target="_blank" className="block reveal group" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300 h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${demo.bg} mb-4 group-hover:scale-110 transition-transform`}>
                    <demo.icon className={`w-6 h-6 ${demo.color}`} />
                  </div>
                  <h3 className="font-bold text-lg text-stone-900 mb-1">{demo.name}</h3>
                  <p className="text-sm text-stone-500 flex-1">{demo.desc}</p>
                  <div className="mt-4 flex items-center text-indigo-600 font-semibold text-sm group-hover:text-indigo-700">
                    Buka Demo <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── USE CASES ─────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4">
          <div className="reveal text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Dari barbershop sampai klinik — semua bisa pakai</h2>
            <p className="text-stone-500 mt-3 max-w-xl mx-auto text-sm sm:text-base">Asal usahamu butuh jadwal antrean, bukly.id siap bantu. Sesederhana itu.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Scissors, name: "Salon & Barbershop", desc: "Booking potong, cat, keriting", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
              { icon: Stethoscope, name: "Klinik & Dokter", desc: "Antrian pasien otomatis", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
              { icon: Car, name: "Bengkel & Cuci Mobil", desc: "Atur slot servis & antrean", color: "text-orange-600", bg: "bg-amber-50", border: "border-orange-100" },
              { icon: PenTool, name: "Studio & Kelas", desc: "Foto, musik, olahraga, dll", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
            ].map((item, i) => (
              <article key={i} className={`reveal bg-white p-6 rounded-2xl border ${item.border} text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300`} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className={`w-12 h-12 mx-auto rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-stone-800 text-sm leading-tight">{item.name}</h3>
                <p className="text-xs text-stone-400 mt-1.5">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS — Horizontal Timeline ─────────────────────────── */}
        <section id="cara-kerja" className="bg-stone-900 py-16 sm:py-24 scroll-mt-16" aria-labelledby="cara-kerja-heading">
          <div className="max-w-6xl mx-auto px-4">
            <div className="reveal text-center mb-16">
              <h2 id="cara-kerja-heading" className="text-2xl sm:text-3xl font-extrabold text-white">Tiga langkah. Beneran cuma tiga.</h2>
              <p className="text-stone-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">Dari daftar sampai terima booking pertama, gak lebih dari 5 menit.</p>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute top-10 left-[calc(16.6%+24px)] right-[calc(16.6%+24px)] h-0.5 bg-gradient-to-r from-indigo-600/0 via-indigo-500 to-indigo-600/0" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
                {[
                  { step: "01", icon: Store, title: "Buat akun & atur profil usaha", desc: "Daftar gratis, tulis nama usahamu, jam buka, dan masukin daftar layanan beserta harganya. Selesai dalam hitungan menit.", color: "bg-indigo-600" },
                  { step: "02", icon: MessageCircle, title: "Bagikan link-mu ke pelanggan", desc: "Taruh bukly.id/nama-usahamu di bio Instagram, WhatsApp story, atau langsung chat ke pelanggan setia.", color: "bg-indigo-500" },
                  { step: "03", icon: Bell, title: "Duduk manis, notif masuk sendiri", desc: "Pelanggan booking kapan saja — tengah malam pun bisa. Kamu terima notifikasi di WA, jadwal masuk otomatis ke dashboard.", color: "bg-indigo-400" },
                ].map((step, i) => (
                  <div key={i} className="reveal flex flex-col items-center md:items-start text-center md:text-left" style={{ transitionDelay: `${i * 120}ms` }}>
                    <div className="relative">
                      <div className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center shadow-lg shadow-indigo-900/30`}>
                        <step.icon className="w-9 h-9 text-white" />
                      </div>
                      <span className="absolute -top-2 -right-2 bg-stone-800 border border-stone-600 text-indigo-400 text-xs font-black rounded-full w-7 h-7 flex items-center justify-center">{step.step}</span>
                    </div>
                    <h3 className="mt-5 font-bold text-white text-lg leading-snug">{step.title}</h3>
                    <p className="mt-2 text-stone-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal mt-14 text-center">
              <Link href="/register">
                <Button id="cta-cara-kerja" size="lg" className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold shadow-lg shadow-indigo-900/30 hover:-translate-y-0.5 transition-all duration-200">
                  Mulai Sekarang — Gratis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FEATURES — Alternating Split Layout ─────────────────────── */}
        <section id="fitur" className="py-16 sm:py-24 scroll-mt-16" aria-labelledby="fitur-heading">
          <div className="max-w-6xl mx-auto px-4">
            <div className="reveal text-center max-w-2xl mx-auto mb-16">
              <h2 id="fitur-heading" className="text-2xl sm:text-3xl font-extrabold text-stone-900">Kenapa ribuan UMKM milih bukly.id?</h2>
              <p className="text-stone-500 mt-4 text-sm sm:text-base">Bukan soal fitur terbanyak — tapi yang paling berguna buat usahamu. Simpel, dan langsung kerasa manfaatnya.</p>
            </div>

            <div className="space-y-16 sm:space-y-24">
              {/* Feature 1 — Anti-bentrok */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="reveal-left">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full mb-5">
                    <Calendar className="w-3.5 h-3.5" />Smart Scheduling
                  </div>
                  <h3 className="text-2xl font-extrabold text-stone-900 leading-snug">Jadwal bentrok?<br />Gak akan terjadi lagi.</h3>
                  <p className="mt-4 text-stone-500 leading-relaxed text-sm sm:text-base">Setiap slot yang udah dipesan langsung terkunci otomatis. Gak ada celah dua orang ngambil jam yang sama, bahkan kalau booking dateng barengan.</p>
                  <ul className="mt-6 space-y-3">
                    {["Real-time slot locking", "Atur durasi per layanan secara manual", "Tampil jelas: kosong, penuh, atau perlu konfirmasi"].map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-stone-600">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="reveal-right">
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Timeline Hari Ini · Selasa 5 Sep</p>
                    {[
                      { time: "09:00", name: "Dina Rahayu", svc: "Creambath", label: "✓ Selesai", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
                      { time: "10:30", name: "Rina Susanti", svc: "Keriting", label: "● Berlangsung", color: "bg-blue-100 text-blue-700 border-blue-200" },
                      { time: "12:00", name: "–", svc: "Istirahat Siang", label: "⏸ Istirahat", color: "bg-stone-100 text-stone-400 border-stone-200" },
                      { time: "13:00", name: "Maya Dewi", svc: "Nail Art", label: "◷ Akan datang", color: "bg-amber-50 text-amber-700 border-amber-200" },
                    ].map((slot, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border mb-2 text-xs ${slot.color}`}>
                        <span className="font-mono font-bold w-12 flex-shrink-0">{slot.time}</span>
                        <div className="flex-1"><p className="font-bold">{slot.name}</p><p className="opacity-70">{slot.svc}</p></div>
                        <span className="font-semibold opacity-70">{slot.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature 2 — WA Notif */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="reveal-right md:order-2">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full mb-5">
                    <MessageCircle className="w-3.5 h-3.5" />WhatsApp Reminder
                  </div>
                  <h3 className="text-2xl font-extrabold text-stone-900 leading-snug">Pelanggan lupa jadwal?<br />Kita yang ingetin.</h3>
                  <p className="mt-4 text-stone-500 leading-relaxed text-sm sm:text-base">Notifikasi WhatsApp dikirim H-1 sebelum jadwal*. Kamu juga dapat notif setiap ada booking masuk. Gak ada lagi pelanggan yang ujug-ujug ngilang.</p>
                  <ul className="mt-6 space-y-3">
                    {["Reminder otomatis H-1 ke pelanggan via WA", "Notif instan ke admin setiap booking masuk", "Pesan konfirmasi langsung ke HP pelanggan"].map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-stone-600">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-[11px] text-stone-400 leading-tight">*Pengiriman otomatis menggunakan integrasi API Fonnte (memerlukan akun Fonnte). Tersedia juga opsi kirim manual gratis.</p>
                </div>
                <div className="reveal-left md:order-1">
                  <div className="bg-[#ECF5EC] rounded-2xl p-5 border border-green-200 max-w-xs mx-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <div><p className="text-xs font-bold text-stone-800">bukly.id Bot</p><p className="text-xs text-green-600">● Online</p></div>
                    </div>
                    {[
                      { msg: "Hei Rina! 👋 Jangan lupa, besok kamu ada jadwal keriting jam 10:30 di Salon Keren By Aurel.", time: "Kemarin 18:00", out: false },
                      { msg: "Siap! Makasih remindernya 🙏", time: "18:05", out: true },
                      { msg: "Oke! Sampai besok ya! Kalau mau reschedule, tinggal buka link-nya lagi 😊", time: "18:05", out: false },
                    ].map((m, i) => (
                      <div key={i} className={`flex ${m.out ? "justify-end" : "justify-start"} mb-2`}>
                        <div className={`rounded-2xl px-3 py-2 text-xs max-w-[85%] ${m.out ? "bg-green-500 text-white rounded-tr-sm" : "bg-white text-stone-700 shadow-sm rounded-tl-sm"}`}>
                          <p>{m.msg}</p>
                          <p className={`text-right mt-1 text-[10px] ${m.out ? "text-green-100" : "text-stone-400"}`}>{m.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature 3 — Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="reveal-left">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full mb-5">
                    <BarChart2 className="w-3.5 h-3.5" />Analytics Dashboard
                  </div>
                  <h3 className="text-2xl font-extrabold text-stone-900 leading-snug">Tahu persis kapan hari<br />paling ramai — dan sepi.</h3>
                  <p className="mt-4 text-stone-500 leading-relaxed text-sm sm:text-base">Dashboard analytics bawaan kasih tau kamu tren booking mingguan, layanan paling laris, dan jam tersibuk. Buat keputusan bisnis yang lebih cerdas.</p>
                  <ul className="mt-6 space-y-3">
                    {["Grafik booking mingguan & bulanan", "Layanan paling sering dipesan", "Retensi pelanggan lama vs pelanggan baru"].map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-stone-600">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="reveal-right">
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
                    <p className="text-sm font-bold text-stone-700 mb-4">Pendapatan 30 Hari</p>
                    <div className="flex items-end gap-1 h-28 mb-2">
                      {[40, 55, 45, 60, 80, 75, 50, 65, 85, 95, 70, 80, 100, 90, 60, 75, 85, 95].map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div className="w-full rounded-t-sm bg-indigo-500" style={{ height: `${val}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
                      <div>
                        <p className="text-xs text-stone-400">Total minggu ini</p>
                        <p className="font-extrabold text-stone-900 text-2xl">47 <span className="text-sm font-medium text-stone-400">booking</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-400">vs minggu lalu</p>
                        <p className="font-bold text-green-600 flex items-center gap-1"><TrendingUp className="w-4 h-4" />+23%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─────────────────────────────────────────────── */}
        <section id="testimoni" className="bg-gradient-to-b from-stone-50 to-white border-t border-stone-200 py-16 sm:py-24 scroll-mt-16" aria-labelledby="testimoni-heading">
          <div className="max-w-6xl mx-auto px-4">
            <div className="reveal text-center mb-14">
              <h2 id="testimoni-heading" className="text-2xl sm:text-3xl font-extrabold text-stone-900">Kata mereka yang udah pakai</h2>
              <p className="text-stone-500 mt-3 max-w-xl mx-auto text-sm">Bukan klaim kosong — ini cerita nyata dari pemilik usaha yang rasain langsung manfaatnya.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { quote: "Dulu tiap pagi harus cek DM dulu, konfirmasi satu-satu, takut ada yang double. Sekarang? Buka mata langsung lihat dashboard, semua udah rapi sendiri. Stres berkurang banget.", name: "Tommy Hidayat", role: "Owner, The Classic Barbershop · Bandung", initial: "T", color: "bg-indigo-600" },
                { quote: "Pasien saya banyak yang sudah sepuh, mereka gak gaptek karena gak perlu install apapun. Buka link, pilih jadwal, selesai. Antrean di klinik jauh lebih tertib sekarang.", name: "dr. Sinta Wulandari", role: "Dokter Umum, Klinik Sehat Sentosa · Surabaya", initial: "S", color: "bg-blue-600" },
                { quote: "Paling suka fitur notif WA-nya. Pelanggan diingetin otomatis, jadi yang skip jadwal turun drastis. Dalam sebulan, no-show turun dari 30% ke hampir nol.", name: "Aurel Pratiwi", role: "Owner, Studio Nail Aurel · Jakarta", initial: "A", color: "bg-rose-500" },
              ].map((t, i) => (
                <article key={i} className="reveal bg-white p-7 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col" style={{ transitionDelay: `${i * 100}ms` }}>
                  <Quote className="w-8 h-8 text-indigo-200 mb-4 flex-shrink-0" />
                  <p className="text-stone-600 leading-relaxed text-sm flex-1">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-stone-100">
                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>{t.initial}</div>
                    <div>
                      <p className="font-bold text-stone-900 text-sm">{t.name}</p>
                      <p className="text-xs text-stone-400">{t.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA BAND ─────────────────────────────────────────────────── */}
        <section className="bg-stone-900 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="reveal">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">Udah siap gak perlu repot<br />balas chat booking lagi?</h2>
              <p className="mt-4 text-stone-400 text-sm sm:text-base max-w-md mx-auto">Daftar gratis sekarang. Dalam 5 menit, halaman booking usahamu sudah aktif dan siap dibagikan.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <Button id="cta-bottom-daftar" size="lg" className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold shadow-lg shadow-indigo-900/30 hover:-translate-y-0.5 transition-all duration-200">
                    Buat Halaman Booking — Gratis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/demo-salon">
                  <Button size="lg" variant="outline" className="border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white hover:border-stone-500 font-semibold transition-all duration-200">
                    Lihat Contoh Dulu
                  </Button>
                </Link>
              </div>
              <p className="mt-5 text-stone-500 text-xs">Tidak perlu kartu kredit · Tidak perlu download app · Aktif dalam 5 menit</p>
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="bg-white py-16 sm:py-24 scroll-mt-16" aria-labelledby="faq-heading">
          <div className="max-w-2xl mx-auto px-4">
            <div className="reveal text-center mb-12">
              <h2 id="faq-heading" className="text-2xl sm:text-3xl font-extrabold text-stone-900">Yang paling sering ditanyain</h2>
            </div>
            <div className="space-y-4">
              {[
                { q: "Apakah bukly.id benar-benar gratis?", a: "Iya, gratis beneran. Fitur dasar (bikin halaman booking, atur jadwal, terima reservasi) tidak dipungut biaya apapun. Tidak ada biaya tersembunyi atau masa trial yang tiba-tiba berakhir." },
                { q: "Berapa lama setup awal bukly.id?", a: "Paling lama 5 menit. Daftar akun, isi nama usahamu, jam operasional, dan daftar layanan — halaman booking langsung aktif dan siap dibagikan ke pelanggan." },
                { q: "Pelanggan perlu install aplikasi dulu?", a: "Nggak perlu sama sekali. Pelanggan cukup klik link yang kamu bagikan (kayak bukly.id/nama-usahamu), halaman langsung terbuka di browser HP mereka. Sesimpel buka link biasa." },
                { q: "Cocok buat usaha apa saja?", a: "Semua usaha jasa yang butuh manajemen jadwal: Barbershop, Salon Kecantikan, Nail Art, Klinik & Dokter, Bengkel, Studio Foto, Kelas privat, Laundry, dan lainnya." },
                { q: "Gimana kalau mau ganti jam atau tutup di hari tertentu?", a: "Bisa banget, lewat dashboard Settings. Atur jam buka, jam istirahat, dan blokir tanggal tertentu buat hari libur. Sistem otomatis menyesuaikan slot yang tampil ke pelanggan." },
              ].map((faq, i) => (
                <article key={i} className="reveal bg-stone-50 border border-stone-200 rounded-2xl p-6" style={{ transitionDelay: `${i * 60}ms` }}>
                  <h3 className="font-bold text-stone-900 flex items-start gap-2.5 text-sm sm:text-base">
                    <ChevronRight className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    {faq.q}
                  </h3>
                  <p className="text-stone-500 mt-2.5 text-sm leading-relaxed ml-7">{faq.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-stone-900 border-t border-stone-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="mb-3">
                <Logo variant="dark" className="text-2xl" />
              </div>
              <p className="text-stone-500 text-sm max-w-xs leading-relaxed">Platform reservasi online gratis untuk UMKM Jasa Indonesia. Biarkan pelanggan atur jadwal sendiri, 24 jam sehari.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 text-sm">
              <div>
                <p className="text-stone-400 font-bold mb-3">Produk</p>
                <ul className="space-y-2 text-stone-500">
                  <li><Link href="#fitur" className="hover:text-indigo-400 transition-colors">Fitur</Link></li>
                  <li><Link href="/demo-salon" className="hover:text-indigo-400 transition-colors">Lihat Demo</Link></li>
                  <li><Link href="/register" className="hover:text-indigo-400 transition-colors">Daftar Gratis</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-stone-400 font-bold mb-3">Informasi</p>
                <ul className="space-y-2 text-stone-500">
                  <li><Link href="/artikel" className="hover:text-indigo-400 transition-colors">Artikel & Tips</Link></li>
                  <li><Link href="#faq" className="hover:text-indigo-400 transition-colors">FAQ</Link></li>
                  <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Kontak</Link></li>
                  <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Kebijakan Privasi</Link></li>
                  <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Syarat & Ketentuan</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
            <p>© {new Date().getFullYear()} bukly.id — Dibuat untuk UMKM Jasa Indonesia.</p>
            <p>Reservasi online yang manusiawi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
