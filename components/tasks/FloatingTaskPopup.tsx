"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  useApp, 
  formatSecondsToDigital, 
  formatSecondsToHuman,
  formatTimeAmPm 
} from "@/context/AppContext";
import { MobileDrawer } from "@/components/ui/Modal";
import { 
  Clock, 
  X, 
  MoreHorizontal, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  Play,
  GripHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingTaskPopup() {
  const {
    currentUser,
    activeTask,
    activeTaskElapsedSeconds,
    todayTotalWorkSeconds,
    taskActivities,
    isTaskPopupOpen,
    setIsTaskPopupOpen,
    endActiveTask,
    setEditingTask,
    setIsCreateTaskModalOpen,
  } = useApp();

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close desktop popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest("[data-task-trigger]") && !target.closest("[data-draggable-widget]")) {
          setIsTaskPopupOpen(false);
        }
      }
    }

    if (isTaskPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTaskPopupOpen, setIsTaskPopupOpen]);

  // Filter completed tasks for today only (Today-Only rule from Section 6.1)
  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayCompletedTasks = taskActivities
    .filter((t) => t.employee_id === currentUser.id && t.status === "Completed")
    .filter((t) => t.start_at.startsWith(todayDateStr) || (t.end_at && t.end_at.startsWith(todayDateStr)));

  const handleEndTask = () => {
    endActiveTask();
  };

  const handleOpenEdit = (task: typeof activeTask) => {
    if (task) {
      setEditingTask(task);
      setIsTaskPopupOpen(false);
    }
  };

  const handleOpenCreate = () => {
    setIsCreateTaskModalOpen(true);
    setIsTaskPopupOpen(false);
  };

  const popupContent = (
    <div className="space-y-4">
      {/* Header matching media_1789995963635.png */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Today&apos;s Tasks
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Monday, 21 September
          </p>
        </div>
        <button
          onClick={() => setIsTaskPopupOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close task popup"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* State 1: Active Ongoing Task Card matching media_1789995963635.png */}
      {activeTask ? (
        <div className="p-4 rounded-2xl bg-[#EBF7F2] border border-[#D2EFE2] text-slate-900 space-y-2 shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D2EFE2] text-[#0D6832] font-black text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D6832] animate-pulse" />
              ONGOING
            </span>
            <button
              onClick={() => handleOpenEdit(activeTask)}
              className="p-1 text-emerald-800/70 hover:text-emerald-950 rounded-lg hover:bg-emerald-100/50 transition-colors"
              title="Edit ongoing task details"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {activeTask.title}
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Started at {formatTimeAmPm(activeTask.start_at)}
            </p>
          </div>

          {/* Large Live Digital Stopwatch Counter */}
          <div className="text-3xl sm:text-4xl font-mono font-extrabold text-[#0D6832] tracking-tight py-1">
            {formatSecondsToDigital(activeTaskElapsedSeconds)}
          </div>

          {/* Large Coral Red [End Task] Button */}
          <button
            onClick={handleEndTask}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FF4D4F] hover:bg-[#E03A3C] text-white font-bold text-sm shadow-md shadow-red-500/20 active:scale-[0.98] transition-all text-center select-none cursor-pointer"
          >
            End Task
          </button>
        </div>
      ) : (
        /* State 2: No Ongoing Task Running */
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              No task is currently running
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Select Add New Task to start tracking your next activity immediately.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start a Task Now</span>
          </button>
        </div>
      )}

      {/* Today's Completed Tasks Section matching media_1789995963635.png */}
      <div className="space-y-2 pt-1">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Today&apos;s completed tasks
        </h4>

        {todayCompletedTasks.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No completed tasks recorded yet today.
          </p>
        ) : (
          <div className="space-y-1 divide-y divide-slate-100">
            {todayCompletedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleOpenEdit(task)}
                className="flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {task.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatTimeAmPm(task.start_at)} – {task.end_at ? formatTimeAmPm(task.end_at) : ""}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-700">
                    {formatSecondsToHuman(task.duration_seconds || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Total Work Readout matching mockup */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500">
          Today&apos;s total work
        </span>
        <span className="text-sm font-mono font-bold text-slate-900">
          {formatSecondsToHuman(todayTotalWorkSeconds)}
        </span>
      </div>

      {/* Add New Task Action matching mockup */}
      <button
        onClick={handleOpenCreate}
        className="w-full py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors select-none cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add New Task</span>
      </button>

      {/* Link to full Worksheet */}
      <div className="text-center pt-1">
        <Link
          href="/worksheet"
          onClick={() => setIsTaskPopupOpen(false)}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          <span>Open full Worksheet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Anchored Popover from Header */}
      {isTaskPopupOpen && (
        <div
          ref={popoverRef}
          className="hidden lg:block fixed right-6 top-16 w-[380px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-slate-200/90 p-5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {popupContent}
        </div>
      )}

      {/* Mobile Drawer: Slide-up Bottom Sheet */}
      <div className="lg:hidden">
        <MobileDrawer
          isOpen={isTaskPopupOpen}
          onClose={() => setIsTaskPopupOpen(false)}
          title="Today's Tasks"
        >
          <div className="pb-4">
            {popupContent}
          </div>
        </MobileDrawer>
      </div>
    </>
  );
}

// Compact Header Trigger Component (placed in Top Navigation Bar)
export function TaskHeaderTrigger() {
  const {
    activeTask,
    activeTaskElapsedSeconds,
    isTaskPopupOpen,
    setIsTaskPopupOpen,
  } = useApp();

  return (
    <button
      data-task-trigger="true"
      onClick={() => setIsTaskPopupOpen(!isTaskPopupOpen)}
      className={cn(
        "flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all select-none shadow-xs cursor-pointer",
        activeTask
          ? "bg-[#EBF7F2] border-[#52C498] text-[#0A5734] hover:bg-[#DDF4EA]"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
      title={activeTask ? `Ongoing: ${activeTask.title}` : "Start task tracking"}
    >
      <div className="relative flex items-center justify-center">
        <Clock className={cn("w-4 h-4", activeTask ? "text-[#10B981]" : "text-slate-400")} />
        {activeTask && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white animate-pulse" />
        )}
      </div>

      <span className="font-mono tracking-tight font-black text-[12px] sm:text-xs text-[#064e3b]">
        {activeTask ? formatSecondsToDigital(activeTaskElapsedSeconds) : "00:00:00"}
      </span>
    </button>
  );
}

// DRAGGABLE ROUND FLOATING ONGOING TASK WIDGET
// Matches screenshot media_1789997053271.png:
// Round shape (rounded-full), emerald border, light mint bg, live digital timer, pulsing green dot.
// Can be dragged and positioned ANYWHERE on the screen by the user.
export function DraggableOngoingWidget() {
  const {
    activeTask,
    activeTaskElapsedSeconds,
    isTaskPopupOpen,
    setIsTaskPopupOpen,
  } = useApp();

  // Position state (persists during session, responsive bounds)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
    moved: false,
  });
  const widgetRef = useRef<HTMLDivElement>(null);

  // Initialize position to top-right below header on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initialX = Math.max(16, window.innerWidth - 220);
      const initialY = 74; // Just under the top navbar
      setPosition({ x: initialX, y: initialY });
    }
  }, []);

  // Handle pointer down (Mouse, Stylus, Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary button
    if (e.button !== 0) return;
    
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const currentX = position?.x ?? 20;
    const currentY = position?.y ?? 80;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: currentX,
      posY: currentY,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    // Check if moved more than 4px to distinguish click from drag
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragStartRef.current.moved = true;
    }

    if (dragStartRef.current.moved) {
      const widgetWidth = widgetRef.current?.offsetWidth || 160;
      const widgetHeight = widgetRef.current?.offsetHeight || 44;

      // Keep strictly within screen viewport boundaries
      const minX = 12;
      const maxX = window.innerWidth - widgetWidth - 12;
      const minY = 12;
      const maxY = window.innerHeight - widgetHeight - 12;

      const newX = Math.min(Math.max(dragStartRef.current.posX + deltaX, minX), maxX);
      const newY = Math.min(Math.max(dragStartRef.current.posY + deltaY, minY), maxY);

      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // If mouse didn't move significantly, user clicked the widget!
    if (!dragStartRef.current.moved) {
      setIsTaskPopupOpen(!isTaskPopupOpen);
    }
  };

  if (!position) return null;

  return (
    <div
      ref={widgetRef}
      data-draggable-widget="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 45,
        touchAction: "none",
      }}
      className={cn(
        "flex items-center gap-2.5 px-4 py-2 select-none transition-shadow",
        // EXACT Round shape (rounded-full) matching media_1789997053271.png
        "rounded-full bg-[#EBFBF3] border-2 border-[#52C498] shadow-lg shadow-emerald-900/10",
        isDragging ? "cursor-grabbing scale-105 shadow-2xl ring-4 ring-emerald-400/20" : "cursor-grab hover:scale-102 hover:shadow-xl",
        "animate-in fade-in duration-200"
      )}
      title="Drag to reposition anywhere. Click to view or end active task."
    >
      {/* Tiny Drag Handle affordance */}
      <div className="opacity-40 hover:opacity-100 transition-opacity">
        <GripHorizontal className="w-3.5 h-3.5 text-emerald-800" />
      </div>

      {/* Clock Icon with green dot at top right (Exact match to media_1789997053271.png) */}
      <div className="relative flex items-center justify-center">
        <Clock className="w-5 h-5 text-[#059669]" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white animate-pulse" />
      </div>

      {/* Live Digital Timer text */}
      <span className="font-mono font-black text-sm tracking-tight text-[#064e3b]">
        {activeTask ? formatSecondsToDigital(activeTaskElapsedSeconds) : "00:00:00"}
      </span>

      {/* Optional mini status pill if active */}
      {activeTask && (
        <span className="hidden sm:inline text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full max-w-[100px] truncate">
          {activeTask.title}
        </span>
      )}
    </div>
  );
}
