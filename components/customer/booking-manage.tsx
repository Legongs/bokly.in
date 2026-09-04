"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { CheckCircle2, Clock, Calendar, AlertCircle, Store, User, UploadCloud, FileImage, ExternalLink } from "lucide-react";
import type { CustomerPortalData } from "@/lib/actions/customer-portal.actions";
import { submitPaymentProof, createMidtransToken } from "@/lib/actions/payment.actions";
import { respondToReschedule, proposeReschedule } from "@/lib/actions/booking.actions";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function BookingManageClient({ initialData }: { initialData: CustomerPortalData }) {
  const { booking, tenant, history } = initialData;
  const router = useRouter();

  // State untuk form pembayaran manual
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup Supabase Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("booking_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${booking.id}`,
        },
        (payload) => {
          if (payload.new.payment_status !== booking.payment_status) {
            router.refresh();
            toast.info("Status booking Anda telah diperbarui!");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking.id, booking.payment_status, router]);

  // ── Theme Mapping ──
  const themeColor = tenant.theme_color || "teal";
  const themeStyles: Record<string, any> = {
    teal: { textPrimary: "text-teal-700", bgPrimary: "bg-teal-600", bgLight: "bg-teal-50", borderLight: "border-teal-100", gradient: "from-teal-500 to-teal-700", ring: "ring-teal-500" },
    rose: { textPrimary: "text-rose-700", bgPrimary: "bg-rose-600", bgLight: "bg-rose-50", borderLight: "border-rose-100", gradient: "from-rose-500 to-rose-700", ring: "ring-rose-500" },
    orange: { textPrimary: "text-orange-700", bgPrimary: "bg-orange-500", bgLight: "bg-orange-50", borderLight: "border-orange-100", gradient: "from-orange-400 to-orange-600", ring: "ring-orange-500" },
    violet: { textPrimary: "text-violet-700", bgPrimary: "bg-violet-600", bgLight: "bg-violet-50", borderLight: "border-violet-100", gradient: "from-violet-500 to-violet-700", ring: "ring-violet-500" },
    blue: { textPrimary: "text-blue-700", bgPrimary: "bg-blue-600", bgLight: "bg-blue-50", borderLight: "border-blue-100", gradient: "from-blue-500 to-blue-700", ring: "ring-blue-500" },
  };
  const t = themeStyles[themeColor] || themeStyles.teal;

  const status = booking.payment_status as string; // 'pending', 'pending_verification', 'approved', 'rejected'
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const isPendingVerification = status === "pending_verification";
  const isPendingPayment = status === "pending" || isRejected; 
  // Jika ditolak, anggap butuh bayar ulang.

  function formatIDR(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmitProof = async () => {
    if (!file) return;

    startTransition(async () => {
      try {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${booking.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("payment_proofs")
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          throw new Error("Gagal mengunggah gambar. Pastikan format benar.");
        }

        const { data: { publicUrl } } = supabase.storage
          .from("payment_proofs")
          .getPublicUrl(uploadData.path);

        const res = await submitPaymentProof(booking.id, publicUrl, booking.manage_token);
        if (res.success) {
          toast.success("Bukti pembayaran berhasil diunggah!");
          router.refresh(); // Refresh halaman agar status berubah menjadi pending_verification
        } else {
          throw new Error(res.error || "Gagal menyimpan bukti.");
        }
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan.");
      }
    });
  };

  const handlePayGateway = async () => {
    startTransition(async () => {
      const res = await createMidtransToken(booking.id, booking.manage_token);
      if (res.success && res.data) {
        // Asumsi script Snap Midtrans sudah dimuat secara global
        if ((window as any).snap) {
          (window as any).snap.pay(res.data.token, {
            onSuccess: function (result: any) {
              toast.success("Pembayaran berhasil!");
              router.refresh();
            },
            onPending: function (result: any) {
              toast.info("Menunggu pembayaran Anda.");
            },
            onError: function (result: any) {
              toast.error("Pembayaran gagal.");
            },
            onClose: function () {
              toast.error("Anda menutup popup sebelum menyelesaikan pembayaran.");
            }
          });
        } else {
          toast.error("Midtrans Snap belum siap. Hubungi admin.");
        }
      } else {
        toast.error(res.error || "Gagal memproses pembayaran Gateway.");
      }
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-stone-50 pb-12">
      {/* Header Tenant */}
      <div className={`pt-12 pb-24 px-6 text-center text-white bg-gradient-to-b ${t.gradient} rounded-b-[3rem] shadow-sm`}>
        <h1 className="text-2xl font-bold tracking-tight mb-1">{tenant.business_name}</h1>
        <p className="text-white/80 text-sm flex items-center justify-center gap-1.5">
          <Store className="w-4 h-4" />
          Portal Pelanggan
        </p>
      </div>

      {/* Main Card (Overlapping header) */}
      <div className="px-5 -mt-16 relative z-10">
        <Card className="border-none shadow-xl shadow-stone-200/50 rounded-3xl overflow-hidden bg-white">
          <CardHeader className={`pb-4 border-b ${t.borderLight} ${t.bgLight} text-center`}>
            {/* Status Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
              {isApproved ? (
                <CheckCircle2 className={`w-8 h-8 ${t.textPrimary}`} />
              ) : isRejected ? (
                <AlertCircle className="w-8 h-8 text-rose-500" />
              ) : isPendingVerification ? (
                <Clock className={`w-8 h-8 ${t.textPrimary}`} />
              ) : (
                <Clock className="w-8 h-8 text-amber-500" />
              )}
            </div>
            <CardTitle className="text-lg text-stone-900">
              {isApproved ? "Booking Telah Dikonfirmasi" 
               : isRejected ? "Booking Dibatalkan" 
               : isPendingVerification ? "Menunggu Verifikasi" 
               : "Menunggu Pembayaran"}
            </CardTitle>
            <p className="text-sm text-stone-500 mt-1">
              ID: <span className="font-mono text-xs">{booking.id.split("-")[0]}</span>
            </p>
          </CardHeader>
          <CardContent className="pt-5 pb-6 space-y-4">
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-3">
                <span className="text-stone-500 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Atas Nama
                </span>
                <span className="font-semibold text-stone-800">{booking.customer_name}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-3">
                <span className="text-stone-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Jadwal
                </span>
                <div className="text-right">
                  <div className="font-semibold text-stone-800">{formatDate(booking.booking_date)}</div>
                  <div className={`text-xs font-bold mt-0.5 ${t.textPrimary}`}>{booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)} WIB</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-3">
                <span className="text-stone-500 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Layanan
                </span>
                <span className="font-semibold text-stone-800">{booking.services?.name}</span>
              </div>
              {booking.staff && (
                <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-3">
                  <span className="text-stone-500 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Pegawai
                  </span>
                  <span className="font-semibold text-stone-800">{booking.staff.name}</span>
                </div>
              )}
              {booking.services && Number(booking.services.dp_amount) > 0 && (
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-stone-500">Total Dibayar</span>
                  <span className="font-bold text-stone-900 text-base">{formatIDR(Number(booking.services.dp_amount))}</span>
                </div>
              )}
            </div>

            {/* Notifikasi Reschedule dari Admin */}
            {booking.reschedule_request && (booking.reschedule_request as any).proposedBy === "tenant" && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mt-2">
                <div className="flex items-start gap-3 text-amber-800">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm mb-1">Perubahan Jadwal</h4>
                    <p className="text-xs text-amber-700 leading-relaxed mb-3">
                      Mohon maaf, admin mengajukan perpindahan jadwal Anda menjadi:
                      <br/>
                      <span className="font-semibold block mt-1 text-sm text-amber-900">
                        {formatDate((booking.reschedule_request as any).date)}<br/>
                        Jam {(booking.reschedule_request as any).startTime.slice(0,5)} WIB
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm px-4"
                        onClick={async () => {
                          const res = await respondToReschedule(booking.id, "accepted", booking.manage_token);
                          if (res.success) toast.success("Perubahan jadwal disetujui!");
                          else toast.error(res.error || "Gagal menyetujui.");
                        }}
                      >Setuju</Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-amber-300 text-amber-800 hover:bg-amber-100 rounded-xl px-4"
                        onClick={async () => {
                          const res = await respondToReschedule(booking.id, "rejected", booking.manage_token);
                          if (res.success) toast.success("Perubahan ditolak.");
                          else toast.error(res.error || "Gagal menolak.");
                        }}
                      >Tolak</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Aksi Pembayaran */}
            {isPendingPayment && Number(booking.services?.dp_amount) > 0 && (
              <div className="pt-4 border-t border-stone-100">
                {tenant.payment_method_type === "manual" ? (
                  <div className="space-y-4">
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 text-sm text-center">
                      <p className="text-stone-500 mb-4">Silakan transfer DP ke:</p>
                      
                      {tenant.qris_image_url && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-stone-600 border-b pb-1 mb-2">Via QRIS</p>
                          <div className="flex justify-center">
                            <Image 
                              src={tenant.qris_image_url} 
                              alt="QRIS" 
                              width={200} 
                              height={200} 
                              className="rounded-xl shadow-sm border border-stone-200"
                            />
                          </div>
                        </div>
                      )}

                      {(tenant as any).bank_account_number && (
                        <div>
                          <p className="text-xs font-medium text-stone-600 border-b pb-1 mb-2 text-left">Via Transfer Bank</p>
                          <div className="bg-white rounded-xl p-3 border border-stone-200 text-left flex justify-between items-center gap-3">
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-stone-800 truncate">{(tenant as any).bank_name}</p>
                              <p className="text-sm font-mono text-stone-700 tracking-wide mt-0.5">{(tenant as any).bank_account_number}</p>
                              <p className="text-[10px] text-stone-500 uppercase mt-0.5 truncate">A.N. {(tenant as any).bank_account_name}</p>
                            </div>
                            <Button 
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 text-[10px] font-bold rounded-lg shrink-0"
                              onClick={() => {
                                navigator.clipboard.writeText((tenant as any).bank_account_number);
                                alert("Nomor rekening disalin!");
                              }}
                            >
                              Salin
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      {!file ? (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-full py-3 rounded-xl border-2 border-dashed ${t.borderLight} ${t.textPrimary} ${t.bgLight} font-semibold flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors text-sm`}
                        >
                          <UploadCloud className="w-5 h-5" />
                          Unggah Bukti Transfer
                        </button>
                      ) : (
                        <div className={`w-full py-3 px-4 rounded-xl border-2 ${t.borderLight} ${t.bgLight} flex items-center justify-between text-sm`}>
                          <div className="flex items-center gap-2 truncate">
                            <FileImage className={`w-5 h-5 ${t.textPrimary} shrink-0`} />
                            <span className="truncate text-stone-700 font-medium">{file.name}</span>
                          </div>
                          <button onClick={() => setFile(null)} className="text-stone-400 hover:text-rose-500">
                            Batal
                          </button>
                        </div>
                      )}

                      <Button 
                        disabled={!file || isPending}
                        onClick={handleSubmitProof}
                        className={`w-full rounded-xl shadow-sm ${t.bgPrimary} hover:opacity-90`}
                      >
                        {isPending ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
                      </Button>
                    </div>
                  </div>
                ) : tenant.payment_method_type === "gateway" ? (
                  <div className="space-y-4">
                     <p className="text-sm text-stone-500 text-center">Silakan selesaikan pembayaran online Anda secara aman.</p>
                     <Button 
                        disabled={isPending}
                        onClick={handlePayGateway}
                        className={`w-full rounded-xl shadow-sm ${t.bgPrimary} hover:opacity-90 h-12 text-base font-bold`}
                      >
                        {isPending ? "Memproses..." : "Bayar Sekarang"}
                      </Button>
                  </div>
                ) : null}
              </div>
            )}

            {/* Aksi Tambahan */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                className={`w-full h-12 rounded-xl text-stone-700 font-semibold border-stone-200 bg-white hover:bg-stone-50 transition-colors shadow-sm`}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Tautan berhasil disalin!");
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2 text-stone-400" />
                Simpan Tautan Halaman Ini
              </Button>
              {(!isApproved && !isRejected && !isPendingPayment) && (
                <a
                  href={`https://wa.me/${tenant.whatsapp_number?.replace(/^[0|+62]/, "62")}?text=Halo admin ${tenant.business_name}, saya ${booking.customer_name} ingin konfirmasi pembayaran booking ID ${booking.id.split("-")[0]}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-center w-full h-12 rounded-xl text-sm font-semibold transition-colors ${t.bgLight} ${t.textPrimary} hover:bg-stone-100 border ${t.borderLight}`}
                >
                  Hubungi Admin via WA
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Riwayat Kunjungan (Hanya muncul jika ada) */}
      {history.length > 0 && (
        <div className="mt-8 px-5">
          <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-400" />
            Riwayat Kunjungan Anda
          </h3>
          <div className="space-y-3">
            {history.map((hist) => (
              <div key={hist.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">{hist.services?.name}</h4>
                  <p className="text-xs text-stone-500 mb-0.5">
                    {new Date(hist.booking_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} • {hist.start_time.slice(0,5)} WIB
                  </p>
                  <p className="text-[11px] font-medium text-stone-400">
                    {hist.staff ? `oleh ${hist.staff.name}` : tenant.business_name}
                  </p>
                </div>
                <div className="text-right flex flex-col justify-between items-end gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    hist.payment_status === "approved" ? "bg-emerald-50 text-emerald-600" :
                    hist.payment_status === "rejected" ? "bg-rose-50 text-rose-600" :
                    "bg-amber-50 text-amber-600"
                  }`}>
                    {hist.payment_status === "approved" ? "Selesai" : hist.payment_status === "pending_verification" ? "Verifikasi" : hist.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
