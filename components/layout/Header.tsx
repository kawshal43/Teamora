"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Bell, ChevronDown, ShieldCheck, UserCheck, Briefcase } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";

import { TaskHeaderTrigger, FloatingTaskPopup } from "@/components/tasks/FloatingTaskPopup";

export function Header() {
  const { currentUser, switchRole } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [notificationsCount] = useState(2);

  const roles: { role: UserRole; label: string; name: string }[] = [
    { role: "employee", label: "Employee View", name: "Nethmi Silva (Employee)" },
    { role: "sub_admin", label: "Sub Admin View", name: "Sarah Lin (Team Lead)" },
    { role: "hr_admin", label: "HR Admin View", name: "David Miller (HR Admin)" },
    { role: "owner", label: "Owner View", name: "Elena Rostova (Company Owner)" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#f8fafc]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 border-b border-slate-100/80">
      {/* Left: Personalized Greeting & Date (Matches reference mockup) */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Good morning, {currentUser.first_name}
          </h1>
          <span className="text-xl">👋</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Monday, September 21, 2026
        </p>
      </div>

      {/* Center: Search Bar (Desktop) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search people, files, or anything..."
            className="w-full bg-white rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Right: Actions, Floating Task Trigger, Role Switcher & Avatar */}
      <div className="relative flex items-center gap-2 sm:gap-3">
        {/* Global Floating Task Header Trigger (Mockup media_1789995963635.png) */}
        <TaskHeaderTrigger />

        {/* Floating Task Popup Container */}
        <FloatingTaskPopup />

        {/* Interactive Role Switcher for instant multi-role testing */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 hover:bg-blue-100 transition-colors shadow-xs"
            title="Switch user role to test employee vs admin views"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="capitalize hidden sm:inline">{currentUser.role.replace("_", " ")}</span>
            <ChevronDown className="w-3 h-3 text-blue-500" />
          </button>

          {showRoleMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowRoleMenu(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
                      "w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors",
                      currentUser.role === r.role ? "text-blue-600 font-semibold bg-blue-50/50" : "text-slate-700"
                    )}
                  >
                    <span>{r.name}</span>
                    {currentUser.role === r.role && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-xl border border-transparent hover:border-slate-200/80 transition-all">
          <Bell className="w-5 h-5" />
          {notificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {/* User Profile Avatar with dropdown arrow (From reference mockup) */}
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200/80">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-white shadow-xs">
            <img
              src={currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={`${currentUser.first_name} ${currentUser.last_name}`}
              className="w-full h-full object-cover"
            />
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}

