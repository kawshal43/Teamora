"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Newspaper, 
  CalendarCheck, 
  Users, 
  Clock, 
  Settings 
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, openUserProfile } = useApp();
  const isAdmin = currentUser.role !== "employee";

  // Navigation items for Normal Employee (Home, Feed, Worksheet, Setting)
  const employeeNav = [
    { 
      name: "Home", 
      href: "/", 
      icon: Home,
      isActive: pathname === "/" || pathname === "/dashboard",
    },
    { 
      name: "Feed", 
      href: "/feed", 
      icon: Newspaper,
      isActive: pathname === "/feed",
    },
    { 
      name: "Worksheet", 
      href: "/worksheet", 
      icon: CalendarCheck,
      isActive: pathname === "/worksheet",
    },
    { 
      name: "Setting", 
      href: "/setting", 
      icon: Settings,
      isActive: pathname === "/setting",
    },
  ];

  // Navigation items for Admin (Home, Feed, Worksheet, Management, Attendance, Setting)
  const adminNav = [
    { 
      name: "Home", 
      href: "/admin/dashboard", 
      icon: Home,
      isActive: pathname === "/admin/dashboard" || pathname === "/" || pathname === "/dashboard",
    },
    { 
      name: "Feed", 
      href: "/feed", 
      icon: Newspaper,
      isActive: pathname === "/feed",
    },
    { 
      name: "Worksheet", 
      href: "/admin/worksheet", 
      icon: CalendarCheck,
      isActive: pathname === "/admin/worksheet" || pathname === "/worksheet",
    },
    { 
      name: "Management", 
      href: "/admin/management", 
      icon: Users,
      isActive: pathname === "/admin/management",
    },
    { 
      name: "Attendance", 
      href: "/admin/attendance", 
      icon: Clock,
      isActive: pathname === "/admin/attendance",
    },
    { 
      name: "Setting", 
      href: "/admin/setting", 
      icon: Settings,
      isActive: pathname === "/admin/setting" || pathname === "/setting",
    },
  ];

  const currentNav = isAdmin ? adminNav : employeeNav;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#18191a] border-r border-slate-200/80 dark:border-slate-800 min-h-screen px-3 py-4 sticky top-0 h-screen justify-between select-none transition-colors duration-200">
      <div>
        {/* User Profile Quick Card (Facebook Style) */}
        <button
          onClick={() => openUserProfile(currentUser)}
          className="w-full flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors group text-left cursor-pointer"
          title={`View ${currentUser.first_name}'s Facebook profile`}
        >
          <img
            src={currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt={`${currentUser.first_name} ${currentUser.last_name}`}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-xs group-hover:ring-blue-500 transition-all"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {currentUser.first_name} {currentUser.last_name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate">
              {currentUser.role.replace("_", " ")}
            </p>
          </div>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive !== undefined ? item.isActive : pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#3a3b3c]"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
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

      {/* Footer with Theme Switcher & Copyright */}
      <div className="px-3 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
        {/* Dark/Light Mode Switcher in Sidebar */}
        <div>
          <ThemeSwitcher variant="sidebar" />
        </div>

        <div>
          <div className="w-5 h-0.5 bg-blue-500 mb-2 rounded-full" />
          <p className="text-[10px] tracking-wider font-semibold text-slate-400 dark:text-slate-500 uppercase leading-relaxed">
            SAME PEOPLE,<br />BRIGHTER TOMORROWS.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
            © 2026 Teamora
          </p>
        </div>
      </div>
    </aside>
  );
}
