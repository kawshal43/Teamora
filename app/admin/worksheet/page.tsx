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
  ExternalLink
} from "lucide-react";
import { 
  useApp, 
  formatSecondsToDigital, 
  formatSecondsToHuman, 
  formatTimeAmPm 
} from "@/context/AppContext";
import { TaskActivity, UserProfile } from "@/types";
import { cn } from "@/lib/utils";

export default function AdminWorksheetPage() {
  const {
    currentUser,
    allEmployees,
    taskActivities,
    taskRevisions,
    activeTaskElapsedSeconds,
  } = useApp();

  // Three internal views per Section 10.1: Team Overview, Employee Calendar, Task Details
  const [activeSubView, setActiveSubView] = useState<"team_overview" | "employee_calendar" | "task_details">("employee_calendar");

  // Selected employee for calendar view (Defaults to Nimal Perera matching mockup media_1789996084111.png)
  const defaultNimal = allEmployees.find((e) => e.first_name === "Nimal") || allEmployees[0];
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(defaultNimal.id);

  // Selected task for Task Details view
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>("act-live-nimal");

  // View mode for calendar: Day / Week / Month
  const [calendarViewMode, setCalendarViewMode] = useState<"Day" | "Week" | "Month">("Week");

  const selectedEmployee = allEmployees.find((e) => e.id === selectedEmployeeId) || defaultNimal;

  // Filter tasks for selected employee
  const employeeTasks = taskActivities.filter((t) => t.employee_id === selectedEmployee.id);
  const employeeOngoingTask = employeeTasks.find((t) => t.status === "Ongoing") || null;

  const todayDateStr = new Date().toISOString().split("T")[0];
  const employeeTodayCompleted = employeeTasks.filter(
    (t) => t.status === "Completed" && (t.start_at.startsWith(todayDateStr) || (t.end_at && t.end_at.startsWith(todayDateStr)))
  );

  const employeeCompletedSeconds = employeeTodayCompleted.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
  const employeeTotalSeconds = employeeCompletedSeconds + (employeeOngoingTask ? activeTaskElapsedSeconds : 0);

  // Time grid hours: 8:00 AM to 6:00 PM
  const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const WEEK_DAYS = [
    { name: "MON", dateNum: 21, dateStr: "2026-09-21", isToday: true },
    { name: "TUE", dateNum: 22, dateStr: "2026-09-22", isToday: false },
    { name: "WED", dateNum: 23, dateStr: "2026-09-23", isToday: false },
    { name: "THU", dateNum: 24, dateStr: "2026-09-24", isToday: false },
    { name: "FRI", dateNum: 25, dateStr: "2026-09-25", isToday: false },
  ];

  const getTasksForSlot = (empId: string, dateStr: string, hour: number) => {
    return taskActivities.filter((t) => {
      if (t.employee_id !== empId) return false;
      const d = new Date(t.start_at);
      const taskHour = d.getHours();
      const taskDate = t.start_at.split("T")[0];
      return (taskDate === dateStr || dateStr.endsWith(String(d.getDate()))) && taskHour === hour;
    });
  };

  const selectedTask = taskActivities.find((t) => t.id === selectedTaskId) || employeeOngoingTask || employeeTasks[0] || null;
  const taskRevisionsList = selectedTask ? taskRevisions.filter((r) => r.task_id === selectedTask.id) : [];

  return (
    <div className="space-y-5 max-w-7xl mx-auto select-none">
      {/* Header & Sub-Navigation matching Section 10.1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Admin Worksheet
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
              Live Monitoring
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Directly inspect authorized employee activity timelines, working hours, and live task trackers.
          </p>
        </div>

        {/* 3 Internal Views Tab Switcher (Section 10.1) */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveSubView("team_overview")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              activeSubView === "team_overview"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Overview</span>
          </button>

          <button
            onClick={() => setActiveSubView("employee_calendar")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              activeSubView === "employee_calendar"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Employee Calendar</span>
          </button>

          <button
            onClick={() => setActiveSubView("task_details")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              activeSubView === "task_details"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Task Details</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TEAM OVERVIEW (Section 10.1) */}
      {activeSubView === "team_overview" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Authorized Team Members ({allEmployees.length})
              </h3>
              <p className="text-xs text-slate-500">
                Real-time task tracking status across your department
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Monday, 21 September 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {allEmployees.map((emp) => {
              const empOngoing = taskActivities.find(
                (t) => t.employee_id === emp.id && t.status === "Ongoing"
              );
              const empCompleted = taskActivities.filter(
                (t) => t.employee_id === emp.id && t.status === "Completed"
              );
              const totalSecs =
                empCompleted.reduce((a, c) => a + (c.duration_seconds || 0), 0) +
                (empOngoing ? activeTaskElapsedSeconds : 0);

              return (
                <div
                  key={emp.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-sm transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                        alt={emp.first_name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {emp.first_name} {emp.last_name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {emp.designation}
                        </p>
                      </div>
                    </div>

                    {empOngoing ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Working
                      </span>
                    ) : empCompleted.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Tasks Done ({empCompleted.length})
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                        No Tasks Today
                      </span>
                    )}
                  </div>

                  {/* Ongoing Task Card or Idle Note */}
                  {empOngoing ? (
                    <div className="p-3 rounded-xl bg-[#EBF7F2] border border-[#D2EFE2] text-xs space-y-1">
                      <p className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                        Current Ongoing Activity
                      </p>
                      <p className="font-bold text-slate-900 leading-snug truncate">
                        {empOngoing.title}
                      </p>
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-900 font-bold pt-1">
                        <span>Started {formatTimeAmPm(empOngoing.start_at)}</span>
                        <span>⏱ {formatSecondsToDigital(activeTaskElapsedSeconds)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                      <span>Recorded duration today:</span>
                      <span className="font-bold text-slate-800">{formatSecondsToHuman(totalSecs)}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-700 text-[11px]">
                      Total: {formatSecondsToHuman(totalSecs)}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedEmployeeId(emp.id);
                        setActiveSubView("employee_calendar");
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 font-bold hover:text-blue-700 hover:underline text-xs"
                    >
                      <span>Inspect Calendar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: EMPLOYEE CALENDAR matching mockup media_1789996084111.png */}
      {activeSubView === "employee_calendar" && (
        <div className="space-y-4">
          {/* Employee Selector & Date Card matching mockup */}
          <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-4">
            {/* Employee Dropdown matching mockup media_1789996084111.png */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Employee
              </label>
              <div className="relative max-w-sm">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full appearance-none bg-slate-900 text-white font-bold text-sm rounded-2xl px-4 py-3 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {allEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.designation})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Date Header matching mockup: Monday, 21 September [Today] */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Monday, 21 September
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase">
                  Today
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={calendarViewMode}
                    onChange={(e) => setCalendarViewMode(e.target.value as any)}
                    className="appearance-none bg-slate-50 font-bold text-xs text-slate-800 border border-slate-200 rounded-xl pl-3 pr-7 py-1.5 shadow-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Day">Day</option>
                    <option value="Week">Week ▾</option>
                    <option value="Month">Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Task Card: Mint Container matching mockup media_1789996084111.png */}
            {employeeOngoingTask ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-[#EBF7F2] border border-[#C5EBD9] text-slate-900 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D6832]">
                    <span className="w-2 h-2 rounded-full bg-[#0D6832] animate-pulse" />
                    Currently working
                  </span>
                  <Clock className="w-4 h-4 text-[#0D6832]/80" />
                </div>

                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    {employeeOngoingTask.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Started at {formatTimeAmPm(employeeOngoingTask.start_at)}
                  </p>
                </div>

                {/* Large Live Stopwatch Counter */}
                <div className="text-3xl sm:text-4xl font-mono font-black text-[#0D6832] tracking-tight py-1">
                  {formatSecondsToDigital(activeTaskElapsedSeconds)}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>No task is currently running for this employee.</span>
                <span className="font-semibold text-slate-400">Idle / Completed</span>
              </div>
            )}

            {/* Today's Activities Section matching mockup media_1789996084111.png */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Today&apos;s activities
              </h4>

              <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
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
                      className="flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-white cursor-pointer transition-colors group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatTimeAmPm(task.start_at)} – {task.end_at ? formatTimeAmPm(task.end_at) : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700">
                          {formatSecondsToHuman(task.duration_seconds || 0)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total Recorded Work Footer matching mockup */}
              <div className="flex items-center justify-between px-2 pt-1 font-mono">
                <span className="text-xs font-bold text-slate-600 font-sans">
                  Total recorded work
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  {formatSecondsToHuman(employeeTotalSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Full Week Calendar Matrix for Selected Employee */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Full Calendar Grid ({selectedEmployee.first_name})
              </span>
              <span className="text-xs text-slate-400">Click any block to inspect details</span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                {/* Column Headers */}
                <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-slate-50 text-slate-700 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                  <div className="p-3 text-center text-slate-400 border-r border-slate-200">
                    Time
                  </div>
                  {WEEK_DAYS.map((d) => (
                    <div
                      key={d.name}
                      className={cn(
                        "p-3 text-center border-r border-slate-200 last:border-r-0 font-extrabold",
                        d.isToday ? "bg-blue-50/80 text-blue-700 border-b-2 border-b-blue-600" : "text-slate-700"
                      )}
                    >
                      {d.name} {d.dateNum}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-100 bg-white">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="grid grid-cols-[80px_repeat(5,1fr)] min-h-[64px]"
                    >
                      <div className="p-2 text-center text-xs font-bold text-slate-400 bg-slate-50/40 border-r border-slate-200/80 pt-2.5">
                        {hour % 12 === 0 ? 12 : hour % 12}:00
                      </div>

                      {WEEK_DAYS.map((d) => {
                        const tasks = getTasksForSlot(selectedEmployee.id, d.dateStr, hour);

                        return (
                          <div
                            key={d.name}
                            className={cn(
                              "p-1.5 border-r border-slate-100 last:border-r-0 relative hover:bg-slate-50/50 transition-colors",
                              d.isToday ? "bg-blue-50/15" : "bg-white"
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
                                        ? "bg-[#EBF7F2] border border-[#C5EBD9] text-slate-900 font-bold"
                                        : "bg-white text-slate-900 border border-slate-200 font-semibold hover:border-blue-300"
                                    )}
                                  >
                                    <div className="flex items-center justify-between">
                                      <p className="truncate text-xs text-blue-600 font-bold">
                                        {task.title}
                                      </p>
                                      {isOngoing && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
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
        </div>
      )}

      {/* VIEW 3: TASK DETAILS & REVISION AUDIT HISTORY (Section 10.1 & Section 8) */}
      {activeSubView === "task_details" && selectedTask && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedTask.title}
                </h3>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase",
                    selectedTask.status === "Ongoing"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  )}
                >
                  {selectedTask.status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                  {selectedTask.entry_mode === "live" ? "Live Tracked" : "Manually Timed"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Owner: <span className="font-bold text-slate-800">{selectedTask.employee_name || "Employee"}</span> • Department: {selectedTask.department_name || "Engineering"}
              </p>
            </div>

            <button
              onClick={() => setActiveSubView("employee_calendar")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              ← Back to Calendar
            </button>
          </div>

          {/* Time & Duration Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Start Time</span>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {formatTimeAmPm(selectedTask.start_at)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">End Time</span>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {selectedTask.end_at ? formatTimeAmPm(selectedTask.end_at) : "In Progress (Live)"}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Duration</span>
              <p className="text-sm font-bold text-emerald-700 font-mono">
                {selectedTask.status === "Ongoing"
                  ? formatSecondsToHuman(activeTaskElapsedSeconds)
                  : formatSecondsToHuman(selectedTask.duration_seconds || 0)}
              </p>
            </div>
          </div>

          {/* Description */}
          {selectedTask.description && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h5 className="text-xs font-bold text-slate-700 mb-1">Description</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedTask.description}
              </p>
            </div>
          )}

          {/* Full Audit Revision History matching Section 8 & media_1789996039958.png */}
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
    </div>
  );
}
