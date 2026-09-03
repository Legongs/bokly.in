"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Loader2, Calendar, Clock, CalendarDays, Key, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateCalendarSettings } from "@/lib/actions/tenant.actions";
import type { Tenant } from "@/types/database.types";

const DAYS = [
  { id: "monday", label: "Senin" },
  { id: "tuesday", label: "Selasa" },
  { id: "wednesday", label: "Rabu" },
  { id: "thursday", label: "Kamis" },
  { id: "friday", label: "Jumat" },
  { id: "saturday", label: "Sabtu" },
  { id: "sunday", label: "Minggu" },
];

export function CalendarSettings({ tenant }: { tenant: Tenant }) {
  const [isPending, startTransition] = useTransition();

  const defaultSchedule = {
    monday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    tuesday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    wednesday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    thursday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    friday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    saturday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    sunday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
  };

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "google_connected") {
      setSuccessMsg("Google Calendar berhasil dihubungkan!");
    } else if (searchParams.get("success") === "google_disconnected") {
      setSuccessMsg("Koneksi Google Calendar berhasil diputus.");
    } else if (searchParams.get("error")) {
      setErrorMsg("Gagal memproses otorisasi Google. Coba lagi.");
    }
  }, [searchParams]);

  const [weeklySchedule, setWeeklySchedule] = useState<any>(
    tenant.weekly_schedule || defaultSchedule
  );
  
  const [minimumNoticeHours, setMinimumNoticeHours] = useState(
    tenant.minimum_notice_hours || 1
  );

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const updateDay = (day: string, field: string, value: any) => {
    setWeeklySchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    setSuccessMsg("");
    setErrorMsg("");

    startTransition(async () => {
      const res = await updateCalendarSettings({
        id: tenant.id,
        minimum_notice_hours: minimumNoticeHours,
        weekly_schedule: weeklySchedule
      });

      if (res.success) {
        setSuccessMsg("Pengaturan kalender berhasil disimpan!");
      } else {
        setErrorMsg(res.error || "Gagal menyimpan pengaturan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md shadow-stone-200/50 rounded-[2rem] bg-white overflow-hidden">
        <CardHeader className="pb-4 border-b border-stone-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-stone-900">
            <CalendarDays className="w-5 h-5 text-teal-600" />
            Jadwal Buka (Mingguan)
          </CardTitle>
          <CardDescription>
            Atur hari apa saja kamu buka dan jam operasionalnya. Pelanggan nggak bisa booking di hari kamu tutup.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {DAYS.map((day) => {
              const schedule = weeklySchedule[day.id] || { isOpen: false, openTime: "09:00", closeTime: "21:00" };
              return (
                <div key={day.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-3 sm:w-1/3">
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={schedule.isOpen}
                        onChange={(e) => updateDay(day.id, "isOpen", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                    <span className={`text-sm font-bold ${schedule.isOpen ? "text-stone-900" : "text-stone-400"}`}>
                      {day.label}
                    </span>
                  </div>
                  
                  {schedule.isOpen ? (
                    <div className="flex items-center gap-2 sm:w-2/3">
                      <input 
                        type="time" 
                        value={schedule.openTime}
                        onChange={(e) => updateDay(day.id, "openTime", e.target.value)}
                        className="flex-1 rounded-xl border border-stone-200 px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <span className="text-stone-400 font-bold">-</span>
                      <input 
                        type="time" 
                        value={schedule.closeTime}
                        onChange={(e) => updateDay(day.id, "closeTime", e.target.value)}
                        className="flex-1 rounded-xl border border-stone-200 px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="sm:w-2/3">
                      <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg">Libur / Tutup</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md shadow-stone-200/50 rounded-[2rem] bg-white overflow-hidden">
        <CardHeader className="pb-4 border-b border-stone-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-stone-900">
            <Clock className="w-5 h-5 text-teal-600" />
            Aturan Pemesanan
          </CardTitle>
          <CardDescription>
            Cegah pesanan mendadak biar kamu nggak kelabakan.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">
              Batas Waktu Minimum (Minimum Notice)
            </label>
            <p className="text-xs text-stone-500 mb-2">Pelanggan tidak bisa memesan slot untuk X jam ke depan dari sekarang.</p>
            <div className="relative max-w-xs">
              <input
                type="number"
                min="0"
                value={minimumNoticeHours}
                onChange={(e) => setMinimumNoticeHours(Number(e.target.value))}
                className="w-full pl-4 pr-12 py-3 rounded-2xl border border-stone-200 text-sm font-medium bg-stone-50 text-stone-900 caret-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">JAM</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mt-4 bg-teal-50 text-teal-700 p-3 rounded-xl text-sm font-medium">
              {successMsg}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-stone-50/50 border-t border-stone-100 p-4 sm:px-6 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isPending}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 h-11 shadow-md shadow-teal-600/20 hover:shadow-lg transition-all w-full sm:w-auto"
          >
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Simpan Kalender
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-none shadow-md shadow-stone-200/50 rounded-[2rem] bg-white overflow-hidden opacity-75">
        <CardHeader className="pb-4 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-stone-900">
                <Calendar className="w-5 h-5 text-blue-600" />
                Google Calendar Sync
              </CardTitle>
              <CardDescription className="mt-1">
                Sinkronkan jadwal pribadi kamu biar pelanggan nggak bisa booking di jam kamu sibuk.
              </CardDescription>
            </div>
            {tenant.google_refresh_token && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-700 px-2 py-1 rounded-md">Terhubung</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-6 bg-stone-50 rounded-2xl border border-stone-200 border-dashed">
            {tenant.google_refresh_token ? (
              <>
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-teal-600" />
                </div>
                <h4 className="text-sm font-bold text-stone-700 mb-1">Google Calendar Terhubung</h4>
                <p className="text-xs text-stone-500 max-w-xs mb-4">
                  Kalender toko ini akan otomatis menyembunyikan slot waktu ketika kamu sedang sibuk di Google Calendar.
                </p>
                <Button 
                  onClick={() => window.location.href = "/api/auth/google/disconnect"} 
                  variant="outline"
                  className="rounded-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  Putuskan Koneksi
                </Button>
              </>
            ) : (
              <>
                <Key className="w-8 h-8 text-stone-300 mb-3" />
                <h4 className="text-sm font-bold text-stone-700 mb-1">Tautkan ke Google Calendar</h4>
                <p className="text-xs text-stone-500 max-w-xs mb-4">
                  Kalender toko ini akan otomatis menyembunyikan slot waktu ketika kamu sedang ada acara di Google Calendar.
                </p>
                <Button 
                  onClick={() => window.location.href = "/api/auth/google"} 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-md shadow-blue-600/20"
                >
                  Hubungkan Sekarang
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
