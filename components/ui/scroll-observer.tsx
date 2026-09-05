"use client";

import { useEffect } from "react";

export function ScrollObserver() {
  useEffect(() => {
    // We delay the observer slightly to ensure all DOM elements are painted by React
    const timeout = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      }, { threshold: 0.12 });

      const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
      elements.forEach((el) => {
        observer.observe(el);
      });

      // Optional: we can return a cleanup function, but for this specific landing page
      // animations, it's fine to just observe once.
      // To be strictly correct with React lifecycle:
      return () => {
        elements.forEach((el) => observer.unobserve(el));
        observer.disconnect();
      };
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return null; // This component doesn't render anything
}
