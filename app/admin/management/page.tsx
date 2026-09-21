"use client";

import React, { useState } from "react";
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
  UserPlus
} from "lucide-react";
import { useApp, MOCK_USERS } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function AdminManagementPage() {
  const { departments, leaveRequests, approveLeave, rejectLeave } = useApp();

  const [activeTab, setActiveTab] = useState<"employees" | "departments" | "leave" | "reports">("employees");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  // Onboard form state
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDept, setNewDept] = useState("dept-eng");
  const [newRole, setNewRole] = useState("employee");

  // Mock list of employees
  const [employeeList, setEmployeeList] = useState([
    { id: "emp-1", name: "Nethmi Silva", email: "nethmi.silva@teamora.internal", empId: "EMP-1042", dept: "Engineering", role: "employee", title: "Frontend Engineer", active: true },
    { id: "emp-2", name: "Sarah Lin", email: "sarah.lin@teamora.internal", empId: "EMP-1018", dept: "Engineering", role: "sub_admin", title: "Engineering Lead", active: true },
    { id: "emp-3", name: "Dinesh Perera", email: "dinesh.p@teamora.internal", empId: "EMP-1033", dept: "Product & Design", role: "employee", title: "Product Designer", active: true },
    { id: "emp-4", name: "David Miller", email: "david.miller@teamora.internal", empId: "EMP-1005", dept: "Human Resources", role: "hr_admin", title: "HR Director", active: true },
    { id: "emp-5", name: "Elena Rostova", email: "elena.r@teamora.internal", empId: "EMP-1001", dept: "Executive", role: "owner", title: "CEO", active: true },
  ]);

  const filteredEmployees = employeeList.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirst.trim()) return;

    const newEmp = {
      id: `emp-${Date.now()}`,
      name: `${newFirst} ${newLast}`,
      email: newEmail,
      empId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      dept: departments.find(d => d.id === newDept)?.name || "Engineering",
      role: newRole,
      title: "Team Member",
      active: true,
    };

    setEmployeeList((prev) => [...prev, newEmp]);
    setShowOnboardModal(false);
    setNewFirst("");
    setNewLast("");
    setNewEmail("");
  };

  const toggleEmployeeActive = (id: string) => {
    setEmployeeList((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Workforce & Organizational Management</h2>
          <p className="text-xs text-slate-500">
            Manage employee accounts, department rosters, leave approvals, and workforce analytics.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowOnboardModal(true)}
          className="gap-1.5 self-start sm:self-auto text-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard Employee</span>
        </Button>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("employees")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "employees"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employees Directory ({employeeList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "departments"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
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
          <span>Leave Applications ({leaveRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "reports"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Workforce Analytics</span>
        </button>
      </div>

      {/* TAB 1: EMPLOYEES */}
      {activeTab === "employees" && (
        <Card className="p-6 space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, or department..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold">Employee</th>
                  <th className="p-3 font-semibold">Employee ID</th>
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 font-semibold">Role</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{emp.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{emp.title}</div>
                    </td>
                    <td className="p-3 text-slate-600">{emp.empId}</td>
                    <td className="p-3 text-slate-600">{emp.dept}</td>
                    <td className="p-3">
                      <Badge variant={emp.role === "owner" ? "purple" : emp.role === "sub_admin" ? "warning" : emp.role === "hr_admin" ? "info" : "neutral"} size="sm">
                        {emp.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 font-semibold ${emp.active ? "text-emerald-600" : "text-slate-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {emp.active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleEmployeeActive(emp.id)}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                          emp.active ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {emp.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
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
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {dept.code}
                </div>
                <Badge variant="neutral" size="sm">
                  {dept.member_count} Members
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lead: {dept.sub_admin_name || "Unassigned"}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-semibold">
                <button className="text-blue-600 hover:underline">View Roster</button>
                <button className="text-slate-600 hover:underline">Edit Dept</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: LEAVE APPLICATIONS */}
      {activeTab === "leave" && (
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Workforce Leave Applications
          </h3>

          <div className="space-y-4">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{leave.user_name}</span>
                    <Badge variant={leave.status === "approved" ? "success" : leave.status === "rejected" ? "danger" : "warning"} size="sm">
                      {leave.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {leave.leave_type} Leave • {leave.days_count} days ({leave.start_date} to {leave.end_date})
                  </p>
                  <p className="text-xs text-slate-600 italic mt-1">"{leave.reason}"</p>
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
            <h3 className="text-sm font-bold text-slate-900">Attendance Punctuality</h3>
            <p className="text-xs text-slate-500">Breakdown of on-time vs. late arrivals this month.</p>
            <div className="p-4 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-semibold">
              94.2% On-Time Check-In Rate
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Worksheet Utilization</h3>
            <p className="text-xs text-slate-500">Total logged activity hours compared to attendance hours.</p>
            <div className="p-4 bg-blue-50 rounded-xl text-blue-800 text-xs font-semibold">
              96.8% Worksheet Activity Correlation
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: ONBOARD EMPLOYEE */}
      <Modal
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        title="Onboard New Employee"
        description="Register a new workforce account and set initial access roles."
      >
        <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                value={newFirst}
                onChange={(e) => setNewFirst(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={newLast}
                onChange={(e) => setNewLast(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. employee@teamora.internal"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="employee">Normal Employee</option>
                <option value="sub_admin">Sub Admin</option>
                <option value="hr_admin">HR Admin</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowOnboardModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

