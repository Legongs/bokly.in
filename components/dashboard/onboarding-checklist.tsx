"use client";

import { useState } from "react";
import { CheckCircle2, Circle, X, Image as ImageIcon, Users, Scissors, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

interface OnboardingChecklistProps {
  tenantSlug: string;
  hasServices: boolean;
  hasStaff: boolean;
  hasHeroImage: boolean;
  hasBookings: boolean;
}

export function OnboardingChecklist({
  tenantSlug,
  hasServices,
  hasStaff,
  hasHeroImage,
  hasBookings,
}: OnboardingChecklistProps) {
  const [isVisible, setIsVisible] = useState(true);

  const checklist = [
    { label: "Daftar akun", done: true, href: null, icon: CheckCircle2 },
    { label: "Tambah layanan pertama", done: hasServices, href: "/dashboard/services", icon: Scissors },
    { label: "Upload foto toko", done: hasHeroImage, href: "/dashboard/settings", icon: ImageIcon },
    { label: "Tambah staf", done: hasStaff, href: "/dashboard/staff", icon: Users },
    { label: "Bagikan link ke pelanggan pertama", done: hasBookings, href: null, icon: LinkIcon },
  ];

  const completedCount = checklist.filter((item) => item.done).length;
  const totalCount = checklist.length;
  const isAllDone = completedCount === totalCount;

  if (isAllDone || !isVisible) return null;

  return (
    <div className="bg-white rounded-[2rem] p-6 mb-6 shadow-sm border border-stone-100 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 p-2 text-stone-400 hover:bg-stone-100 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="mb-4">
        <h3 className="font-extrabold text-stone-900 text-lg">Lengkapi profil tokomu</h3>
        <p className="text-sm text-stone-500 font-medium">({completedCount}/{totalCount} selesai)</p>
      </div>

      <div className="w-full bg-stone-100 rounded-full h-2.5 mb-6 overflow-hidden">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {checklist.map((item, idx) => (
          <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${item.done ? 'bg-stone-50 border-stone-100' : 'bg-white border-stone-200 hover:border-indigo-50'}`}>
            {item.done ? (
              <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-stone-300 flex-shrink-0" />
            )}
            
            {item.href && !item.done ? (
              <Link href={item.href} className="text-sm font-semibold text-stone-700 hover:text-indigo-700">
                {item.label}
              </Link>
            ) : (
              <span className={`text-sm font-semibold ${item.done ? 'text-stone-500 line-through decoration-stone-300' : 'text-stone-700'}`}>
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
