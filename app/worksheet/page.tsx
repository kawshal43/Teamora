"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  AlertTriangle,
  GripHorizontal,
  Calendar as CalendarIcon,
  ArrowRight
} from "lucide-react";
import { 
  useApp, 
  formatSecondsToDigital, 
  formatSecondsToHuman, 
  formatTimeAmPm 
} from "@/context/AppContext";
import { TaskActivity } from "@/types";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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

// Strict single-column layout for personal worksheet (tasks never overlap)
interface LayoutPosition {
  colIndex: number;
  totalCols: number;
}

function computeDayTaskLayout(tasks: TaskActivity[]): Map<string, LayoutPosition> {
  const result = new Map<string, LayoutPosition>();
  for (const task of tasks) {
    result.set(task.id, {
      colIndex: 0,
      totalCols: 1,
    });
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
    updateMultipleTasks,
  } = useApp();

  // Active View Mode: Day, Week, or Month
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Week");
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Date offsets
  const [dayOffset, setDayOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  // Selected date for Month View day tasks popup
  const [selectedMonthDate, setSelectedMonthDate] = useState<string | null>(null);

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

  // Fresh taskActivities ref to avoid stale closure in global pointer listeners
  const taskActivitiesRef = useRef(taskActivities);
  useEffect(() => {
    taskActivitiesRef.current = taskActivities;
  }, [taskActivities]);

  // Global window listeners for pointermove/pointerup to ensure 100% reliability
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      // 1. Resizing in progress
      if (currentResizeRef.current) {
        e.preventDefault();
        const { type, startY, initialDuration, startMinutes, taskId, task } = currentResizeRef.current;
        const deltaY = e.clientY - startY;
        const rawDeltaMinutes = (deltaY / HOUR_HEIGHT) * 60;
        const snappedDeltaMinutes = Math.round(rawDeltaMinutes / 5) * 5;

        const taskStartMs = new Date(task.start_at).getTime();
        const d = new Date(task.start_at);
        const taskDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        const otherTasks = (taskActivitiesRef.current || []).filter((t) => {
          if (t.id === taskId || t.employee_id !== currentUser.id) return false;
          const td = new Date(t.start_at);
          const tDateStr = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, "0")}-${String(td.getDate()).padStart(2, "0")}`;
          return tDateStr === taskDateStr;
        });

        if (type === "bottom") {
          // Find next task immediately below
          const nextTasks = otherTasks
            .filter((t) => new Date(t.start_at).getTime() >= taskStartMs)
            .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
          const nextTask = nextTasks[0] || null;

          const maxAllowedDuration = nextTask
            ? Math.max(5, Math.floor((new Date(nextTask.start_at).getTime() - taskStartMs) / 60000))
            : TOTAL_HOURS * 60 - startMinutes;

          let newDuration = Math.max(5, initialDuration + snappedDeltaMinutes);

          if (newDuration >= maxAllowedDuration) {
            newDuration = maxAllowedDuration;
            if (nextTask && snappedDeltaMinutes > 0) {
              setConflictWarning(`Cannot overlap: Reached start boundary of "${nextTask.title}".`);
            }
          }

          currentResizeRef.current.currentDuration = newDuration;

          setResizeState({
            taskId,
            type: "bottom",
            durationMinutes: newDuration,
            startMinutes,
          });
        } else {
          // Top handle: adjusts start time, keeping end time fixed
          // Find immediate preceding task (task above)
          const prevTasks = otherTasks
            .filter((t) => new Date(t.start_at).getTime() < taskStartMs)
            .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
          const prevTask = prevTasks[0] || null;

          const maxStart = startMinutes + initialDuration - 5;
          let rawNewStart = startMinutes + snappedDeltaMinutes;
          let newStartMinutes = Math.max(0, Math.min(maxStart, rawNewStart));

          // If pushing into prevTask: "above box must go upper, or give a verning"
          if (prevTask) {
            const prevStartMin = getMinutesFromGridStart(prevTask.start_at);
            const minAllowedStart = prevStartMin + 5; // prevTask needs at least 5 minutes
            if (newStartMinutes < minAllowedStart) {
              newStartMinutes = minAllowedStart;
              setConflictWarning(`Cannot extend further: "${prevTask.title}" reached 5-minute minimum duration.`);
            } else {
              const prevEndMin = prevTask.end_at ? getMinutesFromGridStart(prevTask.end_at) : prevStartMin + 60;
              if (newStartMinutes < prevEndMin) {
                setConflictWarning(`Above box "${prevTask.title}" will go upper to prevent overlap.`);
              }
            }
          }

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

        if (type === "bottom") {
          const taskStartMs = new Date(task.start_at).getTime();
          const d = new Date(task.start_at);
          const taskDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

          const otherTasks = (taskActivitiesRef.current || []).filter((t) => {
            if (t.id === task.id || t.employee_id !== currentUser.id) return false;
            const td = new Date(t.start_at);
            const tDateStr = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, "0")}-${String(td.getDate()).padStart(2, "0")}`;
            return tDateStr === taskDateStr;
          });

          const nextTasks = otherTasks
            .filter((t) => new Date(t.start_at).getTime() >= taskStartMs)
            .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
          const nextTask = nextTasks[0] || null;

          const maxDurationLimit = nextTask
            ? Math.max(5, Math.floor((new Date(nextTask.start_at).getTime() - taskStartMs) / 60000))
            : TOTAL_HOURS * 60 - startMinutes;

          const finalDuration = Math.min(currentDuration, maxDurationLimit);
          const newEndMs = taskStartMs + finalDuration * 60 * 1000;
          const newEndIso = new Date(newEndMs).toISOString();

          updateTaskActivity(
            task.id,
            { 
              end_at: newEndIso,
              status: task.status === "Ongoing" ? "Completed" : task.status 
            },
            `Resized duration to ${Math.floor(finalDuration / 60)}h ${finalDuration % 60}m via mouse edge drag`
          );

          if (currentDuration > maxDurationLimit) {
            setConflictWarning(`Notice: Clamped to avoid overlap with "${nextTask?.title}".`);
            setTimeout(() => setConflictWarning(null), 4000);
          }
        } else if (type === "top") {
          const taskEndMs = task.end_at
            ? new Date(task.end_at).getTime()
            : new Date(task.start_at).getTime() + initialDuration * 60000;
          const newStartMs = taskEndMs - currentDuration * 60000;
          const newStartIso = new Date(newStartMs).toISOString();

          const d = new Date(task.start_at);
          const taskDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

          const otherTasks = (taskActivitiesRef.current || []).filter((t) => {
            if (t.id === task.id || t.employee_id !== currentUser.id) return false;
            const td = new Date(t.start_at);
            const tDateStr = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, "0")}-${String(td.getDate()).padStart(2, "0")}`;
            return tDateStr === taskDateStr;
          });

          const prevTasks = otherTasks
            .filter((t) => new Date(t.start_at).getTime() < new Date(task.start_at).getTime())
            .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
          const prevTask = prevTasks[0] || null;

          if (prevTask) {
            const prevEndMs = prevTask.end_at
              ? new Date(prevTask.end_at).getTime()
              : new Date(prevTask.start_at).getTime() + (prevTask.duration_seconds || 3600) * 1000;

            if (newStartMs < prevEndMs) {
              // "above box must go upper"!
              updateMultipleTasks([
                {
                  taskId: prevTask.id,
                  updates: { end_at: newStartIso },
                  reason: `Above box adjusted upper to accommodate "${task.title}"`,
                },
                {
                  taskId: task.id,
                  updates: { start_at: newStartIso },
                  reason: `Adjusted start time to ${minutesFromStartToTime(currentStartMinutes).formatted}`,
                },
              ]);
              setConflictWarning(`Notice: "${prevTask.title}" moved upper to prevent overlap.`);
              setTimeout(() => setConflictWarning(null), 4000);
              return;
            }
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

        const newStartMs = newStartDate.getTime();
        const newEndMs = newEndDate.getTime();

        const otherTasksOnDay = (taskActivitiesRef.current || [])
          .filter((t) => {
            if (t.id === task.id || t.employee_id !== currentUser.id) return false;
            const td = new Date(t.start_at);
            const tDateStr = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, "0")}-${String(td.getDate()).padStart(2, "0")}`;
            return tDateStr === targetDateStr;
          })
          .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

        const conflict = checkOverlap(task.employee_id, newStartIso, newEndIso, task.id);

        if (conflict) {
          const conflictStartMs = new Date(conflict.start_at).getTime();
          const conflictEndMs = conflict.end_at
            ? new Date(conflict.end_at).getTime()
            : conflictStartMs + (conflict.duration_seconds || 3600) * 1000;

          // User placed task overlapping into above box: "above box must go upper, or give a verning"
          if (conflictStartMs <= newStartMs && conflictEndMs > newStartMs) {
            if (newStartMs >= conflictStartMs + 5 * 60 * 1000) {
              // Check if there is also an overlapping task BELOW
              const conflictBelow = otherTasksOnDay.find(
                (t) => t.id !== conflict.id && new Date(t.start_at).getTime() < newEndMs && new Date(t.start_at).getTime() >= newStartMs
              );

              if (conflictBelow) {
                setConflictWarning(`Cannot overlap with "${conflictBelow.title}". Reverted to prevent overlap.`);
                setTimeout(() => setConflictWarning(null), 4000);
                return;
              }

              // Above box goes upper!
              updateMultipleTasks([
                {
                  taskId: conflict.id,
                  updates: { end_at: newStartIso },
                  reason: `Above box adjusted upper to prevent overlap with "${task.title}"`,
                },
                {
                  taskId: task.id,
                  updates: { start_at: newStartIso, end_at: newEndIso },
                  reason: `Moved to ${targetDateStr} at ${formatHM(startHour, startMinute)}`,
                },
              ]);
              setConflictWarning(`Notice: "${conflict.title}" adjusted upper to prevent overlap.`);
              setTimeout(() => setConflictWarning(null), 4000);
              return;
            } else {
              setConflictWarning(`Cannot overlap: "${conflict.title}" has insufficient space to go upper. Reverted.`);
              setTimeout(() => setConflictWarning(null), 4000);
              return;
            }
          } else {
            // Conflict with below box or surrounded
            setConflictWarning(`Cannot overlap with "${conflict.title}". Reverted to prevent overlap.`);
            setTimeout(() => setConflictWarning(null), 4000);
            return;
          }
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
  }, [checkOverlap, updateTaskActivity, updateMultipleTasks, setEditingTask, currentUser]);

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

  const formatSelectedDateTitle = (dateStr: string | null) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-").map(Number);
    if (parts.length < 3) return dateStr;
    const [y, m, d] = parts;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDayTotalMinutes = (tasks: TaskActivity[]) => {
    return tasks.reduce((sum, t) => sum + getTaskDurationMinutes(t, activeTaskElapsedSeconds), 0);
  };

  const formatMinutesToHuman = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0 && m === 0) return "0m";
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const selectedDateTasks = selectedMonthDate
    ? getTasksForDate(selectedMonthDate).sort(
        (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      )
    : [];

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
              ? "bg-[#EBF7F2] dark:bg-emerald-950/40 border-[#52C498] dark:border-emerald-600 text-slate-900 dark:text-slate-100 shadow-sm"
              : "bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/60 text-slate-900 dark:text-slate-100 shadow-sm hover:border-blue-400 dark:hover:border-blue-500",
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
                    isOngoing ? "text-emerald-950 dark:text-emerald-300 font-extrabold" : "text-blue-700 dark:text-blue-400"
                  )}>
                    {task.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
                    • {startTimeObj.formatted}
                  </span>
                </div>
                <span className={cn(
                  "px-1.5 py-0.2 rounded font-mono text-[9px] font-black shrink-0",
                  isOngoing ? "bg-emerald-200/70 dark:bg-emerald-900/70 text-emerald-950 dark:text-emerald-200" : "bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300"
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
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 font-black text-[9px] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0D6832] dark:bg-emerald-400 animate-pulse" />
                          Live
                        </span>
                      )}
                      <h4 className={cn(
                        "font-bold text-xs leading-snug truncate",
                        isOngoing ? "text-emerald-950 dark:text-emerald-300 font-extrabold" : "text-blue-700 dark:text-blue-400"
                      )}>
                        {task.title}
                      </h4>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                      {startTimeObj.formatted} – {endTimeObj.formatted}
                    </p>
                  </div>

                  {/* Total duration badge */}
                  <div className="text-right shrink-0">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md font-mono text-[10px] font-black",
                      isOngoing ? "bg-emerald-200/70 dark:bg-emerald-900/70 text-emerald-950 dark:text-emerald-200" : "bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300"
                    )}>
                      {Math.floor(durationMinutes / 60) > 0 ? `${Math.floor(durationMinutes / 60)}h ` : ""}
                      {durationMinutes % 60}m
                    </span>
                  </div>
                </div>

                {/* Description if taller card */}
                {heightPx >= 90 && (
                  <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    {task.description || `${task.category} activity`}
                  </div>
                )}
              </div>
            )}

            {/* Category badge for medium/tall cards */}
            {heightPx >= 65 && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 pointer-events-none mb-1">
                <span className="uppercase font-bold text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                  {task.category}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 italic hidden sm:inline">
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
            className="absolute -bottom-1 inset-x-0 h-6 cursor-ns-resize z-30 touch-none flex flex-col items-center justify-center group/bottom-edge hover:bg-blue-500/15 transition-colors rounded-b-xl border-t border-slate-200/50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50"
            title="Drag bottom edge to resize duration (5-min snap)"
          >
            <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-700 group-hover/bottom-edge:bg-blue-600 group-hover/taskbox:bg-blue-500 rounded-full transition-colors shadow-2xs" />
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
      {/* Top Header & View Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              My Worksheet
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              {viewMode} View
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {viewMode === "Day" && `${activeDay.fullName}, ${activeDay.dateNum} ${activeDay.monthName} ${activeDay.year}`}
            {viewMode === "Week" && "Monday, 21 September – Friday, 25 September 2026"}
            {viewMode === "Month" && "September 2026"}
          </p>
        </div>

        {/* Date Navigation & View Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Navigation Controls (< Today >) */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Day / Week / Month Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs">
            <button
              onClick={() => setViewMode("Day")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                viewMode === "Day"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700"
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
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700"
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
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700"
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
        <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-900 dark:text-amber-200 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{conflictWarning}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: WEEK VIEW (Continuous Absolute 5-Minute Time Grid)                */}
      {/* ========================================================================= */}
      {viewMode === "Week" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* Column Header: Time | MON 21 | TUE 22 | WED 23 | THU 24 | FRI 25 */}
              <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider">
                <div className="p-3 text-center text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                {weekDays.map((day) => (
                  <div
                    key={day.name}
                    className={cn(
                      "p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-extrabold tracking-wide transition-colors",
                      day.isToday ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-b-2 border-b-blue-600" : "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <span>{day.name} {day.dateNum}</span>
                    {day.isToday && (
                      <span className="block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 normal-case tracking-normal">
                        Today
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Grid Body: Left Time Ticks + 5 Continuous Absolute Day Columns */}
              <div
                style={{ height: `${TOTAL_HEIGHT}px` }}
                className="grid grid-cols-[80px_repeat(5,1fr)] bg-white dark:bg-slate-900 relative"
              >
                {/* Time Axis Column */}
                <div className="border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/60 relative select-none">
                  {HOURS.map((hour, idx) => (
                    <div
                      key={hour}
                      style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                      className="absolute inset-x-0 border-b border-slate-200/60 dark:border-slate-800/80 p-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 flex items-start justify-center pt-2"
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
                      "relative border-r border-slate-100 dark:border-slate-800/80 last:border-r-0 cursor-pointer transition-colors",
                      day.isToday ? "bg-blue-50/15 dark:bg-blue-950/20" : "bg-white dark:bg-slate-900",
                      "hover:bg-slate-50/30 dark:hover:bg-slate-800/30"
                    )}
                  >
                    {/* Background Hour Lines (80px per hour with 30-min dashed midpoints) */}
                    {HOURS.map((_, idx) => (
                      <div
                        key={idx}
                        style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                        className="absolute inset-x-0 border-b border-slate-100 dark:border-slate-800/60 pointer-events-none"
                      >
                        <div className="w-full h-1/2 border-b border-dashed border-slate-100/80 dark:border-slate-800/40" />
                      </div>
                    ))}

                    {/* Foreground Tasks Layer */}
                    {renderColumnTasks(day.dateStr)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compact Summary bar at bottom */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Today&apos;s logged work duration</span>
            </div>

            <div className="text-slate-900 dark:text-white font-black text-sm sm:text-base font-mono">
              {formatSecondsToHuman(todayTotalWorkSeconds)}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DAY VIEW (Continuous Absolute 5-Minute Time Grid)                 */}
      {/* ========================================================================= */}
      {viewMode === "Day" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Day View Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {activeDay.fullName}
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {activeDay.fullName}, {activeDay.dateNum} {activeDay.monthName} {activeDay.year}
              </h2>
            </div>
            {activeDay.isToday && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                ● Today
              </span>
            )}
          </div>

          {/* Single Day Continuous Absolute Grid */}
          <div
            style={{ height: `${TOTAL_HEIGHT}px` }}
            className="grid grid-cols-[100px_1fr] bg-white dark:bg-slate-900 relative"
          >
            {/* Left Time Axis */}
            <div className="border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/60 relative select-none">
              {HOURS.map((hour, idx) => (
                <div
                  key={hour}
                  style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                  className="absolute inset-x-0 border-b border-slate-200/60 dark:border-slate-800/80 p-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 flex items-start justify-center pt-2"
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
                activeDay.isToday ? "bg-blue-50/15 dark:bg-blue-950/20" : "bg-white dark:bg-slate-900",
                "hover:bg-slate-50/30 dark:hover:bg-slate-800/30"
              )}
            >
              {HOURS.map((_, idx) => (
                <div
                  key={idx}
                  style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                  className="absolute inset-x-0 border-b border-slate-100 dark:border-slate-800/60 pointer-events-none"
                >
                  <div className="w-full h-1/2 border-b border-dashed border-slate-100/80 dark:border-slate-800/40" />
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Month Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              September 2026
            </h2>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Click any date to log work or view tasks
            </span>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-slate-50/60 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase py-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            <div 
              onClick={() => setSelectedMonthDate("2026-08-31")}
              className="p-2 min-h-[100px] bg-slate-50/30 dark:bg-slate-950/50 text-slate-300 dark:text-slate-600 text-xs cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors"
            >
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
                    setSelectedMonthDate(dateStr);
                  }}
                  className={cn(
                    "p-2 min-h-[105px] transition-colors cursor-pointer relative group",
                    isToday ? "bg-blue-50/20 dark:bg-blue-950/30" : "hover:bg-slate-50/70 dark:hover:bg-slate-800/50",
                    selectedMonthDate === dateStr && "ring-2 ring-blue-500/40 bg-blue-50/30 dark:bg-blue-950/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        isToday ? "bg-blue-600 text-white shadow-xs" : "text-slate-700 dark:text-slate-300"
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
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-opacity"
                      title="Add task on this date"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Task Chips */}
                  <div className="mt-1.5 space-y-1">
                    {tasksForThisDay.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMonthDate(dateStr);
                        }}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold truncate transition-transform hover:scale-102 cursor-pointer shadow-2xs",
                          t.status === "Ongoing"
                            ? "bg-[#EBF7F2] dark:bg-emerald-950/60 text-[#0D6832] dark:text-emerald-300 border border-[#A3E6CD] dark:border-emerald-700"
                            : "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60"
                        )}
                        title={`${t.title} (${formatTimeAmPm(t.start_at)})`}
                      >
                        {formatTimeAmPm(t.start_at)} {t.title}
                      </div>
                    ))}
                    {tasksForThisDay.length > 3 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMonthDate(dateStr);
                        }}
                        className="px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        +{tasksForThisDay.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {Array.from({ length: 4 }).map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedMonthDate(`2026-10-0${idx + 1}`)}
                className="p-2 min-h-[100px] bg-slate-50/30 dark:bg-slate-950/50 text-slate-300 dark:text-slate-600 text-xs cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors"
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MONTH VIEW - DAY TASKS POPUP                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!selectedMonthDate}
        onClose={() => setSelectedMonthDate(null)}
        maxWidth="lg"
        title={selectedMonthDate ? formatSelectedDateTitle(selectedMonthDate) : ""}
        description={
          selectedMonthDate === "2026-09-21"
            ? "Today • Detailed list of all tasks and logged time"
            : "Detailed list of all tasks and logged time for this date"
        }
      >
        {selectedMonthDate && (
          <div className="space-y-4">
            {/* Top Stat Summary Bar */}
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatMinutesToHuman(getDayTotalMinutes(selectedDateTasks))}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">logged</span>
                </div>
                <div className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                  {selectedDateTasks.length} {selectedDateTasks.length === 1 ? "task" : "tasks"}
                </div>
                {selectedMonthDate === "2026-09-21" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    Today
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const clickedDate = new Date(`${selectedMonthDate}T00:00:00`);
                    const baseDate = new Date("2026-09-21T00:00:00");
                    const diffDays = Math.round((clickedDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
                    setDayOffset(diffDays);
                    setViewMode("Day");
                    setSelectedMonthDate(null);
                  }}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Open full timeline in Day View"
                >
                  <span>Day View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setCreateTaskModalPrefill({ date: selectedMonthDate, hour: 9, minute: 0 });
                    setIsCreateTaskModalOpen(true);
                    setSelectedMonthDate(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Tasks List */}
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-blue-400">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No tasks on this day</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  There are no logged or scheduled tasks for this date.
                </p>
                <button
                  onClick={() => {
                    setCreateTaskModalPrefill({ date: selectedMonthDate, hour: 9, minute: 0 });
                    setIsCreateTaskModalOpen(true);
                    setSelectedMonthDate(null);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create a Task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                {selectedDateTasks.map((task) => {
                  const isOngoing = task.status === "Ongoing";
                  const durationMin = getTaskDurationMinutes(task, activeTaskElapsedSeconds);
                  const durationStr = formatMinutesToHuman(durationMin);

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setEditingTask(task);
                        setSelectedMonthDate(null);
                      }}
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between gap-3",
                        isOngoing
                          ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300"
                          : "bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xs"
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                            isOngoing
                              ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                              : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                          )}
                        >
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {task.title}
                            </h4>
                            {isOngoing ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EBF7F2] dark:bg-emerald-950/80 text-[#0D6832] dark:text-emerald-300 border border-[#A3E6CD] dark:border-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0D6832] dark:bg-emerald-400 animate-pulse" />
                                Live Task
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                Completed
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            <span className="font-medium">
                              {formatTimeAmPm(task.start_at)}
                              {task.end_at ? ` – ${formatTimeAmPm(task.end_at)}` : " (Ongoing)"}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {durationStr}
                            </span>
                            {task.category && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400 dark:text-slate-500">
                                  {task.category}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                          Edit →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const clickedDate = new Date(`${selectedMonthDate}T00:00:00`);
                  const baseDate = new Date("2026-09-21T00:00:00");
                  const diffDays = Math.round((clickedDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
                  setDayOffset(diffDays);
                  setViewMode("Day");
                  setSelectedMonthDate(null);
                }}
                className="sm:hidden inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400"
              >
                <span>Open in Day View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="hidden sm:block" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedMonthDate(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
