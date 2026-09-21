"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Newspaper, 
  CalendarCheck, 
  Menu, 
  Clock, 
  Users, 
  Settings, 
  LogOut, 
  PlaneTakeoff, 
  History,
  ShieldAlert
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MobileDrawer } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser, switchRole } = useApp();
  const isAdmin = currentUser.role !== "employee";
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Normal Employee Bottom Navigation Tabs
  const employeeTabs = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      badge: null,
      inactiveType: "plain",
      inactiveColor: "text-slate-700",
    },
    {
      name: "Feed",
      href: "/feed",
      icon: Newspaper,
      badge: null,
      inactiveType: "circle",
      circleBg: "bg-[#FF4D4F]", // Coral red circle like Watch in user's image
    },
    {
      name: "Worksheet",
      href: "/worksheet",
      icon: CalendarCheck,
      badge: "3",
      inactiveType: "circle",
      circleBg: "bg-[#8B5CF6]", // Purple circle like Kids Zone in user's image
    },
    {
      name: "Menu",
      href: "#menu",
      icon: Menu,
      isAction: true,
      inactiveType: "plain",
      inactiveColor: "text-slate-800",
    },
  ];

  // Admin Bottom Navigation Tabs
  const adminTabs = [
    {
      name: "Home",
      href: "/admin/dashboard",
      icon: Home,
      badge: null,
      inactiveType: "plain",
      inactiveColor: "text-slate-700",
    },
    {
      name: "Feed",
      href: "/feed",
      icon: Newspaper,
      badge: null,
      inactiveType: "circle",
      circleBg: "bg-[#FF4D4F]", // Coral red circle
    },
    {
      name: "Worksheet",
      href: "/admin/worksheet",
      icon: CalendarCheck,
      badge: "5",
      inactiveType: "circle",
      circleBg: "bg-[#8B5CF6]", // Purple circle
    },
    {
      name: "Attendance",
      href: "/admin/attendance",
      icon: Clock,
      badge: null,
      inactiveType: "circle",
      circleBg: "bg-[#10B981]", // Emerald green circle like Market in user's image
    },
    {
      name: "Menu",
      href: "#menu",
      icon: Menu,
      isAction: true,
      inactiveType: "plain",
      inactiveColor: "text-slate-800",
    },
  ];

  const currentTabs = isAdmin ? adminTabs : employeeTabs;

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white rounded-t-[28px] sm:rounded-t-[32px] border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-safe">
        <div className="flex items-center justify-around h-[76px] px-2 sm:px-4">
          {currentTabs.map((tab) => {
            const Icon = tab.icon;
            const isHome = tab.name === "Home";
            const isActive = tab.isAction
              ? showMoreMenu || pathname.includes("/setting")
              : isHome
              ? pathname === "/" || pathname === "/dashboard" || pathname === "/admin/dashboard"
              : pathname === tab.href;

            if (tab.isAction) {
              return (
                <button
                  key={tab.name}
                  onClick={() => setShowMoreMenu(true)}
                  className="flex items-center justify-center flex-1 py-1 text-center select-none"
                >
                  {isActive ? (
                    // Highlighted active tab: solid vibrant blue rounded pill with white icon & text
                    <div className="flex flex-col items-center justify-center w-[74px] sm:w-[82px] h-[58px] sm:h-[62px] bg-blue-600 text-white rounded-[22px] shadow-md shadow-blue-500/30 transition-all duration-300 scale-100">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.4]" />
                      <span className="text-[11px] sm:text-xs font-bold text-white mt-0.5 tracking-tight">
                        {tab.name}
                      </span>
                    </div>
                  ) : (
                    // Inactive tab: clean icon with bold dark label
                    <div className="flex flex-col items-center justify-center py-1 group transition-transform hover:scale-105 active:scale-95 duration-200">
                      <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8">
                        <Icon className={cn("w-6 h-6 stroke-[2.2]", tab.inactiveColor)} />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1 tracking-tight">
                        {tab.name}
                      </span>
                    </div>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className="flex items-center justify-center flex-1 py-1 text-center select-none"
              >
                {isActive ? (
                  // Highlighted active tab: solid vibrant blue rounded pill with white icon & text
                  <div className="flex flex-col items-center justify-center w-[74px] sm:w-[82px] h-[58px] sm:h-[62px] bg-blue-600 text-white rounded-[22px] shadow-md shadow-blue-500/30 transition-all duration-300 scale-100">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.4]" />
                    <span className="text-[11px] sm:text-xs font-bold text-white mt-0.5 tracking-tight">
                      {tab.name}
                    </span>
                  </div>
                ) : (
                  // Inactive tab: colorful circular badge or icon with bold dark label
                  <div className="flex flex-col items-center justify-center py-1 group transition-transform hover:scale-105 active:scale-95 duration-200">
                    <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8">
                      {tab.inactiveType === "circle" ? (
                        <div
                          className={cn(
                            "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white shadow-xs",
                            tab.circleBg
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                        </div>
                      ) : (
                        <Icon className={cn("w-6 h-6 stroke-[2.2]", tab.inactiveColor)} />
                      )}

                      {tab.badge && (
                        <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 flex items-center justify-center text-[9px] font-black text-white bg-red-500 rounded-full ring-2 ring-white shadow-xs">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1 tracking-tight">
                      {tab.name}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Facebook-style "Menu / More" Slide-Up Bottom Sheet */}
      <MobileDrawer
        isOpen={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        title="Workplace Menu"
      >
        <div className="space-y-4 pb-4">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src={currentUser.avatar_url}
              alt={currentUser.first_name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs"
            />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {currentUser.first_name} {currentUser.last_name}
              </h4>
              <p className="text-xs text-slate-500">
                {currentUser.designation} • {currentUser.department_name}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-100/70 text-blue-700">
                {currentUser.role.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Shortcuts & Tools
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/setting"
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <Settings className="w-4 h-4 text-blue-600" />
                <span>Account Setting</span>
              </Link>

              {isAdmin ? (
                <Link
                  href="/admin/management"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Management</span>
                </Link>
              ) : (
                <Link
                  href="/worksheet"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  <History className="w-4 h-4 text-purple-600" />
                  <span>Work History</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin/setting"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70 hover:bg-slate-50 text-slate-700 text-xs font-semibold col-span-2"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Company Policies & Audit Logs</span>
                </Link>
              )}
            </div>
          </div>

          {/* Role Switcher in Mobile Menu */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Preview Different Roles
            </p>
            <div className="space-y-1">
              {[
                { role: "employee" as const, name: "Nethmi Silva (Normal Employee)" },
                { role: "sub_admin" as const, name: "Sarah Lin (Sub Admin - Dept Lead)" },
                { role: "hr_admin" as const, name: "David Miller (HR Admin)" },
                { role: "owner" as const, name: "Elena Rostova (Company Owner)" },
              ].map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setShowMoreMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between border",
                    currentUser.role === r.role
                      ? "bg-blue-50 border-blue-200 text-blue-700 font-bold"
                      : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>{r.name}</span>
                  {currentUser.role === r.role && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </MobileDrawer>
    </>
  );
}

