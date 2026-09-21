"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  AlertTriangle,
  GripHorizontal,
  Calendar as CalendarIcon
} from "lucide-react";
import { 
  useApp, 
  formatSecondsToDigital, 
  formatSecondsToHuman, 
  formatTimeAmPm 
} from "@/context/AppContext";
import { TaskActivity } from "@/types";
import { cn } from "@/lib/utils";

// Time grid constants
const GRID_START_HOUR = 8; // 8:00 AM
const GRID_END_HOUR = 21; // 9:00 PM (13 hours total: 8am to 9pm)
const TOTAL_HOURS = GRID_END_HOUR - GRID_START_HOUR; // 13
const HOUR_HEIGHT = 80; // 80px per hour
const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT; // 1040px

// Hours array: 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => GRID_START_HOUR + i);

// Helper: Convert ISO string to minutes from 8:00 AM (local time)
function getMinutesFromGridStart(isoString: string): number {
  const d = new Date(isoString);
  const hour = d.getHours();
  const minutes = d.getMinutes();
  return (hour - GRID_START_HOUR) * 60 + minutes;
}

// Helper: Get task duration in minutes
function getTaskDurationMinutes(task: TaskActivity, activeElapsedSec = 0): number {
  if (task.end_at) {
    const s = new Date(task.start_at).getTime();
    const e = new Date(task.end_at).getTime();
    return Math.max(5, Math.round((e - s) / (60 * 1000)));
  }
  return Math.max(5, Math.round(activeElapsedSec / 60));
}

// Format hour and minute to readable AM/PM string
function formatHM(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  const mStr = String(minute).padStart(2, "0");
  return `${h12}:${mStr} ${ampm}`;
}

// Given minutes from 8:00 AM, returns { hour, minute, formatted }
function minutesFromStartToTime(minutes: number): { hour: number; minute: number; formatted: string } {
  const totalMinutes = GRID_START_HOUR * 60 + minutes;
  const hour = Math.floor(totalMinutes / 60);
  const minute = Math.max(0, Math.min(59, Math.round(totalMinutes % 60)));
  return { hour, minute, formatted: formatHM(hour, minute) };
}

// Multi-task overlap layout computation (Google Calendar side-by-side clustering)
interface LayoutPosition {
  colIndex: number;
  totalCols: number;
}

