"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  variant?: "icon" | "pill" | "sidebar";
  className?: string;
}

export function ThemeSwitcher({ variant = "icon", className }: ThemeSwitcherProps) {
  const { theme, toggleTheme, setTheme } = useApp();
  const isDark = theme === "dark";

  if (variant === "pill") {
    return (
      <div 
        className={cn(
          "inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors",
          className
        )}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
            !isDark
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
          title="Light Mode"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
            isDark
              ? "bg-slate-900 text-blue-400 shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
          title="Dark Mode"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group",
          "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800",
          className
        )}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <div className="flex items-center gap-2.5">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-500 group-hover:-rotate-12 transition-transform" />
          )}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  }

  // Default "icon" variant for Header
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative p-2 rounded-xl border transition-all cursor-pointer group",
        "bg-white dark:bg-slate-800",
        "border-slate-200/80 dark:border-slate-700",
        "text-slate-600 dark:text-amber-400",
        "hover:text-slate-900 dark:hover:text-amber-300",
        "hover:bg-slate-50 dark:hover:bg-slate-750",
        "hover:border-slate-300 dark:hover:border-slate-600",
        "shadow-2xs",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-4.5 h-4.5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4.5 h-4.5 text-amber-400 rotate-0 scale-100 transition-all duration-300 group-hover:rotate-90" />
        ) : (
          <Moon className="w-4.5 h-4.5 text-slate-600 rotate-0 scale-100 transition-all duration-300 group-hover:-rotate-12" />
        )}
      </div>
    </button>
  );
}

