import Link from "next/link";
import {
  Calendar,
  Scissors,
  CalendarCheck2,
  ArrowRight,
  Store,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col selection:bg-teal-600 selection:text-white font-sans">
      {/* Navigation */}
      <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-stone-900">
              maubooking<span className="text-teal-600">.in</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                className="bg-transparent text-stone-700 hover:bg-stone-200 hover:text-stone-900 font-bold shadow-none"
                size="sm"
              >
                Masuk
              </Button>
            </Link>
            <Link href="/demo-salon">
              <Button size="sm" className="bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-sm">
                Lihat Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 sm:py-24 w-full">
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
                Tinggal share link, jadwal langsung keisi.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-stone-600 max-w-lg leading-relaxed">
              Cocok banget buat Barbershop, Salon, Studio Foto, atau Jasa lainnya. Gak ada lagi jadwal bentrok atau pelanggan yang hit & run.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md shadow-teal-600/10">
                  Mulai Buka Jadwal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/demo-salon" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 font-bold shadow-sm"
                >
                  Coba Pesan Sekarang
                </Button>
              </Link>
            </div>
          </div>

          {/* Kolom Visual / Mockup UI (Kanan) */}
          <div className="relative w-full max-w-md mx-auto lg:ml-auto lg:mr-0 perspective-1000">
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

              <Button className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl h-11">
                Kunci Jadwal
              </Button>
            </div>
          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 sm:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full border-t border-stone-200 pt-16">
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-stone-900">Gak Ada Lagi Jadwal Bentrok</h3>
            <p className="text-sm text-stone-600 mt-2.5 leading-relaxed">
              Sistem akan mengunci waktu secara otomatis saat pelanggan memesan, jadi mustahil ada dua pelanggan di jam yang sama.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-stone-900">Bebas Pelanggan PHP</h3>
            <p className="text-sm text-stone-600 mt-2.5 leading-relaxed">
              Terapkan sistem uang muka (DP) pakai QRIS supaya pelanggan komitmen datang dan hindari hit & run.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-stone-900">Pas Buat Semua Usaha Jasa</h3>
            <p className="text-sm text-stone-600 mt-2.5 leading-relaxed">
              Tinggal sesuaikan nama layanan, durasi menit pengerjaan, dan harga. Sisanya biar sistem yang urus.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8 px-4 text-center text-xs text-stone-500 font-medium">
        <p>© {new Date().getFullYear()} maubooking.in — Dibuat untuk memajukan UMKM Jasa Indonesia.</p>
      </footer>
    </div>
  );
}
