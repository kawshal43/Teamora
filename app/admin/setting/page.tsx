"use client";

import React, { useState } from "react";
import { 
  Building2, 
  Clock, 
  PlaneTakeoff, 
  ShieldCheck, 
  History, 
  Save, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AdminSettingPage() {
  const { orgSettings, updateOrgSettings } = useApp();

  const [activeTab, setActiveTab] = useState<"company" | "shifts" | "leave" | "audit">("shifts");
  const [savedMessage, setSavedMessage] = useState("");

  // Shift form
  const [startTime, setStartTime] = useState(orgSettings.work_start_time);
  const [endTime, setEndTime] = useState(orgSettings.work_end_time);
  const [gracePeriod, setGracePeriod] = useState(orgSettings.grace_period_minutes.toString());

  // Mock Audit Logs
  const auditLogs = [
    { id: "log-1", actor: "Elena Rostova", action: "UPDATED_WORK_SHIFT_POLICY", target: "Company Settings", time: "Today at 10:15 AM", details: "Grace period set to 15 minutes." },
    { id: "log-2", actor: "David Miller", action: "APPROVED_ATTENDANCE_CORRECTION", target: "Nethmi Silva (EMP-1042)", time: "Yesterday at 04:30 PM", details: "Clock timestamp adjusted from 09:20 to 09:00 AM." },
    { id: "log-3", actor: "Sarah Lin", action: "APPROVED_WORKSHEET_REPORT", target: "Nethmi Silva", time: "Yesterday at 05:40 PM", details: "Daily work summary of 8h approved without revisions." },
    { id: "log-4", actor: "David Miller", action: "ONBOARDED_EMPLOYEE", target: "Dinesh Perera", time: "Apr 18, 2025", details: "Assigned to Product & Design as Product Designer." },
  ];

  const handleSaveShifts = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrgSettings({
      work_start_time: startTime,
      work_end_time: endTime,
      grace_period_minutes: parseInt(gracePeriod, 10) || 15,
    });
    setSavedMessage("Shift policies updated successfully.");
    setTimeout(() => setSavedMessage(""), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Organizational Configuration & Policies</h2>
        <p className="text-xs text-slate-500">
          Configure working hours, late arrival grace periods, leave rules, and review audit trails.
        </p>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 font-semibold">
          <Check className="w-4 h-4" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("shifts")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "shifts"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Work Hours & Shifts</span>
        </button>

        <button
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "company"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("leave")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "leave"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <PlaneTakeoff className="w-4 h-4" />
          <span>Leave Policies</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "audit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          <span>System Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: SHIFTS */}
      {activeTab === "shifts" && (
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Attendance & Work Shift Rules
          </h3>

          <form onSubmit={handleSaveShifts} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Work Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Work End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Late-Arrival Grace Period (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
                className="w-full sm:w-1/2 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Clocking in after {startTime} + {gracePeriod} minutes automatically flags attendance as "Late".
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" variant="primary" className="gap-1.5">
                <Save className="w-3.5 h-3.5" />
                <span>Save Shift Rules</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: COMPANY PROFILE */}
      {activeTab === "company" && (
        <Card className="p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Company Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organization Name</label>
              <input
                type="text"
                defaultValue={orgSettings.name}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                readOnly
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Timezone</label>
              <input
                type="text"
                defaultValue="UTC (Coordinated Universal Time)"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                readOnly
              />
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: LEAVE POLICIES */}
      {activeTab === "leave" && (
        <Card className="p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Annual Leave Entitlement Templates
          </h3>

          <div className="space-y-3">
            {[
              { type: "Annual Leave", days: "14 days / year", paid: true },
              { type: "Sick Leave", days: "7 days / year", paid: true },
              { type: "Casual Leave", days: "5 days / year", paid: true },
              { type: "Unpaid Leave", days: "Flexible", paid: false },
            ].map((l, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{l.type}</span>
                  <span className="text-slate-400 text-[11px] block">{l.days}</span>
                </div>
                <Badge variant={l.paid ? "success" : "neutral"} size="sm">
                  {l.paid ? "Paid Leave" : "Unpaid"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === "audit" && (
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Chronological System Audit Trail
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.actor}</span>
                    <Badge variant="purple" size="sm">{log.action}</Badge>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right text-slate-400 text-[11px] whitespace-nowrap">
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

