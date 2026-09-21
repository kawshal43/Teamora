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
  Sparkles
} from "lucide-react";
import { useApp } from "@/context/AppContext";
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
    posts,
    toggleLike,
    submitCorrection,
    submitLeaveRequest
  } = useApp();

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("task-2");

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-100/70 via-blue-50/60 to-white border border-blue-100/50 p-6 sm:p-8 shadow-xs">
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
            <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase">
              WELCOME TO TEAMORA
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Have a productive day, {currentUser.first_name}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              Stay focused, make progress, and be part of something bigger.
            </p>
          </div>

          {/* Right Quote from mockup: GREAT WORK BUILDS BRIGHTER TOMORROWS. */}
          <div className="hidden lg:block text-right">
            <div className="w-8 h-0.5 bg-blue-500 ml-auto mb-2 rounded-full" />
            <p className="text-[10px] tracking-widest font-semibold text-slate-400 uppercase leading-relaxed">
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
          className="p-5 flex items-center justify-between cursor-pointer hover:border-blue-200 group"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
              isCheckedIn ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400"
            }`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Attendance Status</p>
              <h3 className="text-lg font-bold text-emerald-600 mt-0.5">
                {isCheckedIn ? "Present" : "Checked Out"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isCheckedIn ? "Checked in at 9:02 AM" : "Session ended"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </Card>

        {/* Card 2: Hours Today */}
        <Card className="p-5 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/60 flex items-center justify-center transition-transform group-hover:scale-105">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Hours Today</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {isCheckedIn ? formatDuration(liveDurationSeconds) : "0h 0m"}
              </h3>
              <p className="text-[11px] text-slate-400">of 8h 0m target</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </Card>

        {/* Card 3: Pending Tasks */}
        <Link href="/worksheet">
          <Card className="p-5 flex items-center justify-between group h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/60 flex items-center justify-center transition-transform group-hover:scale-105">
                <ListTodo className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Pending Tasks</p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {tasks.filter((t) => t.status !== "completed").length}
                </h3>
                <p className="text-[11px] text-slate-400">tasks to do</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </Card>
        </Link>
      </div>

      {/* 3. ATTENDANCE ACTIVE CARD (Exact match with mockup) */}
      <Card className="p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase">
              ATTENDANCE
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {isCheckedIn ? "Checked in at 9:02 AM" : "Ready to start your workday?"}
            </h3>
            <p className="text-xs text-slate-500">
              {isCheckedIn 
                ? "You're currently marked as present." 
                : "Record your attendance with verified server timestamp."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isCheckedIn ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active session
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Checked out
              </span>
            )}

            <button
              onClick={() => setShowLeaveModal(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
            >
              <PlaneTakeoff className="w-3.5 h-3.5" />
              Request Leave
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Work Hours Sub-card */}
          <div className="md:col-span-5 p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center text-slate-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Work Hours</p>
              <h4 className="text-xl font-bold text-slate-900">
                {isCheckedIn ? formatDuration(liveDurationSeconds) : "0h 0m 0s"}
              </h4>
              <p className="text-[11px] text-slate-400">Today so far</p>
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
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900">My Tasks</h3>
            <Link 
              href="/worksheet" 
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => {
              const isDone = task.status === "completed";
              const isSelected = selectedTaskId === task.id;
              return (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`flex items-center justify-between gap-3 p-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border-2 border-blue-600 hover:bg-blue-700 active:scale-[0.99]"
                      : "bg-white hover:bg-slate-50 hover:border-slate-200 hover:shadow-xs border border-slate-100 text-slate-800 active:scale-[0.99]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id);
                      }}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isDone 
                          ? (isSelected ? "bg-white border-white text-blue-600" : "bg-blue-600 border-blue-600 text-white")
                          : (isSelected ? "border-white/70 hover:border-white text-white" : "border-slate-300 hover:border-blue-500")
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <span className={`text-sm font-medium truncate ${
                      isSelected 
                        ? "text-white font-semibold" 
                        : (isDone ? "line-through text-slate-400" : "text-slate-800")
                    }`}>
                      {task.title}
                    </span>
                  </div>

                  {/* Status Pills matching screenshot tags */}
                  <div>
                    {task.priority === "urgent" && (
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap transition-colors ${
                        isSelected 
                          ? "bg-white/20 text-white border border-white/30 backdrop-blur-xs font-semibold" 
                          : "bg-red-100/70 text-red-600"
                      }`}>
                        Due today
                      </span>
                    )}
                    {task.priority === "medium" && (
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap transition-colors ${
                        isSelected 
                          ? "bg-white/20 text-white border border-white/30 backdrop-blur-xs font-semibold" 
                          : "bg-sky-100/70 text-sky-600"
                      }`}>
                        In progress
                      </span>
                    )}
                    {task.priority === "low" && (
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap transition-colors ${
                        isSelected 
                          ? "bg-white/20 text-white border border-white/30 backdrop-blur-xs font-semibold" 
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        Not started
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Team Feed (Dinesh Perera post from mockup) */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900">Team Feed</h3>
            <Link 
              href="/feed" 
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
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
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {dineshPost.author_name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {dineshPost.created_at}
                    </p>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {dineshPost.content}
              </p>

              {/* Interactions matching mockup: Red heart (18), comment (3) */}
              <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500">
                <button
                  onClick={() => toggleLike(dineshPost.id)}
                  className="flex items-center gap-1.5 hover:text-red-600 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${dineshPost.has_liked ? "fill-red-500 text-red-500" : "text-red-500"}`} />
                  <span>{dineshPost.likes_count}</span>
                </button>

                <Link href="/feed" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
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
            <p className="text-xs text-slate-500">Past attendance sessions and durations</p>
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

          <div className="divide-y divide-slate-100">
            {attendanceHistory.map((sess) => (
              <div key={sess.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{sess.work_date}</p>
                  <p className="text-slate-400 text-[11px]">
                    {new Date(sess.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {sess.check_out && ` - ${new Date(sess.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{formatDuration(sess.duration_seconds)}</p>
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
            <label className="block font-semibold text-slate-700 mb-1">Requested Check In</label>
            <input
              type="time"
              value={corrIn}
              onChange={(e) => setCorrIn(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Requested Check Out</label>
            <input
              type="time"
              value={corrOut}
              onChange={(e) => setCorrOut(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Correction</label>
            <textarea
              rows={3}
              value={corrReason}
              onChange={(e) => setCorrReason(e.target.value)}
              placeholder="e.g. Network latency delayed morning clock in."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block font-semibold text-slate-700 mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Annual">Annual Leave (14 days balance)</option>
              <option value="Sick">Sick Leave (7 days balance)</option>
              <option value="Casual">Casual Leave (5 days balance)</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason</label>
            <textarea
              rows={3}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="Provide a brief explanation..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  );
}
