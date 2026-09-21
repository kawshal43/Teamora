import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "info" | "neutral" | "danger" | "purple";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "neutral", size = "md", children, ...props }: BadgeProps) {
  const base = "inline-flex items-center font-medium rounded-full";
  
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/60",
    danger: "bg-red-50 text-red-700 border border-red-200/60",
    info: "bg-blue-50 text-blue-700 border border-blue-200/60",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200/60",
    purple: "bg-purple-50 text-purple-700 border border-purple-200/60",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.07)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

