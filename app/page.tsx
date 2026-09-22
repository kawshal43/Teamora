"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  ChevronRight, 
  LogOut, 
  LogIn, 
  Heart, 
  MessageSquare, 
  MoreHorizontal, 
  Calendar,
  History,
  PlaneTakeoff,
  AlertCircle,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  User
} from "lucide-react";
import { useApp, ALL_EMPLOYEES } from "@/context/AppContext";
import { Task } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, MobileDrawer } from "@/components/ui/Modal";
import { formatDuration } from "@/lib/utils";

export default function DashboardPage() {
  const {
    currentUser,
    currentSession,
    attendanceHistory,
    checkIn,
    checkOut,
    liveDurationSeconds,
    tasks,
    toggleTaskStatus,
    createTask,
    updateTask,
    deleteTask,
    posts,
    toggleLike,
    submitCorrection,
    submitLeaveRequest,
    openUserProfile
  } = useApp();

  const isAdmin = currentUser.role !== "employee";

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("task-2");

  // Task Management State
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // New Task Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [newDueDate, setNewDueDate] = useState("Due today");
  const [newStatus, setNewStatus] = useState<Task["status"]>("todo");
  const [newAssignedTo, setNewAssignedTo] = useState(currentUser.id);

  // Edit Task Form State
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
  const [editDueDate, setEditDueDate] = useState("Due today");
  const [editStatus, setEditStatus] = useState<Task["status"]>("todo");
  const [editAssignedTo, setEditAssignedTo] = useState("");

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
    setEditPriority(task.priority);
    setEditDueDate(task.due_date || "Due today");
    setEditStatus(task.status);
    setEditAssignedTo(task.assigned_to);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createTask(
      newTitle.trim(),
      newPriority,
      newDueDate,
      newAssignedTo || currentUser.id,
      newDesc.trim(),
      newStatus
    );
    setShowCreateTaskModal(false);
    setNewTitle("");
    setNewDesc("");
    setNewPriority("medium");
    setNewDueDate("Due today");
    setNewStatus("todo");
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;
    updateTask(editingTask.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority,
      due_date: editDueDate,
      status: editStatus,
      assigned_to: editAssignedTo,
    });
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setDeletingTaskId(null);
    if (editingTask?.id === taskId) {
      setEditingTask(null);
    }
  };

  const cycleTaskStatus = (taskId: string, currentStatus: Task["status"]) => {
    const nextStatus: Task["status"] =
      currentStatus === "todo"
        ? "in_progress"
        : currentStatus === "in_progress"
        ? "completed"
        : "todo";
    updateTask(taskId, { status: nextStatus });
  };

  // Correction Form State
  const [corrSessionId, setCorrSessionId] = useState("");
  const [corrIn, setCorrIn] = useState("09:00");
  const [corrOut, setCorrOut] = useState("18:00");
  const [corrReason, setCorrReason] = useState("");

  // Leave Form State
  const [leaveType, setLeaveType] = useState<"Annual" | "Sick" | "Casual" | "Unpaid">("Annual");
  const [leaveStart, setLeaveStart] = useState("2025-05-02");
  const [leaveEnd, setLeaveEnd] = useState("2025-05-04");
  const [leaveReason, setLeaveReason] = useState("");

  const isCheckedIn = !!currentSession && !currentSession.check_out;

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCorrection(corrSessionId || "att-today", corrIn, corrOut, corrReason);
    setShowCorrectionModal(false);
    setCorrReason("");
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeaveRequest(leaveType, leaveStart, leaveEnd, 2, leaveReason);
    setShowLeaveModal(false);
    setLeaveReason("");
  };

  // Featured Dinesh Perera post from reference mockup
  const dineshPost = posts.find((p) => p.author_name === "Dinesh Perera") || posts[0];

  return (
    <div className="space-y-6">
      {/* 1. WELCOME BANNER (Exact visual match with mockup) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-100/70 via-blue-50/60 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-blue-100/50 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        {/* Subtle decorative background wave lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 pointer-events-none">
          <svg className="w-full h-full object-cover" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100C100 50 200 150 400 80V200H0V100Z" fill="url(#paint0_linear)" />
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="1" stopColor="#818CF8" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              WELCOME TO TEAMORA
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Have a productive day, {currentUser.first_name}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal">
              Stay focused, make progress, and be part of something bigger.
            </p>
          </div>

          {/* Right Quote from mockup: GREAT WORK BUILDS BRIGHTER TOMORROWS. */}
          <div className="hidden lg:block text-right">
            <div className="w-8 h-0.5 bg-blue-500 ml-auto mb-2 rounded-full" />
            <p className="text-[10px] tracking-widest font-semibold text-slate-400 dark:text-slate-500 uppercase leading-relaxed">
              GREAT WORK<br />BUILDS BRIGHTER<br />TOMORROWS.
            </p>
          </div>
        </div>
      </div>

      {/* 2. TOP 3 METRIC CARDS (Exact match with mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Attendance Status */}
        <Card 
          onClick={() => setShowHistoryDrawer(true)}
          className="p-5 flex items-center justify-between cursor-pointer hover:border-blue-200 dark:hover:border-slate-700 group"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
              isCheckedIn ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            }`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Attendance Status</p>
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {isCheckedIn ? "Present" : "Checked Out"}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {isCheckedIn ? "Checked in at 9:02 AM" : "Session ended"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors" />
        </Card>

        {/* Card 2: Hours Today */}
        <Card className="p-5 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100/60 dark:border-blue-800 flex items-center justify-center transition-transform group-hover:scale-105">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hours Today</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {isCheckedIn ? formatDuration(liveDurationSeconds) : "0h 0m"}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">of 8h 0m target</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors" />
        </Card>

        {/* Card 3: Pending Tasks */}
        <Link href="/worksheet">
          <Card className="p-5 flex items-center justify-between group h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-800 flex items-center justify-center transition-transform group-hover:scale-105">
                <ListTodo className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Tasks</p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {tasks.filter((t) => t.status !== "completed").length}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">tasks to do</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors" />
          </Card>
        </Link>
      </div>

      {/* 3. ATTENDANCE ACTIVE CARD (Exact match with mockup) */}
      <Card className="p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              ATTENDANCE
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {isCheckedIn ? "Checked in at 9:02 AM" : "Ready to start your workday?"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isCheckedIn 
                ? "You're currently marked as present." 
                : "Record your attendance with verified server timestamp."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isCheckedIn ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active session
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Checked out
              </span>
            )}

            <button
              onClick={() => setShowLeaveModal(true)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <PlaneTakeoff className="w-3.5 h-3.5" />
              Request Leave
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Work Hours Sub-card */}
          <div className="md:col-span-5 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Work Hours</p>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                {isCheckedIn ? formatDuration(liveDurationSeconds) : "0h 0m 0s"}
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Today so far</p>
            </div>
          </div>

          {/* Large Royal Blue Action Button (Matches Check Out in mockup) */}
          <div className="md:col-span-7">
            {isCheckedIn ? (
              <Button
                variant="primary"
                size="lg"
                onClick={checkOut}
                className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Check Out</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={checkIn}
                className="w-full h-14 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Check In</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 4. SPLIT GRID: MY TASKS & TEAM FEED (Exact match with mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: My Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">My Tasks</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/60">
                {tasks.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewAssignedTo(currentUser.id);
                  setShowCreateTaskModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isAdmin ? "Give Task" : "Add Task"}</span>
              </button>
              <Link 
                href="/worksheet" 
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 group ml-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => {
              const isDone = task.status === "completed";
              const isSelected = selectedTaskId === task.id;
              return (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`group/task flex items-center justify-between gap-3 p-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border-2 border-blue-600 hover:bg-blue-700"
                      : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xs border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id);
                      }}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                        isDone 
                          ? (isSelected ? "bg-white border-white text-blue-600" : "bg-blue-600 border-blue-600 text-white")
                          : (isSelected ? "border-white/70 hover:border-white text-white" : "border-slate-300 dark:border-slate-600 hover:border-blue-500")
                      }`}
                      title={isDone ? "Mark as not completed" : "Mark as completed"}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className={`text-sm font-medium truncate block ${
                        isSelected 
                          ? "text-white font-semibold" 
                          : (isDone ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-100")
                      }`}>
                        {task.title}
                      </span>
                      {/* Show assignee / assigner info */}
                      <div className={`text-[11px] truncate flex items-center gap-1 ${
                        isSelected ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {task.assigned_to_name && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              openUserProfile(task.assigned_to || task.assigned_to_name);
                            }}
                            className="hover:underline hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                            title={`View ${task.assigned_to_name}'s Facebook profile`}
                          >
                            Assigned to: <strong>{task.assigned_to_name}</strong>
                          </span>
                        )}
                        {task.assigned_by_name && task.assigned_by_name !== task.assigned_to_name && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              openUserProfile(task.assigned_by || task.assigned_by_name);
                            }}
                            className="hover:underline hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                            title={`View ${task.assigned_by_name}'s Facebook profile`}
                          >
                            • By: <strong>{task.assigned_by_name}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Pills */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status Pill with Click-to-Cycle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cycleTaskStatus(task.id, task.status);
                      }}
                      title="Click to cycle status (Not started / In progress / Completed)"
                      className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    >
                      {task.status === "completed" ? (
                        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap ${
                          isSelected 
                            ? "bg-white/20 text-white border border-white/30 backdrop-blur-xs font-semibold" 
                            : "bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        }`}>
                          Completed
                        </span>
                      ) : task.priority === "urgent" ? (
                        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap ${
                          isSelected 
                            ? "bg-white/20 text-white border border-white/30 backdrop-blur-xs font-semibold" 
                            : "bg-red-100/70 dark:bg-red-950/60 text-red-600 dark:text-red-300"
                        }`}>
                          Due today
                        </span>
                      ) : task.priority === "medium" || task.status === "in_progress" ? (
                        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap ${
                          isSelected 
                            ? "bg-white/20 text-white border border-white/30 backdrop-blur-xs font-semibold" 
                            : "bg-sky-100/70 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300"
                        }`}>
                          In progress
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap ${
                          isSelected 
                            ? "bg-white/20 text-white border border-white/30 backdrop-blur-xs font-semibold" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                          Not started
                        </span>
                      )}
                    </button>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover/task:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTask(task);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isSelected 
                            ? "hover:bg-white/20 text-white" 
                            : "hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                        title="Edit task"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingTaskId(task.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isSelected 
                            ? "hover:bg-white/20 text-white" 
                            : "hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                        }`}
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Team Feed (Dinesh Perera post from mockup) */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Team Feed</h3>
            <Link 
              href="/feed" 
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {dineshPost && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={dineshPost.author_avatar}
                    alt={dineshPost.author_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {dineshPost.author_name}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {dineshPost.created_at}
                    </p>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {dineshPost.content}
              </p>

              {/* Interactions matching mockup: Red heart (18), comment (3) */}
              <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => toggleLike(dineshPost.id)}
                  className="flex items-center gap-1.5 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${dineshPost.has_liked ? "fill-red-500 text-red-500" : "text-red-500"}`} />
                  <span>{dineshPost.likes_count}</span>
                </button>

                <Link href="/feed" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>{dineshPost.comments_count}</span>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 5. ATTENDANCE HISTORY DRAWER */}
      <MobileDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        title="My Attendance History"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">Past attendance sessions and durations</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowHistoryDrawer(false);
                setShowCorrectionModal(true);
              }}
            >
              Request Correction
            </Button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {attendanceHistory.map((sess) => (
              <div key={sess.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{sess.work_date}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px]">
                    {new Date(sess.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {sess.check_out && ` - ${new Date(sess.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{formatDuration(sess.duration_seconds)}</p>
                  <Badge variant={sess.status === "completed" ? "success" : "warning"} size="sm">
                    {sess.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MobileDrawer>

      {/* 6. CORRECTION REQUEST MODAL */}
      <Modal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        title="Submit Attendance Correction"
        description="Request an authorized supervisor review for clock timestamp discrepancy."
      >
        <form onSubmit={handleCorrectionSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Requested Check In</label>
            <input
              type="time"
              value={corrIn}
              onChange={(e) => setCorrIn(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Requested Check Out</label>
            <input
              type="time"
              value={corrOut}
              onChange={(e) => setCorrOut(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Correction</label>
            <textarea
              rows={3}
              value={corrReason}
              onChange={(e) => setCorrReason(e.target.value)}
              placeholder="e.g. Network latency delayed morning clock in."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCorrectionModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. LEAVE REQUEST MODAL */}
      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Apply for Leave"
        description="Submit a leave request for administrative review."
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Annual">Annual Leave (14 days balance)</option>
              <option value="Sick">Sick Leave (7 days balance)</option>
              <option value="Casual">Casual Leave (5 days balance)</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason</label>
            <textarea
              rows={3}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="Provide a brief explanation..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowLeaveModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Leave Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. CREATE / ASSIGN TASK MODAL */}
      <Modal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        title={isAdmin ? "Give / Assign New Task" : "Add New Task"}
        description={isAdmin ? "Create and assign a task to any workforce member." : "Add a new task to your task list."}
        maxWidth="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Complete quarterly financial review..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Add key deliverables or instructions..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Assign To Employee Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isAdmin ? "Assign To Employee" : "Assigned To"}
            </label>
            <select
              value={newAssignedTo}
              onChange={(e) => setNewAssignedTo(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {ALL_EMPLOYEES.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="urgent">Urgent (Due today)</option>
                <option value="medium">Medium (In progress)</option>
                <option value="low">Low (Not started)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date / Time</label>
              <input
                type="text"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                placeholder="e.g. Due today, Tomorrow, 5:00 PM"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "todo" as const, label: "Not started" },
                { id: "in_progress" as const, label: "In progress" },
                { id: "completed" as const, label: "Completed" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setNewStatus(s.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    newStatus === s.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateTaskModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {isAdmin ? "Give / Assign Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 9. EDIT / CHANGE TASK MODAL */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit / Change Task"
        description="Modify task details, change status, reassign, or delete."
        maxWidth="md"
      >
        {editingTask && (
          <form onSubmit={handleUpdateTask} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Task description or notes..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Change Assignee */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
              <select
                value={editAssignedTo}
                onChange={(e) => setEditAssignedTo(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {ALL_EMPLOYEES.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="urgent">Urgent (Due today)</option>
                  <option value="medium">Medium (In progress)</option>
                  <option value="low">Low (Not started)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date / Time</label>
                <input
                  type="text"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "todo" as const, label: "Not started" },
                  { id: "in_progress" as const, label: "In progress" },
                  { id: "completed" as const, label: "Completed" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setEditStatus(s.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      editStatus === s.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const id = editingTask.id;
                  setEditingTask(null);
                  setDeletingTaskId(id);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 p-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingTask(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* 10. DELETE TASK CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs pt-1">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-bold text-red-900 dark:text-red-200">Permanently remove task</p>
              <p className="text-[11px] text-red-600 dark:text-red-400">It will be removed from your task list.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeletingTaskId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => deletingTaskId && handleDeleteTask(deletingTaskId)}
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
