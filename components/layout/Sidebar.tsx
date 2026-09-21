"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Newspaper, 
  CalendarCheck, 
  Settings, 
  Users, 
  Clock, 
  Briefcase
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useApp();
  const isAdmin = currentUser.role !== "employee";

  // Strict 4 navigation items for Normal Employee
  const employeeNav = [
    { name: "Feed", href: "/feed", icon: Newspaper },
    { name: "Home", href: "/", icon: LayoutDashboard }, // Maps to Dashboard
    { name: "Worksheet", href: "/worksheet", icon: CalendarCheck },
    { name: "Setting", href: "/setting", icon: Settings },
  ];

  // Strict 6 navigation items for Admin (Sub Admin, HR Admin, Owner)
  const adminNav = [
    { name: "Feed", href: "/feed", icon: Newspaper },
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Worksheet", href: "/admin/worksheet", icon: CalendarCheck },
    { name: "Management", href: "/admin/management", icon: Users },
    { name: "Attendance", href: "/admin/attendance", icon: Clock },
    { name: "Setting", href: "/admin/setting", icon: Settings },
  ];

  const currentNav = isAdmin ? adminNav : employeeNav;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 min-h-screen px-4 py-6 sticky top-0 h-screen justify-between select-none">
      <div>
        {/* Brand Logo - Matches screenshot */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-xl tracking-tighter">
            T
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Teamora
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {currentNav.map((item) => {
            const Icon = item.icon;
            // Check active state
            const isActive = pathname === item.href || (item.href === "/" && (pathname === "/" || pathname === "/dashboard"));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer from screenshot: SAME PEOPLE, BRIGHTER TOMORROWS. © 2026 Teamora */}
      <div className="px-3 pt-6 border-t border-slate-100">
        <div className="w-5 h-0.5 bg-blue-500 mb-3 rounded-full" />
        <p className="text-[10px] tracking-wider font-semibold text-slate-400 uppercase leading-relaxed">
          SAME PEOPLE,<br />BRIGHTER TOMORROWS.
        </p>
        <p className="text-[11px] text-slate-400 mt-2 font-medium">
          © 2026 Teamora
        </p>
      </div>
    </aside>
  );
}

