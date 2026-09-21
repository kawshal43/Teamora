import React from "react";
import { cn } from "@/lib/utils";

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

