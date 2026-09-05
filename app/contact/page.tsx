import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HeadphonesIcon, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Hubungi Kami | bukly.id",
  description: "Ada pertanyaan atau butuh bantuan teknis? Hubungi tim dukungan bukly.id melalui Email atau WhatsApp.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-20 flex-1 w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-indigo-600 font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
        
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-stone-100">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
              <HeadphonesIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                Hubungi Kami
              </h1>
              <p className="text-sm text-stone-500 mt-1">Tim dukungan kami siap membantu Anda.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a 
              href="mailto:tuntasapp.id@gmail.com"
              className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border border-stone-100 bg-stone-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-stone-400 group-hover:text-indigo-600 mb-4 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 mb-1">Email</h3>
              <p className="text-stone-500 text-sm mb-4">Untuk pertanyaan bisnis & kerjasama</p>
              <span className="text-indigo-600 font-semibold group-hover:underline">tuntasapp.id@gmail.com</span>
            </a>

            <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border border-stone-100 bg-stone-50">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-stone-400 mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 mb-1">Alamat Kantor</h3>
              <p className="text-stone-500 text-sm mb-4">Operational HQ</p>
              <span className="text-stone-700 font-semibold text-sm">
                Jakarta, Indonesia
              </span>
            </div>
          </div>

          <div className="mt-12 p-6 bg-stone-900 text-white rounded-2xl text-center">
            <p className="text-stone-300 mb-4">Butuh bantuan teknis seputar akun atau penagihan?</p>
            <p className="font-medium">
              Kirimkan pertanyaan Anda ke <a href="mailto:tuntasapp.id@gmail.com" className="text-indigo-400 hover:underline">tuntasapp.id@gmail.com</a> dan tim teknis kami akan segera membantu.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
