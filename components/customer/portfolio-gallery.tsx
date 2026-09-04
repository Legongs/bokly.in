"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export function PortfolioGallery({ portfolios }: { portfolios: any[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll logic
  useEffect(() => {
    if (!isOpen || portfolios.length <= 1) return;

    let intervalId: NodeJS.Timeout;
    const startScrolling = () => {
      intervalId = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          // If reached the end, go back to start
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            scrollRef.current.scrollBy({ left: 152, behavior: "smooth" }); // 140px min-w + 12px gap
          }
        }
      }, 3000);
    };

    startScrolling();

    return () => clearInterval(intervalId);
  }, [isOpen, portfolios.length]);

  if (portfolios.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="w-full text-sm font-bold text-stone-900 mb-3 px-1 cursor-pointer flex items-center justify-between select-none hover:opacity-80 transition-opacity"
      >
        Galeri Portofolio
        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x px-1"
          >
            {portfolios.map((p) => (
              <div
                key={p.id}
                className="relative rounded-2xl overflow-hidden min-w-[140px] max-w-[140px] aspect-[4/5] flex-shrink-0 snap-start bg-stone-100 shadow-sm border border-stone-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image_url}
                  alt={p.title || "Portfolio"}
                  className="w-full h-full object-cover"
                />
                {p.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6">
                    <p className="text-[10px] font-semibold text-white line-clamp-2 leading-tight">
                      {p.title}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
