"use client";

import React from "react";
import Link from "next/link";
import { 
  Users, 
  Clock, 
  FileText, 
  PlaneTakeoff, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowUpRight,
  ShieldCheck,
  Building2
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDuration } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { 
    currentUser, 
    currentSession,
    reports, 
    approveReport, 
    requestReportChanges, 
    leaveRequests, 
    approveLeave, 
    rejectLeave,
    attendanceHistory
  } = useApp();

  const pendingReports = reports.filter((r) => r.status === "submitted");
  const pendingLeaves = leaveRequests.filter((l) => l.status === "pending");
  const lateCount = attendanceHistory.filter((a) => a.is_late).length;

  const activeEmployees = [
    ...(currentSession && currentSession.status === "active" ? [currentSession] : []),
    ...attendanceHistory.filter((a) => a.status === "active" || a.status === "late"),
  ];

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Management Overview</h2>
            <Badge variant="purple" size="sm" className="capitalize">
              {currentUser.role.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Real-time workforce monitoring and pending approval queues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/attendance">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Attendance Matrix</span>
            </Button>
          </Link>
          <Link href="/admin/worksheet">
            <Button size="sm" variant="primary" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Review Worksheets</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Management KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Live Presence */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Presence Today</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">16 / 18</h3>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 mt-1 font-semibold">
            <span>89% present</span>
            <span className="text-slate-400">• 2 on leave</span>
          </div>
        </Card>

        {/* KPI 2: Worksheets Queue */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Pending Worksheets</p>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{pendingReports.length}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting review</p>
        </Card>

        {/* KPI 3: Pending Leave */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Pending Leaves</p>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PlaneTakeoff className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{pendingLeaves.length}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Requires approval</p>
        </Card>

        {/* KPI 4: Late Check-ins */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Late Arrivals</p>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{lateCount}</h3>
          <p className="text-[11px] text-red-500 mt-1 font-semibold">Flagged past grace period</p>
        </Card>
      </div>

      {/* Live Ongoing Tasks Monitor */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Workforce & Live Ongoing Tasks</h3>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {activeEmployees.length} Currently Active
            </span>
          </div>
          <Link href="/admin/attendance" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            View Live Attendance &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeEmployees.map((s) => (
            <div key={s.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={s.user_avatar} alt={s.user_name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{s.user_name}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{s.department_name}</p>
                  </div>
                </div>
                <Badge variant={s.is_late ? "warning" : "success"} size="sm">
                  {s.is_late ? "Late" : "Active"}
                </Badge>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/70 dark:border-slate-700 shadow-xs">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Ongoing Task</p>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  {s.ongoing_task || "General Work"}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>In: {new Date(s.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDuration(s.duration_seconds)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Queues Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Worksheets Awaiting Review */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900">Worksheets Awaiting Approval</h3>
            <Link href="/admin/worksheet" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All ({pendingReports.length})
            </Link>
          </div>

          <div className="space-y-3">
            {pendingReports.length > 0 ? (
              pendingReports.map((report) => (
                <div key={report.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={report.user_avatar}
                        alt={report.user_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{report.user_name}</p>
                        <p className="text-[10px] text-slate-400">{report.report_date} • {report.department_name}</p>
                      </div>
                    </div>
                    <Badge variant="info" size="sm">
                      {(report.total_minutes / 60).toFixed(1)} hrs logged
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">{report.summary_notes}</p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/80">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => requestReportChanges(report.id, "Please detail the testing activities.")}
                    >
                      Request Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => approveReport(report.id, "Great work approved.")}
                    >
                      Approve Work
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No pending worksheets to review.</p>
            )}
          </div>
        </Card>

        {/* Right: Pending Leave Applications */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900">Leave Applications</h3>
            <Link href="/admin/management" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Manage Leaves
            </Link>
          </div>

          <div className="space-y-3">
            {pendingLeaves.length > 0 ? (
              pendingLeaves.map((leave) => (
                <div key={leave.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={leave.user_avatar}
                        alt={leave.user_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{leave.user_name}</p>
                        <p className="text-[10px] text-slate-400">{leave.department_name}</p>
                      </div>
                    </div>
                    <Badge variant="warning" size="sm">
                      {leave.leave_type} • {leave.days_count} days
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 italic">"{leave.reason}"</p>
                  <p className="text-[11px] text-slate-400">
                    Dates: {leave.start_date} to {leave.end_date}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/80">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => rejectLeave(leave.id)}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => approveLeave(leave.id)}
                    >
                      Approve Leave
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No pending leave requests.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

