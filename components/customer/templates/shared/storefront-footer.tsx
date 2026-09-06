import React from "react";
import { Logo } from "@/components/ui/logo";

export type FooterVariant = "default" | "minimal" | "dark" | "auto" | "barber" | "beauty";

export function StorefrontFooter({ variant = "default" }: { variant?: FooterVariant }) {
  const renderFooterContent = () => {
    switch (variant) {
      case "auto":
        return (
          <footer className="mt-16 pb-8 text-center pt-8 border-t border-stone-200">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Sistem Antrean Disediakan Oleh</p>
            <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-all duration-200 bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-200">
              <Logo className="text-xl block" />
            </a>
            <div className="mt-8 flex justify-center">
              <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-teal-600 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-teal-700 transition-all duration-200 shadow-lg shadow-teal-600/20 active:scale-95">
                Mau Web Reservasi Gratis? Yuk Bikin!
              </a>
            </div>
          </footer>
        );
      case "barber":
        return (
          <footer className="mt-20 text-center border-t border-stone-200 pt-10 font-sans">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Sistem Antrean Didukung Oleh</p>
            <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-all duration-200 grayscale opacity-70 hover:grayscale-0 hover:opacity-100">
              <Logo className="text-2xl block" />
            </a>
            <div className="mt-8 flex justify-center">
              <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-teal-600 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-teal-700 transition-all duration-200 shadow-lg shadow-teal-600/20 active:scale-95">
                Mau Web Reservasi Gratis? Yuk Bikin!
              </a>
            </div>
          </footer>
        );
      case "beauty":
        return (
          <footer className="mt-16 pb-8 text-center pt-8">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Powered by</p>
            <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
              <Logo className="text-2xl" />
            </a>
            <p className="text-[11px] text-stone-400 mt-4 max-w-xs mx-auto leading-relaxed">
              Halaman reservasi otomatis ini dibuat menggunakan <a href="https://bukly.id" className="font-semibold text-teal-600 hover:underline">bukly.id</a>
            </p>
            <div className="mt-8 flex justify-center">
              <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-teal-600 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-teal-700 transition-all duration-200 shadow-lg shadow-teal-600/20 active:scale-95">
                Mau Web Reservasi Gratis? Yuk Bikin!
              </a>
            </div>
          </footer>
        );
      case "minimal":
      case "default":
      case "dark":
      default:
        // Generic fallback combining the common parts
        const isDark = variant === "dark";
        return (
          <footer className={`mt-16 pb-8 text-center pt-8 ${isDark ? "border-t border-stone-800" : "border-t border-stone-200"}`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-stone-500" : "text-stone-400"}`}>
              Sistem Antrean Disediakan Oleh
            </p>
            <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className={`inline-block hover:opacity-80 transition-all duration-200 ${isDark ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-200"} px-4 py-2 rounded-xl shadow-sm border`}>
              <Logo className="text-xl block" />
            </a>
            <div className="mt-8 flex justify-center">
              <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-teal-600 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-teal-700 transition-all duration-200 shadow-lg shadow-teal-600/20 active:scale-95">
                Mau Web Reservasi Gratis? Yuk Bikin!
              </a>
            </div>
          </footer>
        );
    }
  };

  return renderFooterContent();
}
