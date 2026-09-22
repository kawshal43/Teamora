"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  ShieldCheck 
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

export function Header() {
  const { currentUser, switchRole, openUserProfile } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const roles: { role: UserRole; label: string; name: string }[] = [
    { role: "employee", label: "Employee View", name: "Nethmi Silva (Employee)" },
    { role: "sub_admin", label: "Sub Admin View", name: "Sarah Lin (Team Lead)" },
    { role: "hr_admin", label: "HR Admin View", name: "David Miller (HR Admin)" },
    { role: "owner", label: "Owner View", name: "Elena Rostova (Company Owner)" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#18191a]/95 backdrop-blur-md px-3 sm:px-4 py-1.5 flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200 shadow-2xs">
      {/* Left: Brand Logo & Search Input (Facebook Desktop Style) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            T
          </div>
          <span className="hidden sm:inline font-black text-lg text-blue-600 dark:text-blue-500 tracking-tight">
            Teamora
          </span>
        </Link>

        {/* Pill Search Bar */}
        <div className="hidden sm:flex items-center relative ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search Teamora..."
            className="w-48 sm:w-60 md:w-72 bg-slate-100 dark:bg-[#3a3b3c] text-slate-900 dark:text-white rounded-full pl-9 pr-4 py-2 text-xs border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Round Action Buttons (Notifications, ThemeSwitcher, RoleSwitcher, Avatar) */}
      <div className="relative flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Notifications Bell with Badge: Hidden on mobile view (< lg), where bottom task bar notification icon is used */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-[#3a3b3c] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#18191a] shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)} 
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 px-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {unreadCount} new
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="mt-2.5 space-y-2 max-h-80 overflow-y-auto">
                  {/* Item 1 */}
                  <div
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Sarah Lin assigned you a task
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                        &ldquo;Review design mockups for the mobile bottom navigation bar.&rdquo;
                      </p>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1 inline-block">
                        10m ago • High Priority
                      </span>
                    </div>
                    {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />}
                  </div>

                  {/* Item 2 */}
                  <Link
                    href="/feed"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Elena Rostova posted an announcement
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                        &ldquo;Teamora Q2 All-Hands Meeting is scheduled for this Thursday at 3:00 PM.&rdquo;
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 inline-block">
                        1h ago • Workplace Feed
                      </span>
                    </div>
                  </Link>

                  {/* Item 3 */}
                  <Link
                    href="/worksheet"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        David Miller approved your report
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                        &ldquo;Daily worksheet activity for yesterday verified and logged.&rdquo;
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 inline-block">
                        3h ago • Worksheet
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dark / Light Mode Switcher */}
        <ThemeSwitcher variant="icon" />

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#3a3b3c] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            title="Switch user role"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="capitalize hidden md:inline">{currentUser.role.replace("_", " ")}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          </button>

          {showRoleMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowRoleMenu(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Role Preview Switcher
                  </p>
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors",
                      currentUser.role === r.role ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/40" : "text-slate-700 dark:text-slate-200"
                    )}
                  >
                    <span>{r.name}</span>
                    {currentUser.role === r.role && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar with dropdown arrow */}
        <div
          onClick={() => openUserProfile(currentUser)}
          className="flex items-center gap-1 pl-1 cursor-pointer group"
          title={`View ${currentUser.first_name}'s Facebook profile`}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700 shadow-xs group-hover:ring-blue-500 transition-all">
            <img
              src={currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={`${currentUser.first_name} ${currentUser.last_name}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-[#3a3b3c] flex items-center justify-center -ml-2 mt-5 ring-1 ring-white dark:ring-[#18191a] z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ChevronDown className="w-2.5 h-2.5 text-slate-500 dark:text-slate-300 group-hover:text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
