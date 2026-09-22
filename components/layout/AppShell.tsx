"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { TaskCreationModal } from "@/components/tasks/TaskCreationModal";
import { TaskSwitchModal } from "@/components/tasks/TaskSwitchModal";
import { TaskEditorModal } from "@/components/tasks/TaskEditorModal";
import { DraggableOngoingWidget, FloatingTaskPopup } from "@/components/tasks/FloatingTaskPopup";
import { UserProfileModal } from "@/components/profile/UserProfileModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      {/* Desktop Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        {/* Main Content: pb-24 on mobile ensures bottom navigation doesn't overlap content */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile-First Facebook-Style Sticky Bottom Menu */}
      <MobileBottomNav />

      {/* Draggable Round Ongoing Task Widget (media_1789997053271.png) & Anchored Popup */}
      <DraggableOngoingWidget />
      <FloatingTaskPopup />

      {/* Global Task Modals (Accessible everywhere) */}
      <TaskCreationModal />
      <TaskSwitchModal />
      <TaskEditorModal />

      {/* Global Facebook-Style User Profile Modal */}
      <UserProfileModal />
    </div>
  );
}

