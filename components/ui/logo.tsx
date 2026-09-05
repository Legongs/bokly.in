import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <span 
      className={cn("font-extrabold tracking-tighter text-stone-900", className)}
      {...props}
    >
      bukly<span className="text-teal-600">.id</span>
    </span>
  );
}
