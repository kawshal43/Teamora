"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Calendar as CalendarIcon, 
  FileSearch, 
  Clock, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  History, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  PlaneTakeoff,
  Search,
  Filter,
  X,
  Check,
  Eye
} from "lucide-react";
import { 
  useApp, 
  formatSecondsToDigital, 
  formatSecondsToHuman, 
  formatTimeAmPm 
} from "@/context/AppContext";
import { TaskActivity, UserProfile, LeaveRequest } from "@/types";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

export default function AdminWorksheetPage() {
  const {
    currentUser,
    allEmployees,
    taskActivities,
    taskRevisions,
    activeTaskElapsedSeconds,
    leaveRequests,
    setEmployeeLeaveStatus,
  } = useApp();

  // Three internal views: Team Overview (Default as requested), Employee Calendar, Task Details
  const [activeSubView, setActiveSubView] = useState<"team_overview" | "employee_calendar" | "task_details">("team_overview");

  // Selected employee for calendar view (Defaults to Nimal Perera or first available)
  const defaultNimal = allEmployees.find((e) => e.first_name === "Nimal") || allEmployees[0];
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(defaultNimal.id);

  // Selected task for Task Details view
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>("act-live-nimal");

  // View mode for calendar: Day / Week / Month
  const [calendarViewMode, setCalendarViewMode] = useState<"Day" | "Week" | "Month">("Week");

  // Selected date for Month View day tasks popup
  const [selectedMonthDate, setSelectedMonthDate] = useState<string | null>(null);

  // Day offset for Day view navigation
  const [dayOffset, setDayOffset] = useState(0);

  // Search and status filter for Team Overview
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "working" | "leave" | "completed" | "idle">("all");

  // Quick leave toggle modal state
  const [leaveModalEmployee, setLeaveModalEmployee] = useState<UserProfile | null>(null);
  const [leaveTypeInput, setLeaveTypeInput] = useState<LeaveRequest["leave_type"]>("Annual");
  const [leaveReasonInput, setLeaveReasonInput] = useState("Approved personal vacation and travel.");

  const selectedEmployee = allEmployees.find((e) => e.id === selectedEmployeeId) || defaultNimal;

  // Filter tasks for selected employee
  const employeeTasks = taskActivities.filter((t) => t.employee_id === selectedEmployee.id);
  const employeeOngoingTask = employeeTasks.find((t) => t.status === "Ongoing") || null;

  const todayDateStr = "2026-09-21";
  const employeeTodayCompleted = employeeTasks.filter(
    (t) => t.status === "Completed" && (t.start_at.startsWith(todayDateStr) || (t.end_at && t.end_at.startsWith(todayDateStr)))
  );

  const employeeCompletedSeconds = employeeTodayCompleted.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
  const employeeTotalSeconds = employeeCompletedSeconds + (employeeOngoingTask ? activeTaskElapsedSeconds : 0);

  // Leave detection helpers
  const getEmployeeLeaveToday = (empId: string): LeaveRequest | undefined => {
    return leaveRequests.find(
      (l) => l.user_id === empId && l.status === "approved" && l.start_date <= todayDateStr && l.end_date >= todayDateStr
    );
  };

  const getEmployeeLeaveForDate = (empId: string, dateStr: string): LeaveRequest | undefined => {
    return leaveRequests.find(
      (l) => l.user_id === empId && l.status === "approved" && l.start_date <= dateStr && l.end_date >= dateStr
    );
  };

  const selectedEmployeeLeave = getEmployeeLeaveToday(selectedEmployee.id);

  // Time grid hours: 8:00 AM to 6:00 PM (Week view) and 8:00 AM to 9:00 PM (Day view)
  const WEEK_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const DAY_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const WEEK_DAYS = [
    { name: "MON", dateNum: 21, dateStr: "2026-09-21", isToday: true },
    { name: "TUE", dateNum: 22, dateStr: "2026-09-22", isToday: false },
    { name: "WED", dateNum: 23, dateStr: "2026-09-23", isToday: false },
    { name: "THU", dateNum: 24, dateStr: "2026-09-24", isToday: false },
    { name: "FRI", dateNum: 25, dateStr: "2026-09-25", isToday: false },
  ];

  // Helper for active day in Day view
  const getActiveDayInfo = () => {
    const base = new Date("2026-09-21T00:00:00");
    base.setDate(base.getDate() + dayOffset);
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, "0");
    const d = String(base.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return {
      name: dayNames[base.getDay()],
      dateNum: base.getDate(),
      monthName: "September",
      year: y,
      dateStr,
      isToday: dateStr === "2026-09-21",
    };
  };

  const currentActiveDay = getActiveDayInfo();

  const getTasksForSlot = (empId: string, dateStr: string, hour: number) => {
    return taskActivities.filter((t) => {
      if (t.employee_id !== empId) return false;
      const d = new Date(t.start_at);
      const taskHour = d.getHours();
      const taskDate = t.start_at.split("T")[0];
      return (taskDate === dateStr || dateStr.endsWith(String(d.getDate()))) && taskHour === hour;
    });
  };

  const getTasksForDate = (empId: string, dateStr: string) => {
    return taskActivities.filter((t) => {
      if (t.employee_id !== empId) return false;
      const d = new Date(t.start_at);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const taskDateStr = `${y}-${m}-${day}`;
      return taskDateStr === dateStr;
    });
  };

  const selectedTask = taskActivities.find((t) => t.id === selectedTaskId) || employeeOngoingTask || employeeTasks[0] || null;
  const taskRevisionsList = selectedTask ? taskRevisions.filter((r) => r.task_id === selectedTask.id) : [];

  // Team Overview filtering
  const filteredEmployees = allEmployees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const matchesSearch = !searchQuery || 
      fullName.includes(searchQuery.toLowerCase()) || 
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.department_name && emp.department_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    const empOngoing = taskActivities.find((t) => t.employee_id === emp.id && t.status === "Ongoing");
    const empLeave = getEmployeeLeaveToday(emp.id);
    const empCompleted = taskActivities.filter((t) => t.employee_id === emp.id && t.status === "Completed");

    if (statusFilter === "working") return !!empOngoing;
    if (statusFilter === "leave") return !!empLeave;
    if (statusFilter === "completed") return !empOngoing && !empLeave && empCompleted.length > 0;
    if (statusFilter === "idle") return !empOngoing && !empLeave && empCompleted.length === 0;

    return true;
  });

  // Calculate live team counts
  const totalEmployeesCount = allEmployees.length;
  const workingCount = allEmployees.filter((e) => taskActivities.some((t) => t.employee_id === e.id && t.status === "Ongoing")).length;
  const leaveCount = allEmployees.filter((e) => !!getEmployeeLeaveToday(e.id)).length;
  const completedCount = allEmployees.filter((e) => {
    const isWorking = taskActivities.some((t) => t.employee_id === e.id && t.status === "Ongoing");
    const isLeave = !!getEmployeeLeaveToday(e.id);
    const hasCompleted = taskActivities.some((t) => t.employee_id === e.id && t.status === "Completed");
    return !isWorking && !isLeave && hasCompleted;
  }).length;

  // Handler to open full worksheet for any employee
  const handleOpenEmployeeWorksheet = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setActiveSubView("employee_calendar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Month grid generator for September 2026 (30 days, starting on Tuesday)
  const monthDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-09-${String(dayNum).padStart(2, "0")}`;
    const isToday = dateStr === "2026-09-21";
    const tasks = getTasksForDate(selectedEmployee.id, dateStr);
    const isLeave = !!getEmployeeLeaveForDate(selectedEmployee.id, dateStr);
    const totalMinutes = tasks.reduce((sum, t) => {
      const dur = t.duration_seconds ? Math.round(t.duration_seconds / 60) : 0;
      return sum + dur;
    }, 0);
    return { dayNum, dateStr, isToday, tasks, isLeave, totalMinutes };
  });

  const selectedMonthTasks = selectedMonthDate ? getTasksForDate(selectedEmployee.id, selectedMonthDate) : [];

  return (
    <div className="space-y-5 max-w-7xl mx-auto select-none pb-12">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Admin Worksheet
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Live Monitoring
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor everyone&apos;s real-time work, inspect ongoing tasks, verify leaves, and review detailed activity worksheets.
          </p>
        </div>

        {/* 3 Internal Views Tab Switcher */}
        <div className="flex items-center bg-slate-100/80 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveSubView("team_overview")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeSubView === "team_overview"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Overview</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {allEmployees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubView("employee_calendar")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeSubView === "employee_calendar"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Employee Worksheet</span>
          </button>

          <button
            onClick={() => setActiveSubView("task_details")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeSubView === "task_details"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Task Details</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TEAM OVERVIEW (Default Landing View) */}
      {activeSubView === "team_overview" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5">
          {/* Top Bar: Title & Live Summary Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Authorized Team Members ({totalEmployeesCount})
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Monday, 21 September 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time task tracking status across your department. Click any employee to view their full worksheet.
              </p>
            </div>

            {/* Quick Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, department..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                statusFilter === "all"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              All Members ({totalEmployeesCount})
            </button>

            <button
              onClick={() => setStatusFilter("working")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                statusFilter === "working"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Working Now ({workingCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter("leave")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                statusFilter === "leave"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-900"
              )}
            >
              <PlaneTakeoff className="w-3.5 h-3.5" />
              <span>On Leave ({leaveCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter("completed")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                statusFilter === "completed"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-900"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tasks Done ({completedCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter("idle")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                statusFilter === "idle"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200"
              )}
            >
              Idle / No Tasks ({totalEmployeesCount - workingCount - leaveCount - completedCount})
            </button>
          </div>

          {/* Grid of Team Members (Matching media_1790082065625.png) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => {
              const empOngoing = taskActivities.find(
                (t) => t.employee_id === emp.id && t.status === "Ongoing"
              );
              const empLeave = getEmployeeLeaveToday(emp.id);
              const empCompleted = taskActivities.filter(
                (t) => t.employee_id === emp.id && t.status === "Completed"
              );
              const totalSecs =
                empCompleted.reduce((a, c) => a + (c.duration_seconds || 0), 0) +
                (empOngoing ? activeTaskElapsedSeconds : 0);

              return (
                <div
                  key={emp.id}
                  onClick={() => handleOpenEmployeeWorksheet(emp.id)}
                  className={cn(
                    "p-4 sm:p-5 rounded-3xl border bg-white dark:bg-slate-800/90 hover:shadow-lg transition-all space-y-3.5 cursor-pointer group relative",
                    empOngoing
                      ? "border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-500"
                      : empLeave
                      ? "border-amber-300 dark:border-amber-800/80 hover:border-amber-500 bg-amber-50/20 dark:bg-amber-950/10"
                      : "border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500"
                  )}
                >
                  {/* Card Header: Avatar, Name, Designation & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={emp.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                          alt={emp.first_name}
                          className={cn(
                            "w-11 h-11 rounded-full object-cover ring-2 transition-transform group-hover:scale-105",
                            empOngoing
                              ? "ring-emerald-500"
                              : empLeave
                              ? "ring-amber-500"
                              : "ring-slate-200 dark:ring-slate-700"
                          )}
                        />
                        {empOngoing && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                        )}
                        {empLeave && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {emp.first_name} {emp.last_name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {emp.designation}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {emp.department_name || "Operations"}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {empOngoing ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Working
                        </span>
                      ) : empLeave ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 uppercase shadow-2xs">
                          <PlaneTakeoff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          On Leave
                        </span>
                      ) : empCompleted.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Tasks Done ({empCompleted.length})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          No Tasks Today
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Middle: Ongoing Task / On Leave Details / Duration summary */}
                  {empOngoing ? (
                    <div className="p-3.5 rounded-2xl bg-[#EBF7F2] dark:bg-emerald-950/50 border border-[#D2EFE2] dark:border-emerald-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                          Current Ongoing Activity
                        </p>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Live</span>
                      </div>
                      <p className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug truncate">
                        {empOngoing.title}
                      </p>
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-900 dark:text-emerald-300 font-bold pt-0.5">
                        <span>Started {formatTimeAmPm(empOngoing.start_at)}</span>
                        <span className="bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                          ⏱ {formatSecondsToDigital(activeTaskElapsedSeconds)}
                        </span>
                      </div>
                    </div>
                  ) : empLeave ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase text-amber-800 dark:text-amber-300 tracking-wider flex items-center gap-1">
                          <PlaneTakeoff className="w-3 h-3 text-amber-600" />
                          {empLeave.leave_type} Leave • Approved
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          {empLeave.days_count} {empLeave.days_count === 1 ? "day" : "days"}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs leading-snug line-clamp-2">
                        &ldquo;{empLeave.reason}&rdquo;
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-amber-900 dark:text-amber-300 font-mono pt-0.5">
                        <span>{empLeave.start_date} → {empLeave.end_date}</span>
                        <span className="font-sans font-bold text-amber-600 dark:text-amber-400">Time Off</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Recorded duration today:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {formatSecondsToHuman(totalSecs)}
                      </span>
                    </div>
                  )}

                  {/* Card Footer: Total Recorded Work & Direct Worksheet Link */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      {empLeave ? "Status: Away on Leave" : `Total: ${formatSecondsToHuman(totalSecs)}`}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Toggle Leave Status Button for Admin */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLeaveModalEmployee(emp);
                          if (empLeave) {
                            setLeaveTypeInput(empLeave.leave_type);
                            setLeaveReasonInput(empLeave.reason);
                          } else {
                            setLeaveTypeInput("Annual");
                            setLeaveReasonInput("Approved time off / personal vacation.");
                          }
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition-colors"
                        title={empLeave ? "Edit or cancel leave" : "Mark employee on leave"}
                      >
                        {empLeave ? "Leave: On" : "+ Leave"}
                      </button>

                      {/* View Worksheet CTA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEmployeeWorksheet(emp.id);
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 text-xs group-hover:underline cursor-pointer"
                      >
                        <span>View Worksheet</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: EMPLOYEE WORKSHEET & CALENDAR (Full detailed view as requested) */}
      {activeSubView === "employee_calendar" && (
        <div className="space-y-4">
          {/* Top Bar: Back to Team Overview button & Employee Info Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveSubView("team_overview")}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Team Overview</span>
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              {/* Employee Avatar & Info */}
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmployee.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={selectedEmployee.first_name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </h3>
                    {selectedEmployeeLeave ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <PlaneTakeoff className="w-2.5 h-2.5" />
                        On Leave
                      </span>
                    ) : employeeOngoingTask ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Working Now
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Active Employee
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedEmployee.designation} • {selectedEmployee.department_name || "Engineering"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Switch Employee Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:block">
                Switch:
              </label>
              <div className="relative min-w-[220px]">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full appearance-none bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl px-3 py-2 pr-8 border border-slate-200 dark:border-slate-700 shadow-2xs focus:outline-none cursor-pointer"
                >
                  {allEmployees.map((emp) => {
                    const isWorking = taskActivities.some((t) => t.employee_id === emp.id && t.status === "Ongoing");
                    const isLeave = !!getEmployeeLeaveToday(emp.id);
                    const tag = isWorking ? " (🟢 Working)" : isLeave ? " (✈️ On Leave)" : "";
                    return (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}{tag}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* On Leave Banner (If current selected employee is on leave) */}
          {selectedEmployeeLeave && (
            <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                  <PlaneTakeoff className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black">
                    {selectedEmployee.first_name} is currently On Leave ({selectedEmployeeLeave.leave_type} Leave)
                  </h4>
                  <p className="text-xs text-amber-800/80 dark:text-amber-400/90 mt-0.5">
                    Period: <strong>{selectedEmployeeLeave.start_date}</strong> to <strong>{selectedEmployeeLeave.end_date}</strong> ({selectedEmployeeLeave.days_count} days) • Reason: &ldquo;{selectedEmployeeLeave.reason}&rdquo;
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLeaveModalEmployee(selectedEmployee)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
              >
                Manage Leave
              </button>
            </div>
          )}

          {/* Date Header & View Mode Switcher */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {calendarViewMode === "Day" ? `${currentActiveDay.name}, ${currentActiveDay.dateNum} ${currentActiveDay.monthName}` : "Monday, 21 September 2026"}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase">
                  {calendarViewMode === "Day" && !currentActiveDay.isToday ? "Viewing Day" : "Today"}
                </span>
              </div>

              {/* View Mode & Date Controls */}
              <div className="flex items-center gap-2">
                {/* Date Controls for Day View */}
                {calendarViewMode === "Day" && (
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setDayOffset((prev) => prev - 1)}
                      className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
                      title="Previous Day"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDayOffset(0)}
                      className="px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setDayOffset((prev) => prev + 1)}
                      className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
                      title="Next Day"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Day / Week / Month View Mode Switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {(["Day", "Week", "Month"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCalendarViewMode(mode)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        calendarViewMode === mode
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Task Card: Mint Container */}
            {employeeOngoingTask ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-[#EBF7F2] dark:bg-emerald-950/60 border border-[#C5EBD9] dark:border-emerald-700 text-slate-900 dark:text-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D6832] dark:text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-[#0D6832] dark:bg-emerald-400 animate-pulse" />
                    Currently working
                  </span>
                  <Clock className="w-4 h-4 text-[#0D6832]/80 dark:text-emerald-300" />
                </div>

                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {employeeOngoingTask.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Started at {formatTimeAmPm(employeeOngoingTask.start_at)}
                  </p>
                </div>

                {/* Large Live Stopwatch Counter */}
                <div className="text-3xl sm:text-4xl font-mono font-black text-[#0D6832] dark:text-emerald-300 tracking-tight py-1">
                  {formatSecondsToDigital(activeTaskElapsedSeconds)}
                </div>
              </div>
            ) : selectedEmployeeLeave ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  <PlaneTakeoff className="w-4 h-4" />
                  <span>Employee is away on approved leave today.</span>
                </div>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {selectedEmployeeLeave.leave_type} Leave
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>No live task is currently running for {selectedEmployee.first_name}.</span>
                <span className="font-semibold text-slate-400 dark:text-slate-500">Idle / Completed</span>
              </div>
            )}

            {/* Today's Activities Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Today&apos;s activities ({employeeTodayCompleted.length})
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                {employeeTodayCompleted.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No completed activities logged today.
                  </p>
                ) : (
                  employeeTodayCompleted.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setActiveSubView("task_details");
                      }}
                      className="flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-white dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {formatTimeAmPm(task.start_at)} – {task.end_at ? formatTimeAmPm(task.end_at) : "Ongoing"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {formatSecondsToHuman(task.duration_seconds || 0)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total Recorded Work Footer */}
              <div className="flex items-center justify-between px-2 pt-1 font-mono">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">
                  Total recorded work
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {formatSecondsToHuman(employeeTotalSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* CALENDAR MATRIX VIEW 1: WEEK VIEW */}
          {calendarViewMode === "Week" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Full Week Calendar Grid ({selectedEmployee.first_name})
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Click any task block to inspect audit details</span>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  {/* Column Headers */}
                  <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider">
                    <div className="p-3 text-center text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-800">
                      Time
                    </div>
                    {WEEK_DAYS.map((d) => {
                      const isLeave = !!getEmployeeLeaveForDate(selectedEmployee.id, d.dateStr);
                      return (
                        <div
                          key={d.name}
                          className={cn(
                            "p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-extrabold",
                            d.isToday ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-b-2 border-b-blue-600" : "text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <div>{d.name} {d.dateNum}</div>
                          {isLeave && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white uppercase tracking-tight">
                              ✈ On Leave
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {WEEK_HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="grid grid-cols-[80px_repeat(5,1fr)] min-h-[64px]"
                      >
                        <div className="p-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50/40 dark:bg-slate-900/60 border-r border-slate-200/80 dark:border-slate-800 pt-2.5 font-mono">
                          {hour % 12 === 0 ? 12 : hour % 12}:00
                        </div>

                        {WEEK_DAYS.map((d) => {
                          const tasks = getTasksForSlot(selectedEmployee.id, d.dateStr, hour);
                          const isLeave = !!getEmployeeLeaveForDate(selectedEmployee.id, d.dateStr);

                          return (
                            <div
                              key={d.name}
                              className={cn(
                                "p-1.5 border-r border-slate-100 dark:border-slate-800 last:border-r-0 relative hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors",
                                isLeave
                                  ? "bg-amber-50/30 dark:bg-amber-950/15"
                                  : d.isToday
                                  ? "bg-blue-50/15 dark:bg-blue-950/20"
                                  : "bg-white dark:bg-slate-900"
                              )}
                            >
                              <div className="space-y-1">
                                {tasks.map((task) => {
                                  const isOngoing = task.status === "Ongoing";

                                  return (
                                    <div
                                      key={task.id}
                                      onClick={() => {
                                        setSelectedTaskId(task.id);
                                        setActiveSubView("task_details");
                                      }}
                                      className={cn(
                                        "p-2 rounded-xl text-xs cursor-pointer shadow-xs transition-transform hover:scale-[1.02]",
                                        isOngoing
                                          ? "bg-[#EBF7F2] dark:bg-emerald-950/60 border border-[#C5EBD9] dark:border-emerald-700 text-slate-900 dark:text-slate-100 font-bold"
                                          : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold hover:border-blue-300 dark:hover:border-blue-500"
                                      )}
                                    >
                                      <div className="flex items-center justify-between">
                                        <p className="truncate text-xs text-blue-600 dark:text-blue-400 font-bold">
                                          {task.title}
                                        </p>
                                        {isOngoing && (
                                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                                        {formatTimeAmPm(task.start_at)} {task.end_at ? `– ${formatTimeAmPm(task.end_at)}` : "– Now"}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR MATRIX VIEW 2: DAY VIEW */}
          {calendarViewMode === "Day" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Full Day Schedule ({currentActiveDay.name}, {currentActiveDay.dateNum} {currentActiveDay.monthName})
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Hour-by-hour timeline view for {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </p>
                </div>
                {getEmployeeLeaveForDate(selectedEmployee.id, currentActiveDay.dateStr) && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white flex items-center gap-1.5 shadow-xs">
                    <PlaneTakeoff className="w-3.5 h-3.5" />
                    <span>On Leave Today</span>
                  </span>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {DAY_HOURS.map((hour) => {
                  const tasks = getTasksForSlot(selectedEmployee.id, currentActiveDay.dateStr, hour);

                  return (
                    <div
                      key={hour}
                      className="grid grid-cols-[90px_1fr] min-h-[72px] hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="p-3 text-center text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50/40 dark:bg-slate-900/60 border-r border-slate-200/80 dark:border-slate-800 pt-3 font-mono">
                        {hour % 12 === 0 ? 12 : hour % 12}:00 {hour >= 12 ? "PM" : "AM"}
                      </div>

                      <div className="p-2 space-y-2">
                        {tasks.length === 0 ? (
                          <div className="h-full flex items-center text-[11px] text-slate-300 dark:text-slate-700 italic pl-2">
                            —
                          </div>
                        ) : (
                          tasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => {
                                setSelectedTaskId(task.id);
                                setActiveSubView("task_details");
                              }}
                              className={cn(
                                "p-3 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between",
                                task.status === "Ongoing"
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100"
                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs",
                                  task.status === "Ongoing" ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"
                                )}>
                                  <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {task.title}
                                  </h5>
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                                    {formatTimeAmPm(task.start_at)} – {task.end_at ? formatTimeAmPm(task.end_at) : "Ongoing"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                                  {formatSecondsToHuman(task.duration_seconds || activeTaskElapsedSeconds)}
                                </span>
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                  task.status === "Ongoing" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                                )}>
                                  {task.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CALENDAR MATRIX VIEW 3: MONTH VIEW (with interactive day popup) */}
          {calendarViewMode === "Month" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    September 2026 — Monthly Task Grid ({selectedEmployee.first_name})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Click any day in the month to open the popup showing tasks for that specific date.
                  </p>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* Month Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {/* Offset for Sep 1, 2026 (Tuesday = 1 empty slot on Monday) */}
                <div className="min-h-[90px] rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent opacity-40" />

                {monthDays.map((d) => (
                  <div
                    key={d.dateStr}
                    onClick={() => setSelectedMonthDate(d.dateStr)}
                    className={cn(
                      "min-h-[90px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md hover:scale-[1.02]",
                      d.isToday
                        ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 ring-2 ring-blue-500/20"
                        : d.isLeave
                        ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                        : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs font-black w-6 h-6 rounded-full flex items-center justify-center",
                        d.isToday ? "bg-blue-600 text-white" : "text-slate-700 dark:text-slate-200"
                      )}>
                        {d.dayNum}
                      </span>

                      {d.isLeave && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500 text-white uppercase">
                          Leave
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 my-1">
                      {d.tasks.slice(0, 2).map((t) => (
                        <p
                          key={t.id}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate bg-blue-50/80 dark:bg-blue-950/70 px-1.5 py-0.5 rounded-md"
                        >
                          {t.title}
                        </p>
                      ))}
                      {d.tasks.length > 2 && (
                        <p className="text-[9px] text-slate-400 font-bold">
                          +{d.tasks.length - 2} more
                        </p>
                      )}
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 text-right">
                      {d.totalMinutes > 0 ? `${Math.floor(d.totalMinutes / 60)}h ${d.totalMinutes % 60}m` : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: TASK DETAILS & REVISION AUDIT HISTORY */}
      {activeSubView === "task_details" && selectedTask && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {selectedTask.title}
                </h3>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase",
                    selectedTask.status === "Ongoing"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                      : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                  )}
                >
                  {selectedTask.status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {selectedTask.entry_mode === "live" ? "Live Tracked" : "Manually Timed"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Owner: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTask.employee_name || selectedEmployee.first_name}</span> • Department: {selectedTask.department_name || "Engineering"}
              </p>
            </div>

            <button
              onClick={() => setActiveSubView("employee_calendar")}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Worksheet</span>
            </button>
          </div>

          {/* Time & Duration Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Start Time</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                {formatTimeAmPm(selectedTask.start_at)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">End Time</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                {selectedTask.end_at ? formatTimeAmPm(selectedTask.end_at) : "In Progress (Live)"}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Duration</span>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {selectedTask.status === "Ongoing"
                  ? formatSecondsToHuman(activeTaskElapsedSeconds)
                  : formatSecondsToHuman(selectedTask.duration_seconds || 0)}
              </p>
            </div>
          </div>

          {/* Description */}
          {selectedTask.description && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedTask.description}
              </p>
            </div>
          )}

          {/* Full Audit Revision History */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-white">
                Task Edit History & Audit Log
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Administrators can inspect all historical corrections to verify original automated live-recorded times against later manual adjustments.
            </p>

            {taskRevisionsList.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-800/80 text-xs text-slate-400">
                No manual revisions have been recorded for this activity. All recorded hours reflect original live-tracked timestamps.
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                {taskRevisionsList.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Original Recorded Time</span>
                      <span className="font-mono text-slate-300">
                        {formatTimeAmPm(rev.original_start)} – {rev.original_end ? formatTimeAmPm(rev.original_end) : "Ongoing"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Corrected Time</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {formatTimeAmPm(rev.updated_start)} – {rev.updated_end ? formatTimeAmPm(rev.updated_end) : "Ongoing"}
                      </span>
                    </div>
                    {rev.reason && (
                      <p className="text-[11px] text-slate-300 italic pt-1">
                        &quot;{rev.reason}&quot;
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 pt-1 flex items-center justify-between border-t border-slate-700/60">
                      <span>Edited by {rev.edited_by_name}</span>
                      <span>{new Date(rev.edited_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Month View Date Tasks Popup (User Request #1) */}
      <Modal
        isOpen={!!selectedMonthDate}
        onClose={() => setSelectedMonthDate(null)}
        title={selectedMonthDate ? `Tasks for ${selectedMonthDate}` : "Date Tasks"}
        description={`Detailed task breakdown for ${selectedEmployee.first_name} on this date`}
        maxWidth="md"
      >
        <div className="space-y-3 pt-2">
          {getEmployeeLeaveForDate(selectedEmployee.id, selectedMonthDate || "") && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 font-bold">
              <PlaneTakeoff className="w-4 h-4" />
              <span>Employee was On Leave on this date.</span>
            </div>
          )}

          {selectedMonthTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              No tasks recorded on this day.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {selectedMonthTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTaskId(t.id);
                    setSelectedMonthDate(null);
                    setActiveSubView("task_details");
                  }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {formatTimeAmPm(t.start_at)} – {t.end_at ? formatTimeAmPm(t.end_at) : "Ongoing"}
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatSecondsToHuman(t.duration_seconds || activeTaskElapsedSeconds)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setSelectedMonthDate(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Quick Leave Management Modal */}
      <Modal
        isOpen={!!leaveModalEmployee}
        onClose={() => setLeaveModalEmployee(null)}
        title={leaveModalEmployee ? `Manage Leave for ${leaveModalEmployee.first_name} ${leaveModalEmployee.last_name}` : "Manage Leave"}
        description="Set or toggle this employee's active leave status."
        maxWidth="sm"
      >
        {leaveModalEmployee && (
          <div className="space-y-4 pt-2">
            {getEmployeeLeaveToday(leaveModalEmployee.id) ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-bold flex items-center gap-1.5">
                  <PlaneTakeoff className="w-3.5 h-3.5 text-amber-600" />
                  Currently ON LEAVE
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">
                  Reason: &ldquo;{getEmployeeLeaveToday(leaveModalEmployee.id)?.reason}&rdquo;
                </p>
                <button
                  onClick={() => {
                    setEmployeeLeaveStatus(leaveModalEmployee.id, false);
                    setLeaveModalEmployee(null);
                  }}
                  className="mt-3 w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Cancel / End Leave (Mark Active)
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Leave Type
                  </label>
                  <select
                    value={leaveTypeInput}
                    onChange={(e) => setLeaveTypeInput(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Leave Reason / Note
                  </label>
                  <input
                    type="text"
                    value={leaveReasonInput}
                    onChange={(e) => setLeaveReasonInput(e.target.value)}
                    placeholder="e.g. Approved family vacation..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => {
                    setEmployeeLeaveStatus(leaveModalEmployee.id, true, leaveTypeInput, leaveReasonInput);
                    setLeaveModalEmployee(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <PlaneTakeoff className="w-4 h-4" />
                  <span>Mark as On Leave</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
