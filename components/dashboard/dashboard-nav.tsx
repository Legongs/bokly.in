"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Scissors,
  Contact,
  CreditCard,
  MoreHorizontal,
  BarChart3,
  Users,
  Settings,
  Crown,
  X,
  LogOut,
  Megaphone,
  MessageSquareQuote,
} from "lucide-react";
import { logout } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Logo } from "@/components/ui/logo";
interface DashboardNavProps {
  children: React.ReactNode;
  serviceLabel: string;
  staffLabel: string;
  tenantSlug?: string;
}

// DO NOT TOUCH THIS LINE AI — urutan ini menentukan posisi tab mobile
const BOTTOM_NAV_ITEMS = (serviceLabel: string) => [
  { label: "Dasbor",     href: "/dashboard",           icon: CalendarDays },
  { label: serviceLabel, href: "/dashboard/services",  icon: Scissors     },
  { label: "Pelanggan",  href: "/dashboard/customers", icon: Contact      },
  { label: "Pembayaran", href: "/dashboard/payments",  icon: CreditCard   },
  // Item ke-5: "Lainnya" — membuka drawer alih-alih navigasi langsung
];

// Item yang tersembunyi di mobile, muncul di drawer "Lainnya"
const MORE_ITEMS = (staffLabel: string) => [
  { label: "Promo",      href: "/dashboard/promotions",icon: Megaphone },
  { label: "Testimoni",  href: "/dashboard/testimonials", icon: MessageSquareQuote },
  { label: "Analisis",   href: "/dashboard/analytics", icon: BarChart3 },
  { label: staffLabel,   href: "/dashboard/staff",     icon: Users     },
  { label: "Langganan",  href: "/dashboard/billing",   icon: Crown     },
  { label: "Pengaturan", href: "/dashboard/settings",  icon: Settings  },
];

// Semua item untuk sidebar desktop
const ALL_SIDEBAR_ITEMS = (serviceLabel: string, staffLabel: string) => [
  ...BOTTOM_NAV_ITEMS(serviceLabel),
  ...MORE_ITEMS(staffLabel),
];

export function DashboardNav({ children, serviceLabel, staffLabel }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const bottomItems = BOTTOM_NAV_ITEMS(serviceLabel);
  const moreItems   = MORE_ITEMS(staffLabel);
  const sidebarItems = ALL_SIDEBAR_ITEMS(serviceLabel, staffLabel);

  // Tentukan apakah halaman saat ini ada di bagian "Lainnya"
  const isMoreActive = moreItems.some((item) => item.href === pathname);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const res = await logout();
    if (res.success) {
      toast.success("Sampai jumpa lagi!");
      router.push("/login");
    } else {
      toast.error(res.error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 pb-20 pt-16 sm:pb-0 sm:pt-0">

      {/* ── Mobile Top Header ── */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-stone-200 z-40 flex items-center px-4">
        <h2 className="text-lg font-extrabold tracking-tight text-stone-900">
          <Logo />
        </h2>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row">

        {/* ── Desktop Sidebar — selalu tampil penuh ── */}
        <aside className="hidden sm:flex flex-col w-64 bg-white border-r border-stone-200 h-screen sticky top-0 p-4">
          <div className="mb-8 px-4">
            <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
              <Logo />
            </h2>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${isActive ? "text-indigo-600" : "text-stone-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Logout Button */}
          <div className="mt-auto pt-4 border-t border-stone-100">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-semibold text-rose-600 hover:bg-rose-50 transition-all duration-200 disabled:opacity-50"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {isLoggingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </aside>

        {/* ── Content Wrapper ── */}
        <div className="flex-1 w-full max-w-4xl mx-auto">
          {children}
        </div>
      </div>

      {/* ── Mobile Bottom Navigation (max 5 item) ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 pb-safe z-40">
        <div className="flex justify-around items-center h-16">

          {/* 4 tab utama */}
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all duration-200 ${
                  isActive ? "text-indigo-700" : "text-stone-400 active:text-stone-600"
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "text-indigo-600 scale-110" : ""}`} />
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600" />
                  )}
                </div>
                <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
              </Link>
            );
          })}

          {/* Tab ke-5: "Lainnya" — membuka drawer */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            aria-label="Menu lainnya"
            className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all duration-200 ${
              isMoreActive ? "text-indigo-700" : "text-stone-400 active:text-stone-600"
            }`}
          >
            {/* Dot indicator jika halaman aktif ada di dalam drawer */}
            <div className="relative flex flex-col items-center">
              <MoreHorizontal className={`w-5 h-5 transition-transform duration-200 ${isMoreActive ? "text-indigo-600 scale-110" : ""}`} />
              {isMoreActive && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-0.5">Lainnya</span>
          </button>
        </div>
      </nav>

      {/* ── "Lainnya" Slide-up Drawer ── */}
      {/* Overlay */}
      {isMoreOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-200"
          onClick={() => setIsMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sheet konten */}
      <div
        className={`sm:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transition-transform duration-300 ease-out pb-safe ${
          isMoreOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="w-10 h-1 rounded-full bg-stone-200 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
          <p className="text-sm font-bold text-stone-700 mt-2">Menu Lainnya</p>
          <button
            type="button"
            onClick={() => setIsMoreOpen(false)}
            aria-label="Tutup menu"
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors duration-200 mt-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item menu di drawer */}
        <nav className="px-4 pb-6 mt-2 space-y-1">
          {moreItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMoreOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-stone-700 hover:bg-stone-100 active:scale-[0.98]"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? "bg-indigo-100" : "bg-stone-100"}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-stone-500"}`} />
                </div>
                <div>
                  <p className="text-sm font-bold">{item.label}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Logout Button */}
        <div className="px-4 pb-8 pt-2 border-t border-stone-100">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl font-semibold text-rose-600 hover:bg-rose-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-50">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">{isLoggingOut ? "Keluar..." : "Keluar"}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
