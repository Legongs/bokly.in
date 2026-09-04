import Link from "next/link";
import {
  Calendar,
  Scissors,
  CalendarCheck2,
  ArrowRight,
  Store,
  CheckCircle2,
  Clock,
  Car,
  Stethoscope,
  PenTool,
  ChevronRight,
  MessageCircle,
  Zap,
  Star,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  // ── JSON-LD Structured Data for SEO & AIO ──
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "maubooking.in",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "IDR"
        },
        "description": "Aplikasi sistem reservasi online gratis untuk Barbershop, Salon, Bengkel, dan UMKM Jasa lainnya. Atur jadwal otomatis 24/7."
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Apakah maubooking.in gratis?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ya, fitur dasar maubooking.in gratis untuk digunakan oleh UMKM. Anda bisa membuat halaman booking, mengatur layanan, dan menerima reservasi tanpa biaya langganan bulanan."
            }
          },
          {
            "@type": "Question",
            "name": "Bisakah mengatur jam buka tutup toko?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tentu. Anda dapat mengatur jam buka, jam istirahat, dan hari libur. Sistem otomatis hanya akan menampilkan jam yang kosong kepada pelanggan."
            }
          },
          {
            "@type": "Question",
            "name": "Apakah pelanggan perlu install aplikasi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tidak perlu. Pelanggan cukup membuka link unik toko Anda (contoh: maubooking.in/salon-siska) melalui browser di HP mereka."
            }
          },
          {
            "@type": "Question",
            "name": "Usaha apa saja yang cocok pakai aplikasi ini?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sangat cocok untuk Barbershop, Salon kecantikan, Nail Art, Bengkel, Klinik Dokter, Studio Foto, dan usaha berbasis jasa lainnya yang butuh manajemen antrean waktu."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col selection:bg-teal-600 selection:text-white font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Navigation */}
      <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between" aria-label="Main Navigation">
          <Link href="/" className="flex items-center gap-2" aria-label="Beranda maubooking.in">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-stone-900">
              maubooking<span className="text-teal-600">.in</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-600">
            <li><Link href="#fitur" className="hover:text-teal-600 transition-colors">Fitur</Link></li>
            <li><Link href="#cara-kerja" className="hover:text-teal-600 transition-colors">Cara Kerja</Link></li>
            <li><Link href="#testimoni" className="hover:text-teal-600 transition-colors">Testimoni</Link></li>
            <li><Link href="#faq" className="hover:text-teal-600 transition-colors">FAQ</Link></li>
            <li><Link href="/artikel" className="hover:text-teal-600 transition-colors">Artikel</Link></li>
          </ul>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                className="bg-transparent text-stone-700 hover:bg-stone-200 hover:text-stone-900 font-bold shadow-none transition-all duration-200"
                size="sm"
                aria-label="Masuk ke Dashboard"
              >
                Masuk
              </Button>
            </Link>
            <Link href="/demo-salon">
              <Button size="sm" className="bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-sm transition-all duration-200 hidden sm:flex" aria-label="Lihat Demo Web">
                Lihat Demo
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full">
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Kolom Teks (Kiri) */}
            <div className="flex flex-col items-start text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold mb-6">
                <CalendarCheck2 className="w-3.5 h-3.5" />
                <span>Bikin Web Booking Jadwal Buat Usahamu dalam 1 Menit.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-[1.15] sm:leading-[1.1]">
                Nggak perlu lagi repot balas chat satu-satu. <br />
                <span className="text-teal-700">
                  Biar pelanggan yang atur jadwal sendiri.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-stone-600 max-w-lg leading-relaxed">
                Solusi reservasi otomatis buat Barbershop, Salon, Studio Foto, dan Jasa lainnya. Gak ada lagi jadwal bentrok atau pelanggan yang hit & run.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md shadow-teal-600/10 transition-all duration-200 hover:shadow-lg hover:shadow-teal-600/20 hover:-translate-y-0.5">
                    Buat Halaman Booking
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/demo-salon" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 font-bold shadow-sm transition-all duration-200 hover:border-stone-400"
                  >
                    Lihat Demo Web
                  </Button>
                </Link>
              </div>
            </div>

            {/* Kolom Visual / Mockup UI (Kanan) */}
            <div className="relative w-full max-w-md mx-auto lg:ml-auto lg:mr-0 perspective-1000" aria-hidden="true">
              {/* Dekorasi background */}
              <div className="absolute inset-0 -translate-x-4 translate-y-4 bg-orange-100/50 rounded-3xl -z-10 blur-xl"></div>
              
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xl shadow-stone-200/50 rotate-y-[-5deg] rotate-x-[2deg] transform transition-transform hover:rotate-0 duration-500">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <Store className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 leading-tight">Salon Siska</h3>
                      <p className="text-xs text-stone-500 font-medium">Pilih jadwal kedatangan</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl border-2 border-teal-600 bg-teal-50">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-teal-700" />
                      <div>
                        <p className="font-bold text-teal-900">10:00 - 11:00</p>
                        <p className="text-xs text-teal-700 font-semibold mt-0.5">Potong Rambut Pria</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2.5 py-1 rounded-full">Kosong</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50 opacity-60">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-stone-400" />
                      <div>
                        <p className="font-bold text-stone-500">11:00 - 12:00</p>
                        <p className="text-xs text-stone-400 font-medium mt-0.5">Creambath</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-stone-500 bg-stone-200 px-2.5 py-1 rounded-full">Penuh</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-white hover:border-teal-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-stone-600" />
                      <div>
                        <p className="font-bold text-stone-700">13:00 - 14:00</p>
                        <p className="text-xs text-stone-500 font-medium mt-0.5">Nail Art</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">Kosong</span>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl h-11" tabIndex={-1}>
                  Kunci Jadwal
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section - SEO target keywords */}
        <section className="bg-stone-100/50 py-16 sm:py-24 border-y border-stone-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-stone-900">Pas banget buat usaha jasa Anda</h2>
              <p className="text-stone-600 mt-3 max-w-2xl mx-auto">Sistem yang fleksibel buat bantu ngatur antrean, apapun jenis bisnis yang Anda jalankan.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Scissors, name: "Salon & Barbershop", color: "text-rose-600", bg: "bg-rose-100" },
                { icon: Stethoscope, name: "Klinik Praktik", color: "text-blue-600", bg: "bg-blue-100" },
                { icon: Car, name: "Bengkel & Cuci Mobil", color: "text-orange-600", bg: "bg-orange-100" },
                { icon: PenTool, name: "Studio Foto & Kelas", color: "text-violet-600", bg: "bg-violet-100" },
              ].map((item, i) => (
                <article key={i} className="bg-white p-6 rounded-3xl border border-stone-200 text-center hover:shadow-md transition-shadow">
                  <div className={`w-14 h-14 mx-auto rounded-full ${item.bg} ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-stone-800">{item.name}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="cara-kerja" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 scroll-mt-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-stone-900">Gimana sih cara mulainya?</h2>
            <p className="text-stone-600 mt-3 max-w-2xl mx-auto">Cuma butuh 3 langkah simpel buat ngubah cara Anda nerima orderan selamanya.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 -z-10 -translate-y-1/2"></div>
            
            <div className="bg-white p-6 rounded-3xl border border-stone-200 text-center relative z-10 shadow-sm">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-5 shadow-lg shadow-teal-600/30">1</div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Bikin Akun & Atur Profil</h3>
              <p className="text-stone-600 text-sm">Daftar gratis, tentukan jam buka, dan masukin layanan beserta harganya. Gak sampai 5 menit.</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-stone-200 text-center relative z-10 shadow-sm">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-5 shadow-lg shadow-teal-600/30">2</div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Tinggal Bagikan Link</h3>
              <p className="text-stone-600 text-sm">Taruh link khusus (maubooking.in/toko-anda) di bio Instagram atau tinggal share via WhatsApp.</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-stone-200 text-center relative z-10 shadow-sm">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-5 shadow-lg shadow-teal-600/30">3</div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Duduk Tenang, Terima Order</h3>
              <p className="text-stone-600 text-sm">Pelanggan pilih jam sendiri, Anda tinggal nunggu notifikasi booking masuk ke HP.</p>
            </div>
          </div>
        </section>

        {/* Feature Highlights - Bento Grid */}
        <section id="fitur" className="bg-white py-16 sm:py-24 border-t border-stone-200 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-stone-900">Kenapa harus pakai maubooking.in?</h2>
              <p className="text-stone-600 mt-4">Desainnya gampang dipakai, fiturnya lengkap. Anda fokus kerja, biar sistem yang ngurusin jadwal pelanggan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Card Besar */}
              <article className="md:col-span-2 p-8 rounded-3xl bg-stone-50 border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-stone-900">Gak ada lagi cerita jadwal bentrok</h3>
                  <p className="text-base text-stone-600 mt-2.5 leading-relaxed">
                    Sistem otomatis ngunci jam yang udah dipesan. Mustahil ada dua orang milih jam yang sama. Semua jadwal rapi tanpa pusing.
                  </p>
                </div>
              </article>

              {/* Card Kecil 1 */}
              <article className="p-8 rounded-3xl bg-stone-50 border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-stone-900">Bebas dari pelanggan hit & run</h3>
                <p className="text-sm text-stone-600 mt-2.5 leading-relaxed">
                  Slot antrean dikelola dengan jelas. Gak perlu khawatir lagi sama pelanggan yang cuma iseng booking terus ngilang.
                </p>
              </article>
              
              {/* Card Lebar Bawah */}
              <article className="md:col-span-3 p-8 rounded-3xl bg-stone-900 text-stone-50 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">Notifikasi otomatis ke WhatsApp</h3>
                    <p className="text-sm text-stone-400 mt-1.5 leading-relaxed max-w-xl">
                      Admin dan pelanggan langsung dapet pengingat otomatis H-1 di WA biar ngga ada jadwal yang kelupaan.
                    </p>
                  </div>
                </div>
                <Link href="/register">
                  <Button className="bg-teal-500 text-stone-900 hover:bg-teal-400 font-bold rounded-xl whitespace-nowrap transition-all duration-200">
                    Daftar Gratis Sekarang
                  </Button>
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimoni" className="bg-stone-900 py-16 sm:py-24 scroll-mt-16 text-stone-50 border-y border-stone-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-white">Telah dipercaya ratusan bisnis</h2>
              <p className="text-stone-400 mt-3 max-w-2xl mx-auto">Lihat gimana mereka bisa hemat waktu dan bikin pelanggan makin nyaman.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article className="bg-stone-800 p-8 rounded-3xl border border-stone-700">
                <Quote className="w-10 h-10 text-teal-500/50 mb-4" />
                <p className="text-stone-200 leading-relaxed mb-6">
                  "Semenjak pakai maubooking.in, DM Instagram saya jauh lebih rapi. Dulu pusing banget kalau ada jadwal double karena kelupaan catat manual. Sekarang pelanggan tinggal klik link di bio, pilih jam sendiri. Saya cuma tinggal nunggu notif."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-xl font-bold text-white">T</div>
                  <div>
                    <h4 className="font-bold text-white">Tommy</h4>
                    <p className="text-sm text-stone-400">Owner, The Classic Barbershop</p>
                  </div>
                </div>
              </article>
              
              <article className="bg-stone-800 p-8 rounded-3xl border border-stone-700">
                <Quote className="w-10 h-10 text-teal-500/50 mb-4" />
                <p className="text-stone-200 leading-relaxed mb-6">
                  "Klinik kami butuh sistem pendaftaran yang cepat tanpa bikin pasien antre berjam-jam di ruang tunggu. Platform ini jadi solusi instan buat kami yang ngga ngerti coding bikin web sendiri. Sangat direkomendasikan!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-xl font-bold text-white">S</div>
                  <div>
                    <h4 className="font-bold text-white">dr. Sinta</h4>
                    <p className="text-sm text-stone-400">Founder, Klinik Sehat Sentosa</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-white py-16 sm:py-24 scroll-mt-16">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-extrabold text-stone-900 text-center mb-10">Yang paling sering ditanyain (FAQ)</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Apakah aplikasinya gratis?",
                  a: "Iya dong. Fitur dasar buat nerima booking ini 100% gratis tanpa langganan bulanan. Anda udah bisa bikin halaman booking, masukin layanan, dan nerima pesanan langsung."
                },
                {
                  q: "Bisa ngatur jam operasional sendiri?",
                  a: "Pasti bisa. Atur jam buka, jam istirahat, sampai hari libur sesuka Anda. Sistem cuma nampilin jam yang emang Anda buka ke pelanggan."
                },
                {
                  q: "Pelanggan harus install aplikasi dulu ngga?",
                  a: "Nggak usah repot-repot. Pelanggan cukup klik link yang Anda kasih (kayak maubooking.in/salon), terus halamannya langsung kebuka di browser HP mereka masing-masing."
                },
                {
                  q: "Cocok buat usaha apa aja nih?",
                  a: "Dari barbershop, salon kecantikan, bengkel, sampai dokter gigi. Intinya, semua jenis bisnis jasa yang butuh antrean waktu cocok banget pakai ini."
                }
              ].map((faq, i) => (
                <article key={i} className="bg-stone-50 p-6 rounded-2xl border border-stone-200 shadow-sm">
                  <h3 className="font-bold text-stone-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-teal-600" />
                    {faq.q}
                  </h3>
                  <p className="text-stone-600 mt-2 text-sm leading-relaxed ml-7">{faq.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span className="font-extrabold text-stone-900">maubooking.in</span>
          </div>
          <p className="text-xs text-stone-500 font-medium text-center md:text-right">
            © {new Date().getFullYear()} Dibuat untuk memajukan UMKM Jasa Indonesia.<br/>
            Solusi Reservasi Online Cepat & Aman.
          </p>
        </div>
      </footer>
    </div>
  );
}
