"use client";

import React, { useState } from "react";
import { 
  Clock, 
  Search, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  ArrowUpDown, 
  Check, 
  X,
  FileSpreadsheet
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDuration } from "@/lib/utils";

export default function AdminAttendancePage() {
  const { 
    attendanceHistory, 
    currentSession, 
    corrections, 
    approveCorrection, 
    rejectCorrection 
  } = useApp();

  const [activeTab, setActiveTab] = useState<"matrix" | "corrections">("matrix");
  const [filterDept, setFilterDept] = useState("all");
  const [searchEmp, setSearchEmp] = useState("");
  const [exportMessage, setExportMessage] = useState("");

  const pendingCorrections = corrections.filter((c) => c.status === "pending");

  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Combine live session with historical sessions for complete view
  const allSessions = [
    ...(currentSession ? [currentSession] : []),
    ...attendanceHistory,
  ];

  const filteredSessions = allSessions.filter((s) => {
    const matchesDept = filterDept === "all" || s.department_name === filterDept;
    const matchesSearch = !searchEmp || (s.user_name && s.user_name.toLowerCase().includes(searchEmp.toLowerCase()));
    const matchesActive = !showActiveOnly || s.status === "active";
    return matchesDept && matchesSearch && matchesActive;
  });

  const handleExportCSV = () => {
    setExportMessage("Attendance report exported to CSV successfully.");
    setTimeout(() => setExportMessage(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance Monitoring & Corrections</h2>
          <p className="text-xs text-slate-500">
            Organization-wide check-in logs, punctuality matrix, and correction request reviews.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCSV}
          className="gap-1.5 self-start sm:self-auto text-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Attendance (.CSV)</span>
        </Button>
      </div>

      {exportMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 font-semibold">
          <Check className="w-4 h-4" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Sub-Tabs: Matrix vs Corrections */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "matrix"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Daily Attendance Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab("corrections")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "corrections"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Correction Requests ({pendingCorrections.length})</span>
        </button>
      </div>

      {/* TAB 1: ATTENDANCE MATRIX */}
      {activeTab === "matrix" && (
        <Card className="p-6 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchEmp}
                onChange={(e) => setSearchEmp(e.target.value)}
                placeholder="Search employee name..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  showActiveOnly
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showActiveOnly ? "bg-white animate-pulse" : "bg-blue-500"}`} />
                <span>Live Ongoing Tasks Only</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Dept:</span>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 text-xs focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {/* Mobile View: ONLY Name + Attend Mark (Green/Red) + Live Task */}
          <div className="sm:hidden divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] flex items-center justify-between border-b border-slate-200">
              <span>Employee</span>
              <span>Attendance & Live Task</span>
            </div>

            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No attendance sessions found.
              </div>
            ) : (
              filteredSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  {/* Left: Avatar + Name ONLY */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={s.user_avatar}
                        alt={s.user_name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/70"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 leading-tight truncate">
                        {s.user_name}
                      </h4>

                      <div className="mt-1 flex items-center gap-1.5">
                        {s.ongoing_task ? (
                          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 truncate max-w-[190px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                            <span className="truncate">⚡ {s.ongoing_task}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Checked in • {formatDuration(s.duration_seconds)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Attend mark (Green for present/active) */}
                  <div className="shrink-0 flex items-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Attended</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold">Employee</th>
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Check In</th>
                  <th className="p-3 font-semibold">Check Out</th>
                  <th className="p-3 font-semibold">Duration</th>
                  <th className="p-3 font-semibold">Ongoing Task</th>
                  <th className="p-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-2.5">
                      <img
                        src={s.user_avatar}
                        alt={s.user_name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <span>{s.user_name}</span>
                    </td>
                    <td className="p-3 text-slate-600">{s.department_name}</td>
                    <td className="p-3 text-slate-600">{s.work_date}</td>
                    <td className="p-3 font-medium text-slate-800">
                      {new Date(s.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {s.check_out ? new Date(s.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "— (Active)"}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {formatDuration(s.duration_seconds)}
                    </td>
                    <td className="p-3">
                      {s.ongoing_task ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            s.status === "active" 
                              ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs" 
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {s.status === "active" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            )}
                            <span>{s.ongoing_task}</span>
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">None recorded</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Badge variant={s.status === "completed" ? "success" : s.status === "active" ? "info" : "warning"} size="sm">
                        {s.is_late ? "Late Check-in" : s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: CORRECTIONS */}
      {activeTab === "corrections" && (
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Pending Attendance Timestamp Corrections
          </h3>

          <div className="space-y-4">
            {corrections.map((corr) => (
              <div key={corr.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{corr.user_name}</h4>
                    <p className="text-xs text-slate-400">Created: {new Date(corr.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={corr.status === "approved" ? "success" : corr.status === "rejected" ? "danger" : "warning"} size="sm">
                    {corr.status}
                  </Badge>
                </div>

                {/* Side-by-Side Timestamp Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
                    <p className="text-slate-400 dark:text-slate-500 font-medium">Original Recorded Times</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">
                      In: {new Date(corr.original_check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      Out: {corr.original_check_out ? new Date(corr.original_check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "None"}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-600 dark:text-blue-400 font-bold">Requested Correction</p>
                    <p className="font-semibold text-blue-950 mt-1">In: {corr.requested_check_in}</p>
                    <p className="font-semibold text-blue-950">Out: {corr.requested_check_out}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic">
                  Reason: "{corr.reason}"
                </p>

                {corr.status === "pending" && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    <Button size="sm" variant="danger" onClick={() => rejectCorrection(corr.id)}>
                      Reject
                    </Button>
                    <Button size="sm" variant="success" onClick={() => approveCorrection(corr.id)}>
                      Approve Correction
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

