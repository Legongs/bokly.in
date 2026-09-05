"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  Copy, 
  Check, 
  LayoutDashboard, 
  CreditCard,
  ShieldAlert,
  MessageCircle,
  HelpCircle,
  QrCode,
  Smartphone
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("order_id");
  const reasonParam = searchParams.get("reason") || searchParams.get("status_message");

  const [orderId, setOrderId] = useState(orderIdParam || "buklyid-TRX-FAILED");
  const [currentDate, setCurrentDate] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (orderIdParam) {
      setOrderId(orderIdParam);
    } else {
      setOrderId(`buklyid-${Math.floor(100000 + Math.random() * 900000)}`);
    }

    setCurrentDate(
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [orderIdParam]);

  const handleCopy = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb] flex flex-col justify-between font-sans text-stone-900">
      {/* ── Top Header ── */}
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Beranda bukly.id">
            <Logo className="text-2xl" />
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Verifikasi Transaksi</span>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-200/90 relative overflow-hidden">
          
          {/* Header Status Icon */}
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-5 shadow-inner">
              <AlertTriangle className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>

            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 bg-rose-100 text-rose-800">
              Pembayaran Tidak Berhasil
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Waduh, Pembayaran Belum Selesai Nih
            </h1>
            <p className="mt-2 text-sm sm:text-base text-stone-500 max-w-md mx-auto leading-relaxed">
              Tenang, saldo kamu aman dan tidak terpotong. Transaksi belum dapat diselesaikan karena batas waktu habis, pembatalan, atau kendala jaringan perbankan.
            </p>
          </div>

          {/* ── Transaction Details Card ── */}
          <div className="mt-8 bg-stone-50 rounded-2xl p-5 sm:p-6 border border-stone-200/80 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 text-sm">
              <span className="text-stone-500 font-medium">Nomor Referensi (Order ID)</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs sm:text-sm font-bold text-stone-800 bg-white px-2 py-1 rounded border border-stone-200">
                  {orderId}
                </code>
                <button
                  onClick={handleCopy}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors"
                  title="Salin Order ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 font-medium">Waktu Permintaan</span>
              <span className="font-medium text-stone-800">{currentDate}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 font-medium">Status</span>
              <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 text-xs">
                {reasonParam || "Failed / Cancelled"}
              </span>
            </div>
          </div>

          {/* ── Troubleshooting Tips ── */}
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-sm space-y-3">
            <div className="font-bold text-amber-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Saran Cepat untuk Kamu:
            </div>
            <ul className="text-xs sm:text-sm text-amber-900/80 space-y-2 ml-6 list-disc">
              <li>Pastikan saldo di rekening atau dompet digital kamu mencukupi.</li>
              <li>Periksa apakah limit transaksi harian bank kamu belum terlampaui.</li>
              <li>Jika menggunakan QRIS, pastikan kamu memindai sebelum batas waktu 15 menit habis.</li>
              <li>Kamu juga bisa mencoba metode lain seperti Virtual Account BCA, Mandiri, BRI, atau BNI.</li>
            </ul>
          </div>

          {/* ── Action Buttons ── */}
          <div className="mt-8 space-y-3">
            <Link
              href="/dashboard/billing"
              className="w-full flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.99]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Coba Bayar Lagi Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-3 px-4 rounded-xl border border-stone-200 text-sm transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-stone-500" />
              <span>Kembali ke Dashboard Utama</span>
            </Link>
          </div>

          {/* ── Help / Contact ── */}
          <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-400">
            Masih mengalami kendala pembayaran?{" "}
            <a
              href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                `Halo Tim bukly.id, saya mengalami kendala saat melakukan pembayaran dengan Order ID: ${orderId}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-700 hover:underline font-semibold inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Bantuan Langsung via WhatsApp
            </a>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-6 text-center text-xs text-stone-400">
        &copy; {new Date().getFullYear()} bukly.id — Platform Reservasi Online UMKM Indonesia
      </footer>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f7fb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-700" />
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
