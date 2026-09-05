import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "dark" | "indigo";
}

export function Logo({ className, variant = "default", ...props }: LogoProps) {
  const isDark = variant === "dark";
  const isIndigo = variant === "indigo";

  return (
    <span 
      className={cn(
        "font-bold tracking-tighter select-none font-[family-name:var(--font-space-grotesk),sans-serif] inline-flex items-baseline",
        isDark ? "text-white" : isIndigo ? "text-white" : "text-stone-900",
        className
      )}
      {...props}
    >
      bukly
      <span 
        className={cn(
          isDark ? "text-indigo-400" : isIndigo ? "text-indigo-200" : "text-indigo-700"
        )}
      >
        .id
      </span>
    </span>
  );
}

