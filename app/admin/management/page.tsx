"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Building2, 
  PlaneTakeoff, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  MoreVertical,
  Shield,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { UserProfile, UserRole } from "@/types";
import { cn } from "@/lib/utils";

export default function AdminManagementPage() {
  const { 
    currentUser,
    allEmployees, 
    updateEmployee, 
    deleteEmployee, 
    addEmployee, 
    toggleEmployeeActive,
    departments, 
    leaveRequests, 
    approveLeave, 
    rejectLeave,
    taskActivities,
    attendanceHistory,
    currentSession
  } = useApp();

  const [activeTab, setActiveTab] = useState<"employees" | "departments" | "leave" | "reports">("employees");
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Selected employee for Registration Details Modal
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit form state
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editEmpId, setEditEmpId] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("employee");
  const [editDesignation, setEditDesignation] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSkillsStr, setEditSkillsStr] = useState("");
  const [editJoinedDate, setEditJoinedDate] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  // Onboard form state
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDept, setNewDept] = useState("dept-eng");
  const [newRole, setNewRole] = useState<UserRole>("employee");
  const [newDesignation, setNewDesignation] = useState("Team Member");
  const [newPhone, setNewPhone] = useState("");
  const [newLocation, setNewLocation] = useState("Colombo, Sri Lanka");

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleOpenDetails = (emp: UserProfile, startInEditMode = false) => {
    setSelectedEmployee(emp);
    setIsEditing(startInEditMode);
    setShowDeleteConfirm(false);
    setEditFirstName(emp.first_name);
    setEditLastName(emp.last_name);
    setEditEmail(emp.email);
    setEditEmpId(emp.employee_id);
    setEditDept(emp.department_name || "Engineering");
    setEditRole(emp.role);
    setEditDesignation(emp.designation);
    setEditPhone(emp.phone || "");
    setEditLocation(emp.location || "Colombo, Sri Lanka");
    setEditBio(emp.bio || "");
    setEditSkillsStr((emp.skills || []).join(", "));
    setEditJoinedDate(emp.joined_date || "2024-01-15");
    setEditIsActive(emp.is_active);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const skillsArr = editSkillsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedData: Partial<UserProfile> = {
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      email: editEmail.trim(),
      employee_id: editEmpId.trim(),
      department_name: editDept,
      role: editRole,
      designation: editDesignation.trim(),
      phone: editPhone.trim(),
      location: editLocation.trim(),
      bio: editBio.trim(),
      skills: skillsArr,
      joined_date: editJoinedDate,
      is_active: editIsActive,
    };

    updateEmployee(selectedEmployee.id, updatedData);
    setSelectedEmployee((prev) => (prev ? { ...prev, ...updatedData } : null));
    setIsEditing(false);
    showNotification(`Registration details for ${editFirstName} ${editLastName} updated successfully!`);
  };

  const handleDeleteEmployee = () => {
    if (!selectedEmployee) return;
    const name = `${selectedEmployee.first_name} ${selectedEmployee.last_name}`;
    deleteEmployee(selectedEmployee.id);
    setSelectedEmployee(null);
    setShowDeleteConfirm(false);
    showNotification(`Employee ${name} has been removed from the directory.`, "success");
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirst.trim()) return;

    const selectedDepartment = departments.find((d) => d.id === newDept);

    addEmployee({
      organization_id: "org-teamora",
      employee_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      first_name: newFirst.trim(),
      last_name: newLast.trim(),
      email: newEmail.trim(),
      role: newRole,
      designation: newDesignation.trim() || "Team Member",
      department_id: newDept,
      department_name: selectedDepartment ? selectedDepartment.name : "Engineering",
      phone: newPhone.trim() || "+1 (555) 000-0000",
      location: newLocation.trim(),
      bio: "Newly onboarded Teamora team member.",
      skills: ["General", "Operations"],
      is_active: true,
      joined_date: new Date().toISOString().split("T")[0],
      avatar_url: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=300&auto=format&fit=crop&q=80`,
    });

    setShowOnboardModal(false);
    setNewFirst("");
    setNewLast("");
    setNewEmail("");
    showNotification(`New employee ${newFirst} ${newLast} successfully onboarded!`);
  };

  const filteredEmployees = allEmployees.filter((e) => {
    const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
    const matchesSearch = !searchQuery ||
      fullName.includes(searchQuery.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.department_name && e.department_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === "all" || e.department_name === deptFilter;
    const matchesRole = roleFilter === "all" || e.role === roleFilter;
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? e.is_active : !e.is_active);

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  if (currentUser.role === "employee") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-xs">
          <Shield className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Administrator Access Required
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Workforce & Organizational Management is restricted to administrators, HR directors, and company owners. Regular team members cannot inspect or modify employee registrations.
          </p>
        </div>
        <Link href="/">
          <Button size="sm" variant="primary">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Workforce & Organizational Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspect employee registration details, update profiles, manage department rosters, and approve leaves.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowOnboardModal(true)}
          className="gap-1.5 self-start sm:self-auto text-xs font-bold"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard Employee</span>
        </Button>
      </div>

      {feedbackMessage && (
        <div className={cn(
          "p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in",
          feedbackMessage.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
            : "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
        )}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("employees")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "employees"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employees Directory ({allEmployees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "departments"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("leave")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "leave"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <PlaneTakeoff className="w-4 h-4" />
          <span>Leave Applications ({leaveRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "reports"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Workforce Analytics</span>
        </button>
      </div>

      {/* TAB 1: EMPLOYEES DIRECTORY (Updated with Click-to-View Details, Edit, and Delete) */}
      {activeTab === "employees" && (
        <Card className="p-5 sm:p-6 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, email, role, or department..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
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

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Department Filter */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="employee">Employee</option>
                <option value="sub_admin">Sub Admin</option>
                <option value="hr_admin">HR Admin</option>
                <option value="owner">Company Owner</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Deactivated Only</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Showing {filteredEmployees.length} of {allEmployees.length} employees • Click any row or action to inspect and manage registration details.
          </div>

          {/* Mobile View: ONLY Name + Attend Mark (Green/Red) + Live Task */}
          <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            {/* Mobile Header Bar */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
              <span>Employee</span>
              <span>Attendance & Live Task</span>
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No employees found matching your filter.
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const empOngoing = taskActivities.find(
                  (t) => t.employee_id === emp.id && t.status === "Ongoing"
                );
                const empCompleted = taskActivities.filter(
                  (t) => t.employee_id === emp.id && t.status === "Completed"
                );
                const empLeave = leaveRequests.find(
                  (l) => l.user_id === emp.id && l.status === "approved" && l.start_date <= "2026-09-21" && l.end_date >= "2026-09-21"
                );
                const empSession = currentSession?.user_id === emp.id 
                  ? currentSession 
                  : attendanceHistory.find((s) => s.user_id === emp.id);

                const isAttended = !empLeave && (!!empOngoing || empCompleted.length > 0 || !!empSession);

                const liveTaskTitle = empOngoing
                  ? empOngoing.title
                  : empSession?.ongoing_task
                  ? empSession.ongoing_task
                  : null;

                return (
                  <div
                    key={emp.id}
                    onClick={() => handleOpenDetails(emp, false)}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer transition-colors"
                  >
                    {/* Left Column: Avatar + Name ONLY */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={emp.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                          alt={emp.first_name}
                          className={cn(
                            "w-10 h-10 rounded-full object-cover ring-2 transition-all",
                            isAttended 
                              ? "ring-emerald-500/70 dark:ring-emerald-500/80" 
                              : "ring-rose-500/70 dark:ring-rose-500/80"
                          )}
                        />
                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900",
                            isAttended 
                              ? "bg-emerald-500 animate-pulse" 
                              : "bg-rose-500"
                          )}
                        />
                      </div>

                      <div className="min-w-0">
                        {/* ONLY THE NAME */}
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">
                          {emp.first_name} {emp.last_name}
                        </h4>

                        {/* Live Task under name */}
                        <div className="mt-1 flex items-center gap-1.5">
                          {liveTaskTitle ? (
                            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[190px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                              <span className="truncate">⚡ {liveTaskTitle}</span>
                            </div>
                          ) : isAttended ? (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic truncate">
                              {empCompleted.length > 0 ? `✓ Completed (${empCompleted.length})` : "No active task"}
                            </span>
                          ) : empLeave ? (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 truncate">
                              <PlaneTakeoff className="w-3 h-3 shrink-0" />
                              <span>On Leave</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                              Not checked in
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Attend or Not (Green Mark if attended, Red Mark if not) */}
                    <div className="shrink-0 flex items-center">
                      {isAttended ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Attended</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>Not Attended</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Attendance & Live Task</th>
                  <th className="p-3.5">Employee ID</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredEmployees.map((emp) => {
                  const empOngoing = taskActivities.find(
                    (t) => t.employee_id === emp.id && t.status === "Ongoing"
                  );
                  const empCompleted = taskActivities.filter(
                    (t) => t.employee_id === emp.id && t.status === "Completed"
                  );
                  const empLeave = leaveRequests.find(
                    (l) => l.user_id === emp.id && l.status === "approved" && l.start_date <= "2026-09-21" && l.end_date >= "2026-09-21"
                  );
                  const empSession = currentSession?.user_id === emp.id 
                    ? currentSession 
                    : attendanceHistory.find((s) => s.user_id === emp.id);

                  const isAttended = !empLeave && (!!empOngoing || empCompleted.length > 0 || !!empSession);

                  const liveTaskTitle = empOngoing
                    ? empOngoing.title
                    : empSession?.ongoing_task
                    ? empSession.ongoing_task
                    : null;

                  return (
                    <tr 
                      key={emp.id} 
                      onClick={() => handleOpenDetails(emp, false)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                            alt={emp.first_name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {emp.first_name} {emp.last_name}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              {emp.designation} • {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1">
                          {isAttended ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Attended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Not Attended
                            </span>
                          )}
                          {liveTaskTitle ? (
                            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate max-w-[180px]">
                              <span>⚡ {liveTaskTitle}</span>
                            </div>
                          ) : empLeave ? (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <PlaneTakeoff className="w-3 h-3" />
                              <span>On Leave</span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                              No active task
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        {emp.employee_id}
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                        {emp.department_name || "General"}
                      </td>

                      <td className="p-3.5">
                        <Badge 
                          variant={
                            emp.role === "owner" 
                              ? "purple" 
                              : emp.role === "sub_admin" 
                              ? "warning" 
                              : emp.role === "hr_admin" 
                              ? "info" 
                              : "neutral"
                          } 
                          size="sm"
                        >
                          {emp.role.replace("_", " ")}
                        </Badge>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 font-bold text-[11px] ${emp.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {emp.is_active ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* View & Edit Details Button */}
                          <button
                            onClick={() => handleOpenDetails(emp, false)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer flex items-center gap-1"
                            title="View user registration details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() => handleOpenDetails(emp, true)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit user details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Deactivate/Reactivate */}
                          <button
                            onClick={() => toggleEmployeeActive(emp.id)}
                            className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                              emp.is_active 
                                ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50" 
                                : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                            }`}
                          >
                            {emp.is_active ? "Deactivate" : "Reactivate"}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                            title="Delete employee permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  {dept.code}
                </div>
                <Badge variant="neutral" size="sm">
                  {dept.member_count} Members
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{dept.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lead: {dept.sub_admin_name || "Unassigned"}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 font-semibold">
                <button className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">View Roster</button>
                <button className="text-slate-600 dark:text-slate-300 hover:underline cursor-pointer">Edit Dept</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: LEAVE APPLICATIONS */}
      {activeTab === "leave" && (
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Workforce Leave Applications
          </h3>

          <div className="space-y-4">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{leave.user_name}</span>
                    <Badge variant={leave.status === "approved" ? "success" : leave.status === "rejected" ? "danger" : "warning"} size="sm">
                      {leave.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {leave.leave_type} Leave • {leave.days_count} days ({leave.start_date} to {leave.end_date})
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1">&ldquo;{leave.reason}&rdquo;</p>
                </div>

                {leave.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="danger" onClick={() => rejectLeave(leave.id)}>
                      Reject
                    </Button>
                    <Button size="sm" variant="success" onClick={() => approveLeave(leave.id)}>
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: REPORTS */}
      {activeTab === "reports" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Punctuality</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Breakdown of on-time vs. late arrivals this month.</p>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold">
              94.2% On-Time Check-In Rate across organization
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Worksheet Utilization</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total logged activity hours compared to attendance hours.</p>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold">
              96.8% Worksheet Activity Correlation
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: USER REGISTRATION DETAILS (VIEW / EDIT / DELETE)                  */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!selectedEmployee}
        onClose={() => {
          setSelectedEmployee(null);
          setIsEditing(false);
          setShowDeleteConfirm(false);
        }}
        title={
          showDeleteConfirm
            ? "Confirm Employee Deletion"
            : isEditing
            ? `Update Registration Details`
            : `User Registration Details`
        }
        description={
          showDeleteConfirm
            ? "This action cannot be undone. Please confirm permanent deletion."
            : isEditing
            ? "Modify workforce account, role privileges, and contact details."
            : "Complete verified registration information stored in Teamora."
        }
        maxWidth="lg"
      >
        {selectedEmployee && (
          <div>
            {/* DELETE CONFIRMATION SCREEN */}
            {showDeleteConfirm ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-900 dark:text-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">
                      Permanently delete {selectedEmployee.first_name} {selectedEmployee.last_name}?
                    </p>
                    <p className="text-red-700 dark:text-red-300 leading-relaxed">
                      All registration credentials, assigned department roles, and directory visibility for <strong>{selectedEmployee.email}</strong> ({selectedEmployee.employee_id}) will be removed.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteEmployee}
                    className="gap-1.5 font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </Button>
                </div>
              </div>
            ) : isEditing ? (
              /* ========================================================= */
              /* EDIT / UPDATE FORM                                         */
              /* ========================================================= */
              <form onSubmit={handleSaveEdit} className="space-y-4 pt-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={editEmpId}
                      onChange={(e) => setEditEmpId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Designation / Job Title
                    </label>
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      System Role
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as UserRole)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                    >
                      <option value="employee">Normal Employee</option>
                      <option value="sub_admin">Sub Admin (Lead)</option>
                      <option value="hr_admin">HR Admin</option>
                      <option value="owner">Company Owner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Office Location
                    </label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="e.g. Seattle, WA"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bio / Personal Summary
                  </label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Short professional summary..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={editSkillsStr}
                    onChange={(e) => setEditSkillsStr(e.target.value)}
                    placeholder="e.g. TypeScript, React, System Design, GraphQL"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Active Account Status</span>
                    <span className="text-[11px] text-slate-400">Controls whether user can log in and record times</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="gap-1.5 font-bold"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            ) : (
              /* ========================================================= */
              /* VIEW MODE: DETAILED REGISTRATION INSPECTOR                 */
              /* ========================================================= */
              <div className="space-y-4 pt-1 text-xs">
                {/* Profile Header Box */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={selectedEmployee.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={selectedEmployee.first_name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500 shrink-0"
                    />
                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {selectedEmployee.first_name} {selectedEmployee.last_name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                        {selectedEmployee.designation} • {selectedEmployee.department_name || "Engineering"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge 
                          variant={
                            selectedEmployee.role === "owner" 
                              ? "purple" 
                              : selectedEmployee.role === "sub_admin" 
                              ? "warning" 
                              : selectedEmployee.role === "hr_admin" 
                              ? "info" 
                              : "neutral"
                          } 
                          size="sm"
                        >
                          {selectedEmployee.role.replace("_", " ")}
                        </Badge>
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                          selectedEmployee.is_active 
                            ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300" 
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedEmployee.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {selectedEmployee.is_active ? "Active Workforce" : "Deactivated"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                    {selectedEmployee.employee_id}
                  </span>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      Work Email
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 select-all">
                      {selectedEmployee.email}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      Phone Number
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedEmployee.phone || "Not provided"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      Office Location
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedEmployee.location || "Colombo, Sri Lanka"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      Date Joined
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedEmployee.joined_date || "2024-01-15"}
                    </p>
                  </div>
                </div>

                {/* Bio / Summary */}
                {selectedEmployee.bio && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Professional Summary & Bio
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedEmployee.bio}
                    </p>
                  </div>
                )}

                {/* Skills Tags */}
                {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Verified Competencies & Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEmployee.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete User</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toggleEmployeeActive(selectedEmployee.id);
                        setSelectedEmployee((prev) => prev ? { ...prev, is_active: !prev.is_active } : null);
                        showNotification(
                          `${selectedEmployee.first_name} is now ${selectedEmployee.is_active ? "deactivated" : "reactivated"}.`
                        );
                      }}
                    >
                      {selectedEmployee.is_active ? "Deactivate Account" : "Reactivate Account"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEmployee(null)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="gap-1.5 font-bold"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Update / Change</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: ONBOARD NEW EMPLOYEE                                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        title="Onboard New Employee"
        description="Register a new workforce account and set initial access roles."
      >
        <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                value={newFirst}
                onChange={(e) => setNewFirst(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                value={newLast}
                onChange={(e) => setNewLast(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. employee@teamora.internal"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
              <input
                type="text"
                value={newDesignation}
                onChange={(e) => setNewDesignation(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="employee">Normal Employee</option>
                <option value="sub_admin">Sub Admin</option>
                <option value="hr_admin">HR Admin</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowOnboardModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="font-bold">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
