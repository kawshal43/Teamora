import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-100/80 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-none transition-shadow hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.07)] text-slate-900 dark:text-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