function computeDayTaskLayout(tasks: TaskActivity[]): Map<string, LayoutPosition> {
  const result = new Map<string, LayoutPosition>();
  if (tasks.length === 0) return result;

  // Sort tasks by start time ascending, then duration descending
  const sorted = [...tasks].sort((a, b) => {
    const sA = new Date(a.start_at).getTime();
    const sB = new Date(b.start_at).getTime();
    if (sA !== sB) return sA - sB;
    const durA = (a.end_at ? new Date(a.end_at).getTime() : sA + 3600000) - sA;
    const durB = (b.end_at ? new Date(b.end_at).getTime() : sB + 3600000) - sB;
    return durB - durA;
  });

  // Group overlapping clusters
  const clusters: TaskActivity[][] = [];
  let currentCluster: TaskActivity[] = [];
  let clusterEnd = 0;

  for (const task of sorted) {
    const start = new Date(task.start_at).getTime();
    const end = task.end_at ? new Date(task.end_at).getTime() : start + 3600000;

    if (currentCluster.length === 0 || start < clusterEnd) {
      currentCluster.push(task);
      clusterEnd = Math.max(clusterEnd, end);
    } else {
      clusters.push(currentCluster);
      currentCluster = [task];
      clusterEnd = end;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // In each cluster, assign columns
  for (const cluster of clusters) {
    const colEnds: number[] = [];
    const assignments: number[] = [];

    for (let i = 0; i < cluster.length; i++) {
      const task = cluster[i];
      const start = new Date(task.start_at).getTime();
      const end = task.end_at ? new Date(task.end_at).getTime() : start + 3600000;

      let assignedCol = -1;
      for (let c = 0; c < colEnds.length; c++) {
        if (colEnds[c] <= start) {
          assignedCol = c;
          colEnds[c] = end;
          break;
        }
      }

      if (assignedCol === -1) {
        assignedCol = colEnds.length;
        colEnds.push(end);
      }

      assignments[i] = assignedCol;
    }

    const totalCols = Math.max(1, colEnds.length);
    for (let i = 0; i < cluster.length; i++) {
      result.set(cluster[i].id, {
        colIndex: assignments[i],
        totalCols,
      });
    }
  }

  return result;
}

export default function WorksheetPage() {
  const {
    currentUser,
    taskActivities,
    activeTask,
    activeTaskElapsedSeconds,
    todayTotalWorkSeconds,
    endActiveTask,
    setEditingTask,
    setIsCreateTaskModalOpen,
    setCreateTaskModalPrefill,
    checkOverlap,
    updateTaskActivity,
  } = useApp();

  // Active View Mode: Day, Week, or Month
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Week");
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Date offsets
  const [dayOffset, setDayOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  // Interaction Guards: ensure background click NEVER opens create modal during/after drag or resize
  const isDraggingOrResizingRef = useRef(false);
  const ignoreNextColumnClickRef = useRef(false);

  // -------------------------------------------------------------
  // Interactive Resize State (Top & Bottom handles, 5-minute precision)
  // -------------------------------------------------------------
  const [resizeState, setResizeState] = useState<{
    taskId: string;
    type: "top" | "bottom";
    durationMinutes: number;
    startMinutes: number;
  } | null>(null);

  const currentResizeRef = useRef<{
    taskId: string;
    type: "top" | "bottom";
    startY: number;
    initialDuration: number;
    startMinutes: number;
    currentDuration: number;
    currentStartMinutes: number;
    pointerId: number;
    task: TaskActivity;
  } | null>(null);

  // -------------------------------------------------------------
  // Interactive Drag-to-Move State (5-minute precision)
  // -------------------------------------------------------------
  const [dragMoveState, setDragMoveState] = useState<{
    taskId: string;
    targetDateStr: string;
    startMinutes: number;
    durationMinutes: number;
  } | null>(null);

  const currentDragStateRef = useRef<{
    task: TaskActivity;
    targetDateStr: string;
    startX: number;
    startY: number;
    initialStartMinutes: number;
    durationMinutes: number;
    currentStartMinutes: number;
    pointerId: number;
    moved: boolean;
  } | null>(null);

  // Global window listeners for pointermove/pointerup to ensure 100% reliability
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      // 1. Resizing in progress
      if (currentResizeRef.current) {
        e.preventDefault();
        const { type, startY, initialDuration, startMinutes, taskId } = currentResizeRef.current;
        const deltaY = e.clientY - startY;
        const rawDeltaMinutes = (deltaY / HOUR_HEIGHT) * 60;
        const snappedDeltaMinutes = Math.round(rawDeltaMinutes / 5) * 5;

        if (type === "bottom") {
          const maxDuration = TOTAL_HOURS * 60 - startMinutes;
          const newDuration = Math.max(5, Math.min(maxDuration, initialDuration + snappedDeltaMinutes));
          currentResizeRef.current.currentDuration = newDuration;

          setResizeState({
            taskId,
            type: "bottom",
            durationMinutes: newDuration,
            startMinutes,
          });
        } else {
          // Top handle: adjusts start time, keeping end time fixed
          const maxStart = startMinutes + initialDuration - 5;
          const newStartMinutes = Math.max(0, Math.min(maxStart, startMinutes + snappedDeltaMinutes));
          const newDuration = (startMinutes + initialDuration) - newStartMinutes;
          currentResizeRef.current.currentStartMinutes = newStartMinutes;
          currentResizeRef.current.currentDuration = newDuration;

          setResizeState({
            taskId,
            type: "top",
            durationMinutes: newDuration,
            startMinutes: newStartMinutes,
          });
        }
        return;
      }

      // 2. Drag-to-move in progress
      if (currentDragStateRef.current) {
        const state = currentDragStateRef.current;
        const deltaX = e.clientX - state.startX;
        const deltaY = e.clientY - state.startY;

        if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
          if (!state.moved) {
            state.moved = true;
            isDraggingOrResizingRef.current = true;
            document.body.style.userSelect = "none";
            document.body.style.cursor = "grabbing";
          }
        }

        if (state.moved) {
          e.preventDefault();
          const rawDeltaMinutes = (deltaY / HOUR_HEIGHT) * 60;
          const snappedDeltaMinutes = Math.round(rawDeltaMinutes / 5) * 5;

          const maxStart = TOTAL_HOURS * 60 - state.durationMinutes;
          const newStartMinutes = Math.max(0, Math.min(maxStart, state.initialStartMinutes + snappedDeltaMinutes));
          state.currentStartMinutes = newStartMinutes;

          // Check if cursor moved to another day column in Week view
          const elemUnder = document.elementFromPoint(e.clientX, e.clientY);
          const dayCol = elemUnder?.closest("[data-column-date]");
          const newDateStr = dayCol?.getAttribute("data-column-date") || state.targetDateStr;
          state.targetDateStr = newDateStr;

          setDragMoveState({
            taskId: state.task.id,
            targetDateStr: newDateStr,
            startMinutes: newStartMinutes,
            durationMinutes: state.durationMinutes,
          });
        }
      }
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      // 1. Finalize Resize
      if (currentResizeRef.current) {
        e.preventDefault();
        e.stopPropagation();

        const resizeData = currentResizeRef.current;
        currentResizeRef.current = null;
        setResizeState(null);

        document.body.style.userSelect = "";
        document.body.style.cursor = "";

        // Lock out column clicks
        ignoreNextColumnClickRef.current = true;
        setTimeout(() => {
          ignoreNextColumnClickRef.current = false;
          isDraggingOrResizingRef.current = false;
        }, 400);

        const { task, type, currentDuration, initialDuration, currentStartMinutes, startMinutes } = resizeData;

        if (type === "bottom" && currentDuration !== initialDuration) {
          const taskStartMs = new Date(task.start_at).getTime();
          const newEndMs = taskStartMs + currentDuration * 60 * 1000;
          const newEndIso = new Date(newEndMs).toISOString();

          const conflict = checkOverlap(task.employee_id, task.start_at, newEndIso, task.id);
          if (conflict) {
            setConflictWarning(`Notice: "${task.title}" now overlaps with "${conflict.title}".`);
            setTimeout(() => setConflictWarning(null), 4000);
          }

          updateTaskActivity(
            task.id,
            { 
              end_at: newEndIso,
              status: task.status === "Ongoing" ? "Completed" : task.status 
            },
            `Resized duration to ${Math.floor(currentDuration / 60)}h ${currentDuration % 60}m via mouse edge drag`
          );
        } else if (type === "top" && currentStartMinutes !== startMinutes) {
          const taskEndMs = task.end_at
            ? new Date(task.end_at).getTime()
            : new Date(task.start_at).getTime() + initialDuration * 60000;
          const newStartMs = taskEndMs - currentDuration * 60000;
          const newStartIso = new Date(newStartMs).toISOString();

          const conflict = checkOverlap(task.employee_id, newStartIso, task.end_at || new Date(taskEndMs).toISOString(), task.id);
          if (conflict) {
            setConflictWarning(`Notice: "${task.title}" now overlaps with "${conflict.title}".`);
            setTimeout(() => setConflictWarning(null), 4000);
          }

          updateTaskActivity(
            task.id,
            { start_at: newStartIso },
            `Adjusted start time to ${minutesFromStartToTime(currentStartMinutes).formatted}`
          );
        }
        return;
      }

      // 2. Finalize Drag-to-Move
      if (currentDragStateRef.current) {
        const dragState = currentDragStateRef.current;
        currentDragStateRef.current = null;
        setDragMoveState(null);

        document.body.style.userSelect = "";
        document.body.style.cursor = "";

        ignoreNextColumnClickRef.current = true;
        setTimeout(() => {
          ignoreNextColumnClickRef.current = false;
          isDraggingOrResizingRef.current = false;
        }, 400);

        if (!dragState.moved) {
          // If clicked without moving, open details/edit
          setEditingTask(dragState.task);
          return;
        }

        // Apply rescheduled time
        const { task, targetDateStr, currentStartMinutes, durationMinutes } = dragState;
        const [year, month, day] = targetDateStr.split("-").map(Number);

        const totalStartMinutes = GRID_START_HOUR * 60 + currentStartMinutes;
        const startHour = Math.floor(totalStartMinutes / 60);
        const startMinute = totalStartMinutes % 60;

        const newStartDate = new Date(year, month - 1, day, startHour, startMinute, 0);
        const newEndDate = new Date(newStartDate.getTime() + durationMinutes * 60 * 1000);

        const newStartIso = newStartDate.toISOString();
        const newEndIso = newEndDate.toISOString();

        const conflict = checkOverlap(task.employee_id, newStartIso, newEndIso, task.id);
        if (conflict) {
          setConflictWarning(`Notice: "${task.title}" now overlaps with "${conflict.title}".`);
          setTimeout(() => setConflictWarning(null), 4000);
        }

        updateTaskActivity(
          task.id,
          { start_at: newStartIso, end_at: newEndIso },
          `Moved to ${targetDateStr} at ${formatHM(startHour, startMinute)}`
        );
      }
    };

    window.addEventListener("pointermove", handleGlobalPointerMove, { passive: false });
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, [checkOverlap, updateTaskActivity, setEditingTask]);

  // Compute Active Week Days
  const getWeekDays = () => {
    const baseDate = new Date("2026-09-21T00:00:00");
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);

    const dayNames = ["MON", "TUE", "WED", "THU", "FRI"];
    return dayNames.map((name, index) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + index);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      const isToday = dateStr === "2026-09-21";
      return {
        name,
        dateNum: d.getDate(),
        dateStr,
        isToday,
      };
    });
  };

  // Compute Active Single Day
  const getActiveDay = () => {
    const d = new Date("2026-09-21T00:00:00");
    d.setDate(d.getDate() + dayOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const isToday = dateStr === "2026-09-21";
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return {
      fullName: dayNames[d.getDay()],
      dateNum: d.getDate(),
      monthName: "September",
      year: 2026,
      dateStr,
      isToday,
    };
  };

  const weekDays = getWeekDays();
  const activeDay = getActiveDay();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === "Day") setDayOffset((prev) => prev - 1);
    else if (viewMode === "Week") setWeekOffset((prev) => prev - 1);
    else if (viewMode === "Month") setMonthOffset((prev) => prev - 1);
  };

  const handleNext = () => {
    if (viewMode === "Day") setDayOffset((prev) => prev + 1);
    else if (viewMode === "Week") setWeekOffset((prev) => prev + 1);
    else if (viewMode === "Month") setMonthOffset((prev) => prev + 1);
  };

  const handleToday = () => {
    setDayOffset(0);
    setWeekOffset(0);
    setMonthOffset(0);
  };

  // Helper to get tasks for a date (comparing local dates)
  const getTasksForDate = (dateStr: string) => {
    return taskActivities.filter((t) => {
      if (t.employee_id !== currentUser.id) return false;
      const d = new Date(t.start_at);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const taskLocalDateStr = `${year}-${month}-${day}`;
      return taskLocalDateStr === dateStr;
    });
  };

  // Empty column click: ONLY triggers if user directly clicked empty grid, NOT after dragging/resizing
  const handleColumnEmptyClick = (dateStr: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingOrResizingRef.current || ignoreNextColumnClickRef.current) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    const target = e.target as HTMLElement;
    if (target.closest("[data-task-card]") || target.closest("[data-resize-handle]")) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const rawMinutes = (clickY / HOUR_HEIGHT) * 60;
    const snappedMinutes = Math.max(0, Math.floor(rawMinutes / 15) * 15);
    const hour = Math.min(20, GRID_START_HOUR + Math.floor(snappedMinutes / 60));
    const minute = snappedMinutes % 60;

    setCreateTaskModalPrefill({ date: dateStr, hour, minute });
    setIsCreateTaskModalOpen(true);
  };

  // -------------------------------------------------------------
  // POINTER DOWN: RESIZE HANDLE (Top or Bottom Edge)
  // -------------------------------------------------------------
  const handleResizePointerDown = (
    task: TaskActivity,
    edge: "top" | "bottom",
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}

    isDraggingOrResizingRef.current = true;
    const startY = e.clientY;
    const initialDuration = getTaskDurationMinutes(task, activeTaskElapsedSeconds);
    const startMinutes = getMinutesFromGridStart(task.start_at);

    document.body.style.userSelect = "none";
    document.body.style.cursor = "ns-resize";

    currentResizeRef.current = {
      task,
      taskId: task.id,
      type: edge,
      startY,
      initialDuration,
      startMinutes,
      currentDuration: initialDuration,
      currentStartMinutes: startMinutes,
      pointerId: e.pointerId,
    };

    setResizeState({
      taskId: task.id,
      type: edge,
      durationMinutes: initialDuration,
      startMinutes,
    });
  };

  // -------------------------------------------------------------
  // POINTER DOWN: CARD BODY (Drag to Move / Click to Details)
  // -------------------------------------------------------------
  const handleCardBodyPointerDown = (
    task: TaskActivity,
    dayDateStr: string,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-resize-handle]") || target.closest("button") || target.closest("a")) {
      return;
    }
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialStartMinutes = getMinutesFromGridStart(task.start_at);
    const duration = getTaskDurationMinutes(task, activeTaskElapsedSeconds);

    currentDragStateRef.current = {
      task,
      targetDateStr: dayDateStr,
      startX,
      startY,
      initialStartMinutes,
      durationMinutes: duration,
      currentStartMinutes: initialStartMinutes,
      pointerId: e.pointerId,
      moved: false,
    };
  };

  // -------------------------------------------------------------
  // Render Day Column Tasks with Continuous Absolute Geometry & Multi-Column Layout
  // -------------------------------------------------------------
  const renderColumnTasks = (dayDateStr: string) => {
    const tasksForDay = getTasksForDate(dayDateStr);
    const layoutMap = computeDayTaskLayout(tasksForDay);

    return tasksForDay.map((task) => {
      const isDraggingThis = dragMoveState?.taskId === task.id;
      const isResizingThis = resizeState?.taskId === task.id;

      if (isDraggingThis && dragMoveState.targetDateStr !== dayDateStr) {
        return null;
      }

      const startMinutes = isDraggingThis
        ? dragMoveState.startMinutes
        : isResizingThis && resizeState.type === "top"
        ? resizeState.startMinutes
        : getMinutesFromGridStart(task.start_at);

      const durationMinutes = isResizingThis
        ? resizeState.durationMinutes
        : isDraggingThis
        ? dragMoveState.durationMinutes
        : getTaskDurationMinutes(task, activeTaskElapsedSeconds);

      const topPx = (startMinutes / 60) * HOUR_HEIGHT;
      // Real-time proportional height in pixels (1 hr = 80px, 8h 15m = 660px, 15m = min 34px)
      const heightPx = Math.max(34, (durationMinutes / 60) * HOUR_HEIGHT);

      const startTimeObj = minutesFromStartToTime(startMinutes);
      const endTimeObj = minutesFromStartToTime(startMinutes + durationMinutes);

      const isOngoing = task.status === "Ongoing";

      // Calculate horizontal positioning (multi-column clustering)
      const layout = layoutMap.get(task.id) || { colIndex: 0, totalCols: 1 };
      const colWidthPercent = 100 / layout.totalCols;
      const leftPercent = layout.colIndex * colWidthPercent;

      const isCompact = heightPx < 52;
      const isMedium = heightPx >= 52 && heightPx < 85;

      return (
        <div
          key={task.id}
          data-task-card="true"
          onClick={(e) => {
            e.stopPropagation();
            if (ignoreNextColumnClickRef.current || isDraggingOrResizingRef.current) return;
          }}
          style={{
            top: `${topPx}px`,
            height: `${heightPx}px`,
            left: `calc(${leftPercent}% + 4px)`,
            width: `calc(${colWidthPercent}% - 8px)`,
            zIndex: isDraggingThis || isResizingThis ? 50 : 10,
            touchAction: "none",
          }}
          className={cn(
            "absolute rounded-2xl border-2 transition-shadow select-none overflow-hidden flex flex-col justify-between group/taskbox",
            isOngoing
              ? "bg-[#EBF7F2] border-[#52C498] text-slate-900 shadow-sm"
              : "bg-white border-blue-200 text-slate-900 shadow-sm hover:border-blue-400",
            (isDraggingThis || isResizingThis) && "ring-4 ring-blue-500/30 shadow-2xl scale-[1.005] opacity-95",
            "cursor-grab active:cursor-grabbing"
          )}
        >
          {/* ========================================================================= */}
          {/* TOP RESIZE EDGE: Drag down/up to adjust start time (5-min precision)     */}
          {/* ========================================================================= */}
          <div
            data-resize-handle="top"
            onPointerDown={(e) => handleResizePointerDown(task, "top", e)}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 inset-x-0 h-4 cursor-ns-resize z-30 touch-none flex items-center justify-center group/top-edge hover:bg-blue-500/15 transition-colors rounded-t-xl"
            title="Drag top edge to adjust start time (5-min snap)"
          >
            <div className="w-12 h-1 bg-transparent group-hover/top-edge:bg-blue-600 rounded-full transition-colors" />
          </div>

          {/* ========================================================================= */}
          {/* CARD INNER BODY: Draggable center area to move / reschedule task          */}
          {/* ========================================================================= */}
          <div
            data-drag-body="true"
            onPointerDown={(e) => handleCardBodyPointerDown(task, dayDateStr, e)}
            className="w-full h-full flex flex-col justify-between pt-2 pb-3 px-2.5 min-w-0"
            title="Click for details. Drag box to reschedule (5-min snap)."
          >
            {/* Compact layout for short duration (< 40 mins) */}
            {isCompact ? (
              <div className="flex items-center justify-between gap-1 w-full pointer-events-none">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {isOngoing && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  )}
                  <h4 className={cn(
                    "font-bold text-xs truncate",
                    isOngoing ? "text-emerald-950 font-extrabold" : "text-blue-700"
                  )}>
                    {task.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    • {startTimeObj.formatted}
                  </span>
                </div>
                <span className={cn(
                  "px-1.5 py-0.2 rounded font-mono text-[9px] font-black shrink-0",
                  isOngoing ? "bg-emerald-200/70 text-emerald-950" : "bg-blue-50 text-blue-800"
                )}>
                  {durationMinutes}m
                </span>
              </div>
            ) : (
              /* Standard / Tall layout */
              <div className="pointer-events-none min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isOngoing && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-[#0D6832] font-black text-[9px] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0D6832] animate-pulse" />
                          Live
                        </span>
                      )}
                      <h4 className={cn(
                        "font-bold text-xs leading-snug truncate",
                        isOngoing ? "text-emerald-950 font-extrabold" : "text-blue-700"
                      )}>
                        {task.title}
                      </h4>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5 font-mono">
                      {startTimeObj.formatted} – {endTimeObj.formatted}
                    </p>
                  </div>

                  {/* Total duration badge */}
                  <div className="text-right shrink-0">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md font-mono text-[10px] font-black",
                      isOngoing ? "bg-emerald-200/70 text-emerald-950" : "bg-blue-50 text-blue-800"
                    )}>
                      {Math.floor(durationMinutes / 60) > 0 ? `${Math.floor(durationMinutes / 60)}h ` : ""}
                      {durationMinutes % 60}m
                    </span>
                  </div>
                </div>

                {/* Description if taller card */}
                {heightPx >= 90 && (
                  <div className="mt-1 pt-1 border-t border-slate-100 text-[11px] text-slate-600 line-clamp-2">
                    {task.description || `${task.category} activity`}
                  </div>
                )}
              </div>
            )}

            {/* Category badge for medium/tall cards */}
            {heightPx >= 65 && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 pointer-events-none mb-1">
                <span className="uppercase font-bold text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                  {task.category}
                </span>
                <span className="text-[9px] text-slate-400 italic hidden sm:inline">
                  Drag edge to resize
                </span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM RESIZE EDGE: Pinned to bottom border, 100% grab zone (5-min snap)   */}
          {/* ========================================================================= */}
          <div
            data-resize-handle="bottom"
            onPointerDown={(e) => handleResizePointerDown(task, "bottom", e)}
            onClick={(e) => e.stopPropagation()}
            className="absolute -bottom-1 inset-x-0 h-6 cursor-ns-resize z-30 touch-none flex flex-col items-center justify-center group/bottom-edge hover:bg-blue-500/15 transition-colors rounded-b-xl border-t border-slate-200/50 bg-slate-50/50"
            title="Drag bottom edge to resize duration (5-min snap)"
          >
            <div className="w-16 h-1.5 bg-slate-300 group-hover/bottom-edge:bg-blue-600 group-hover/taskbox:bg-blue-500 rounded-full transition-colors shadow-2xs" />
          </div>

          {/* Floating live duration badge while resizing */}
          {isResizingThis && (
            <div className="absolute top-1 right-2 z-40 bg-blue-600 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg pointer-events-none animate-pulse">
              {startTimeObj.formatted} – {endTimeObj.formatted} ({Math.floor(durationMinutes / 60) > 0 ? `${Math.floor(durationMinutes / 60)}h ` : ""}{durationMinutes % 60}m)
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header & View Controls Bar (Light Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              My Worksheet
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
              {viewMode} View
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            {viewMode === "Day" && `${activeDay.fullName}, ${activeDay.dateNum} ${activeDay.monthName} ${activeDay.year}`}
            {viewMode === "Week" && "Monday, 21 September – Friday, 25 September 2026"}
            {viewMode === "Month" && "September 2026"}
          </p>
        </div>

        {/* Date Navigation & View Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Navigation Controls (< Today >) */}
          <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-200/90 shadow-2xs">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-bold text-slate-800 hover:bg-white rounded-xl transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Day / Week / Month Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/90 shadow-2xs">
            <button
              onClick={() => setViewMode("Day")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                viewMode === "Day"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              )}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("Week")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                viewMode === "Week"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("Month")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                viewMode === "Month"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              )}
            >
              Month
            </button>
          </div>

          {/* + Add Task Button */}
          <button
            onClick={() => {
              setCreateTaskModalPrefill(null);
              setIsCreateTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* Conflict Warning Toast */}
      {conflictWarning && (
        <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{conflictWarning}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: WEEK VIEW (Continuous Absolute 5-Minute Time Grid)                */}
      {/* ========================================================================= */}
      {viewMode === "Week" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* Column Header: Time | MON 21 | TUE 22 | WED 23 | THU 24 | FRI 25 */}
              <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-slate-50 text-slate-700 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                <div className="p-3 text-center text-slate-400 border-r border-slate-200 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                {weekDays.map((day) => (
                  <div
                    key={day.name}
                    className={cn(
                      "p-3 text-center border-r border-slate-200 last:border-r-0 font-extrabold tracking-wide transition-colors",
                      day.isToday ? "bg-blue-50/80 text-blue-700 border-b-2 border-b-blue-600" : "text-slate-700"
                    )}
                  >
                    <span>{day.name} {day.dateNum}</span>
                    {day.isToday && (
                      <span className="block text-[9px] font-bold text-emerald-600 normal-case tracking-normal">
                        Today
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Grid Body: Left Time Ticks + 5 Continuous Absolute Day Columns */}
              <div
                style={{ height: `${TOTAL_HEIGHT}px` }}
                className="grid grid-cols-[80px_repeat(5,1fr)] bg-white relative"
              >
                {/* Time Axis Column */}
                <div className="border-r border-slate-200/80 bg-slate-50/40 relative select-none">
                  {HOURS.map((hour, idx) => (
                    <div
                      key={hour}
                      style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                      className="absolute inset-x-0 border-b border-slate-200/60 p-2 text-center text-xs font-bold text-slate-400 flex items-start justify-center pt-2"
                    >
                      {hour % 12 === 0 ? 12 : hour % 12}:00
                    </div>
                  ))}
                </div>

                {/* 5 Day Columns */}
                {weekDays.map((day) => (
                  <div
                    key={day.name}
                    data-column-date={day.dateStr}
                    onClick={(e) => handleColumnEmptyClick(day.dateStr, e)}
                    className={cn(
                      "relative border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors",
                      day.isToday ? "bg-blue-50/15" : "bg-white",
                      "hover:bg-slate-50/30"
                    )}
                  >
                    {/* Background Hour Lines (80px per hour with 30-min dashed midpoints) */}
                    {HOURS.map((_, idx) => (
                      <div
                        key={idx}
                        style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                        className="absolute inset-x-0 border-b border-slate-100 pointer-events-none"
                      >
                        <div className="w-full h-1/2 border-b border-dashed border-slate-100/80" />
                      </div>
                    ))}

                    {/* Foreground Tasks Layer */}
                    {renderColumnTasks(day.dateStr)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compact Summary bar at bottom (Light Theme) */}
          <div className="p-4 sm:p-5 bg-slate-50 text-slate-800 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Today&apos;s logged work duration</span>
            </div>

            <div className="text-slate-900 font-black text-sm sm:text-base font-mono">
              {formatSecondsToHuman(todayTotalWorkSeconds)}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DAY VIEW (Continuous Absolute 5-Minute Time Grid)                 */}
      {/* ========================================================================= */}
      {viewMode === "Day" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Day View Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {activeDay.fullName}
              </span>
              <h2 className="text-lg font-black text-slate-900">
                {activeDay.fullName}, {activeDay.dateNum} {activeDay.monthName} {activeDay.year}
              </h2>
            </div>
            {activeDay.isToday && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                ● Today
              </span>
            )}
          </div>

          {/* Single Day Continuous Absolute Grid */}
          <div
            style={{ height: `${TOTAL_HEIGHT}px` }}
            className="grid grid-cols-[100px_1fr] bg-white relative"
          >
            {/* Left Time Axis */}
            <div className="border-r border-slate-200/80 bg-slate-50/40 relative select-none">
              {HOURS.map((hour, idx) => (
                <div
                  key={hour}
                  style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                  className="absolute inset-x-0 border-b border-slate-200/60 p-2 text-center text-xs font-bold text-slate-400 flex items-start justify-center pt-2"
                >
                  {hour % 12 === 0 ? 12 : hour % 12}:00 {hour >= 12 ? "PM" : "AM"}
                </div>
              ))}
            </div>

            {/* Day Column with Background Grid and Tasks */}
            <div
              data-column-date={activeDay.dateStr}
              onClick={(e) => handleColumnEmptyClick(activeDay.dateStr, e)}
              className={cn(
                "relative cursor-pointer transition-colors",
                activeDay.isToday ? "bg-blue-50/15" : "bg-white",
                "hover:bg-slate-50/30"
              )}
            >
              {HOURS.map((_, idx) => (
                <div
                  key={idx}
                  style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                  className="absolute inset-x-0 border-b border-slate-100 pointer-events-none"
                >
                  <div className="w-full h-1/2 border-b border-dashed border-slate-100/80" />
                </div>
              ))}

              {renderColumnTasks(activeDay.dateStr)}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: MONTH VIEW (Full Monthly Calendar Grid with Task Chips)           */}
      {/* ========================================================================= */}
      {viewMode === "Month" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Month Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              September 2026
            </h2>
            <span className="text-xs font-bold text-slate-500">
              Click any date to log work or view tasks
            </span>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-slate-50/60 border-b border-slate-200 text-center text-xs font-bold text-slate-600 uppercase py-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-white">
            <div className="p-2 min-h-[100px] bg-slate-50/30 text-slate-300 text-xs">
              31
            </div>

            {Array.from({ length: 30 }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `2026-09-${String(dayNum).padStart(2, "0")}`;
              const isToday = dayNum === 21;
              const tasksForThisDay = getTasksForDate(dateStr);

              return (
                <div
                  key={dayNum}
                  onClick={() => {
                    setCreateTaskModalPrefill({ date: dateStr, hour: 9, minute: 0 });
                    setIsCreateTaskModalOpen(true);
                  }}
                  className={cn(
                    "p-2 min-h-[105px] transition-colors cursor-pointer relative group",
                    isToday ? "bg-blue-50/20" : "hover:bg-slate-50/70"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        isToday ? "bg-blue-600 text-white shadow-xs" : "text-slate-700"
                      )}
                    >
                      {dayNum}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCreateTaskModalPrefill({ date: dateStr, hour: 9, minute: 0 });
                        setIsCreateTaskModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-opacity"
                      title="Add task on this date"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Task Chips */}
                  <div className="mt-1.5 space-y-1">
                    {tasksForThisDay.map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(t);
                        }}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold truncate transition-transform hover:scale-102 cursor-pointer shadow-2xs",
                          t.status === "Ongoing"
                            ? "bg-[#EBF7F2] text-[#0D6832] border border-[#A3E6CD]"
                            : "bg-blue-50 text-blue-800 border border-blue-200/80 hover:bg-blue-100"
                        )}
                        title={`${t.title} (${formatTimeAmPm(t.start_at)})`}
                      >
                        {formatTimeAmPm(t.start_at)} {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="p-2 min-h-[100px] bg-slate-50/30 text-slate-300 text-xs">
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
