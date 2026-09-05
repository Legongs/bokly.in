"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Printer, 
  ArrowRight, 
  LayoutDashboard, 
  CreditCard,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  HelpCircle
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "buklyid-" + Math.floor(100000 + Math.random() * 900000);
  const statusParam = searchParams.get("status") || searchParams.get("transaction_status");
  const isPending = statusParam === "pending";

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#f7f7fb] flex flex-col justify-between font-sans text-stone-900">
      {/* ── Top Header ── */}
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 print:hidden">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Beranda bukly.id">
            <Logo className="text-2xl" />
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200">
            <ShieldCheck className="w-4 h-4 text-indigo-700" />
            <span>Pembayaran Aman Midtrans</span>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-200/90 relative overflow-hidden print:border-none print:shadow-none">
          
          {/* Header Status Icon */}
          <div className="text-center">
            {isPending ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-5 shadow-inner">
                <Clock className="w-9 h-9 sm:w-11 sm:h-11 animate-pulse" />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-5 shadow-inner">
                <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>
            )}

            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 ${
              isPending ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}>
              {isPending ? "Menunggu Pembayaran" : "Transaksi Sukses"}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {isPending ? "Pembayaran Sedang Diproses" : "Pembayaran Kamu Berhasil!"}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-stone-500 max-w-md mx-auto leading-relaxed">
              {isPending
                ? "Selesaikan pembayaran sesuai instruksi pada aplikasi e-wallet atau bank kamu. Paket kamu otomatis aktif setelah pembayaran diverifikasi."
                : "Terima kasih! Langganan tokomu sudah aktif sekarang. Seluruh fitur reservasi otomatis siap digunakan."}
            </p>
          </div>

          {/* ── Receipt Summary Card ── */}
          <div className="mt-8 bg-stone-50 rounded-2xl p-5 sm:p-6 border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 text-sm">
              <span className="text-stone-500 font-medium">Nomor Referensi (Order ID)</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs sm:text-sm font-bold text-stone-800 bg-white px-2 py-1 rounded border border-stone-200">
                  {orderId}
                </code>
                <button
                  onClick={handleCopy}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors print:hidden"
                  title="Salin Order ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 font-medium">Waktu Transaksi</span>
              <span className="font-medium text-stone-800">{currentDate}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 font-medium">Metode Pembayaran</span>
              <span className="font-medium text-stone-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-700" />
                Midtrans Payment Gateway
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-200 text-sm">
              <span className="text-stone-500 font-medium">Status</span>
              <span className={`font-bold flex items-center gap-1 ${isPending ? "text-amber-700" : "text-emerald-700"}`}>
                {isPending ? "Pending Verification" : "Settlement / Paid"}
              </span>
            </div>
          </div>

          {/* ── Feature Highlights Ready ── */}
          {!isPending && (
            <div className="mt-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-sm space-y-2">
              <div className="font-bold text-indigo-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-700" />
                Benefit Langganan Kamu:
              </div>
              <ul className="text-xs sm:text-sm text-indigo-900/80 space-y-1 ml-6 list-disc">
                <li>Kuota reservasi tanpa batas per bulan</li>
                <li>Notifikasi otomatis ke pelanggan dan staf</li>
                <li>Halaman booking kustom bebas watermark</li>
              </ul>
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="mt-8 space-y-3 print:hidden">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.99]"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/billing"
                className="flex-1 flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-3 px-4 rounded-xl border border-stone-200 text-sm transition-colors"
              >
                <CreditCard className="w-4 h-4 text-stone-500" />
                <span>Pengaturan Billing</span>
              </Link>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-3 px-4 rounded-xl border border-stone-200 text-sm transition-colors"
                title="Cetak Struk"
              >
                <Printer className="w-4 h-4 text-stone-500" />
                <span className="hidden sm:inline">Cetak Bukti</span>
              </button>
            </div>
          </div>

          {/* ── Help / Contact ── */}
          <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-400 print:hidden">
            Ada pertanyaan seputar transaksi?{" "}
            <a
              href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                `Halo Tim bukly.id, saya ingin menanyakan status pembayaran dengan Order ID: ${orderId}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-700 hover:underline font-semibold inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Hubungi Bantuan WhatsApp
            </a>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-6 text-center text-xs text-stone-400 print:hidden">
        &copy; {new Date().getFullYear()} bukly.id — Platform Reservasi Online UMKM Indonesia
      </footer>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f7fb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-700" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
