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
  ShieldAlert,
  Bell,
  CheckCheck
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MobileDrawer } from "@/components/ui/Modal";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser, switchRole } = useApp();
  const isAdmin = currentUser.role !== "employee";
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);

  // Normal Employee Bottom Navigation Tabs
  const employeeTabs = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      badge: null,
      inactiveType: "plain",
      inactiveColor: "text-slate-700 dark:text-slate-300",
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
      href: "/worksheet",
      icon: CalendarCheck,
      badge: null,
      inactiveType: "circle",
      circleBg: "bg-[#8B5CF6]", // Purple circle
    },
    {
      name: "Management",
      href: "/admin/management",
      icon: Users,
      badge: null,
      inactiveType: "circle",
      circleBg: "bg-[#10B981]", // Emerald green circle matching screenshot media_1790083518622.png
    },
    {
      name: "Alerts",
      href: "#notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? String(unreadNotificationsCount) : null,
      isAction: true,
      isNotification: true,
      inactiveType: "circle",
      circleBg: "bg-[#475569] dark:bg-[#3a3b3c]", // Dark gray/slate circle matching screenshot media_1790081478172.png
    },
    {
      name: "Menu",
      href: "#menu",
      icon: Menu,
      isAction: true,
      inactiveType: "plain",
      inactiveColor: "text-slate-800 dark:text-slate-200",
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
      inactiveColor: "text-slate-700 dark:text-slate-300",
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
      badge: null,
      inactiveType: "circle",
      circleBg: "bg-[#8B5CF6]", // Purple circle
    },
    {
      name: "Management",
      href: "/admin/management",
      icon: Users,
      badge: null,
      inactiveType: "circle",
      circleBg: "bg-[#10B981]", // Emerald green circle matching screenshot media_1790083518622.png
    },
    {
      name: "Alerts",
      href: "#notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? String(unreadNotificationsCount) : null,
      isAction: true,
      isNotification: true,
      inactiveType: "circle",
      circleBg: "bg-[#475569] dark:bg-[#3a3b3c]", // Dark gray/slate circle matching screenshot media_1790081478172.png
    },
    {
      name: "Menu",
      href: "#menu",
      icon: Menu,
      isAction: true,
      inactiveType: "plain",
      inactiveColor: "text-slate-800 dark:text-slate-200",
    },
  ];

  const currentTabs = isAdmin ? adminTabs : employeeTabs;

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-t-[32px] border-t border-slate-100 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-safe transition-colors duration-200">
        <div className="flex items-center justify-around h-[76px] px-1 sm:px-4">
          {currentTabs.map((tab) => {
            const Icon = tab.icon;
            const isHome = tab.name === "Home";
            const isNotification = (tab as any).isNotification;
            const isActive = isNotification
              ? showNotifications
              : tab.isAction
              ? showMoreMenu || pathname.includes("/setting")
              : isHome
              ? pathname === "/" || pathname === "/dashboard" || pathname === "/admin/dashboard"
              : pathname === tab.href;

            if (tab.isAction) {
              return (
                <button
                  key={tab.name}
                  onClick={() => {
                    if (isNotification) {
                      setShowNotifications(true);
                      setShowMoreMenu(false);
                    } else {
                      setShowMoreMenu(true);
                      setShowNotifications(false);
                    }
                  }}
                  className="flex items-center justify-center flex-1 py-1 text-center select-none cursor-pointer"
                >
                  {isActive ? (
                    <div className="flex flex-col items-center justify-center w-[50px] xs:w-[56px] sm:w-[68px] h-[52px] sm:h-[58px] bg-blue-600 text-white rounded-[18px] sm:rounded-[20px] shadow-md shadow-blue-500/30 transition-all duration-300 scale-100">
                      <Icon className="w-5 h-5 text-white stroke-[2.4]" />
                      <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-white mt-0.5 tracking-tight truncate max-w-full px-0.5">
                        {tab.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-1 group transition-transform hover:scale-105 active:scale-95 duration-200">
                      <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8">
                        {tab.inactiveType === "circle" ? (
                          <div
                            className={cn(
                              "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shadow-xs",
                              tab.circleBg
                            )}
                          >
                            <Icon className="w-4 h-4 stroke-[2.3]" />
                          </div>
                        ) : (
                          <Icon className={cn("w-6 h-6 stroke-[2.2]", tab.inactiveColor)} />
                        )}

                        {tab.badge && (
                          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center text-[9px] font-black text-white bg-red-600 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs">
                            {tab.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 tracking-tight truncate max-w-[56px] sm:max-w-none">
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
                  <div className="flex flex-col items-center justify-center w-[50px] xs:w-[56px] sm:w-[68px] h-[52px] sm:h-[58px] bg-blue-600 text-white rounded-[18px] sm:rounded-[20px] shadow-md shadow-blue-500/30 transition-all duration-300 scale-100">
                    <Icon className="w-5 h-5 text-white stroke-[2.4]" />
                    <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-white mt-0.5 tracking-tight truncate max-w-full px-0.5">
                      {tab.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-1 group transition-transform hover:scale-105 active:scale-95 duration-200">
                    <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8">
                      {tab.inactiveType === "circle" ? (
                        <div
                          className={cn(
                            "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shadow-xs",
                            tab.circleBg
                          )}
                        >
                          <Icon className="w-4 h-4 stroke-[2.3]" />
                        </div>
                      ) : (
                        <Icon className={cn("w-6 h-6 stroke-[2.2]", tab.inactiveColor)} />
                      )}

                      {tab.badge && (
                        <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center text-[9px] font-black text-white bg-red-600 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 tracking-tight truncate max-w-[56px] sm:max-w-none">
                      {tab.name}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Notifications Slide-Up Bottom Sheet */}
      <MobileDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Notifications"
      >
        <div className="space-y-3 pb-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {unreadNotificationsCount} Unread notifications
            </span>
            {unreadNotificationsCount > 0 && (
              <button
                onClick={() => setUnreadNotificationsCount(0)}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {/* Notification 1: Task Assignment */}
            <div
              onClick={() => {
                setShowNotifications(false);
              }}
              className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Sarah Lin assigned you a task
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                  &ldquo;Review design mockups for the mobile bottom navigation bar.&rdquo;
                </p>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-1 inline-block">
                  10m ago • High Priority
                </span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              )}
            </div>

            {/* Notification 2: Feed Announcement */}
            <Link
              href="/feed"
              onClick={() => setShowNotifications(false)}
              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Newspaper className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Elena Rostova posted an announcement
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                  &ldquo;Teamora Q2 All-Hands Meeting is scheduled for this Thursday at 3:00 PM.&rdquo;
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 inline-block">
                  1h ago • Workplace Feed
                </span>
              </div>
              {unreadNotificationsCount > 1 && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              )}
            </Link>

            {/* Notification 3: Worksheet Approval */}
            <Link
              href="/worksheet"
              onClick={() => setShowNotifications(false)}
              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  David Miller approved your report
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                  &ldquo;Daily worksheet activity for yesterday verified and logged.&rdquo;
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 inline-block">
                  3h ago • Worksheet
                </span>
              </div>
              {unreadNotificationsCount > 2 && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              )}
            </Link>
          </div>
        </div>
      </MobileDrawer>

      {/* Facebook-style "Menu / More" Slide-Up Bottom Sheet */}
      <MobileDrawer
        isOpen={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        title="Workplace Menu"
      >
        <div className="space-y-4 pb-4">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700">
            <img
              src={currentUser.avatar_url}
              alt={currentUser.first_name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {currentUser.first_name} {currentUser.last_name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {currentUser.designation} • {currentUser.department_name}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-100/70 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                {currentUser.role.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Appearance / Theme Switcher in Mobile Menu */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Appearance</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Switch dark or light mode</p>
            </div>
            <ThemeSwitcher variant="pill" />
          </div>

          {/* Quick Shortcuts */}
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Shortcuts & Tools
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/setting"
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
              >
                <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Account Setting</span>
              </Link>

              {isAdmin ? (
                <Link
                  href="/admin/management"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Management</span>
                </Link>
              ) : (
                <Link
                  href="/worksheet"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Work History</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin/setting"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold col-span-2"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Company Policies & Audit Logs</span>
                </Link>
              )}
            </div>
          </div>

          {/* Role Switcher in Mobile Menu */}
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
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
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold"
                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  <span>{r.name}</span>
                  {currentUser.role === r.role && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
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
