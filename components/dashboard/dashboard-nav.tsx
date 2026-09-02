"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Scissors, Settings, BarChart3, Users } from "lucide-react";

interface DashboardNavProps {
  children: React.ReactNode;
  serviceLabel: string;
  staffLabel: string;
}

export function DashboardNav({ children, serviceLabel, staffLabel }: DashboardNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dasbor",
      href: "/dashboard",
      icon: CalendarDays,
    },
    {
      label: serviceLabel,
      href: "/dashboard/services",
      icon: Scissors,
    },
    {
      label: "Analisis",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      label: staffLabel,
      href: "/dashboard/staff",
      icon: Users,
    },
    {
      label: "Pengaturan",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 pb-20 sm:pb-0">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col sm:flex-row">
        
        {/* Desktop Sidebar (Hidden on mobile) */}
        <aside className="hidden sm:flex flex-col w-64 bg-white border-r border-stone-200 h-screen sticky top-0 p-4">
          <div className="mb-8 px-4">
            <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
              maubooking<span className="text-teal-600">.in</span>
            </h2>
          </div>
          
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-teal-600" : "text-stone-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Wrapper */}
        <div className="flex-1 w-full max-w-4xl mx-auto">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation (Hidden on desktop) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? "text-teal-700" : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-teal-600" : ""}`} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
