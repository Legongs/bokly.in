import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "default",
      size = "default",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-xl active:scale-[0.98]";

    const variantStyles = {
      default:
        "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm focus-visible:ring-emerald-500",
      secondary:
        "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
      outline:
        "border border-zinc-300 bg-transparent hover:bg-zinc-100 text-zinc-900",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus-visible:ring-rose-500",
      ghost:
        "hover:bg-zinc-100 text-zinc-700",
    };

    const sizeStyles = {
      default: "h-11 px-5 py-2.5 text-sm",
      sm: "h-9 px-3 text-xs rounded-lg",
      lg: "h-13 px-8 text-base font-semibold",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
