"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserProfile,
  UserRole,
  AttendanceSession,
  AttendanceCorrection,
  FeedPost,
  WorksheetActivity,
  WorksheetReport,
  Task,
  LeaveRequest,
  Department,
  OrganizationSettings,
  TaskActivity,
  TaskRevision,
  TaskActivityStatus,
  TaskEntryMode,
  ReactionType,
} from "@/types";

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  employee: {
    id: "user-nethmi",
    organization_id: "org-teamora",
    department_id: "dept-eng",
    department_name: "Engineering",
    employee_id: "EMP-1042",
    first_name: "Nethmi",
    last_name: "Silva",
    email: "nethmi.silva@teamora.internal",
    role: "employee",
    designation: "Frontend Engineer",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
    bio: "Passionate about creating fluid, accessible user interfaces with Next.js, Tailwind CSS, and TypeScript. Lifelong learner and design system enthusiast.",
    location: "Colombo, Sri Lanka",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "UI Design"],
    phone: "+1 (555) 234-8921",
    is_active: true,
    joined_date: "2024-03-15",
  },
  sub_admin: {
    id: "user-sarah",
    organization_id: "org-teamora",
    department_id: "dept-eng",
    department_name: "Engineering",
    employee_id: "EMP-1018",
    first_name: "Sarah",
    last_name: "Lin",
    email: "sarah.lin@teamora.internal",
    role: "sub_admin",
    designation: "Engineering Lead",
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
    bio: "Leading engineering teams building reliable, scalable systems. Dedicated to code craftsmanship, mentor culture, and high velocity.",
    location: "San Francisco, CA",
    skills: ["Architecture", "React/Next.js", "Node.js", "PostgreSQL", "Cloud Systems", "Team Leadership"],
    phone: "+1 (555) 432-1098",
    is_active: true,
    joined_date: "2023-01-10",
  },
  hr_admin: {
    id: "user-david",
    organization_id: "org-teamora",
    department_id: "dept-hr",
    department_name: "Human Resources",
    employee_id: "EMP-1005",
    first_name: "David",
    last_name: "Miller",
    email: "david.miller@teamora.internal",
    role: "hr_admin",
    designation: "HR Director",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80",
    bio: "Championing workplace equity, transparent performance frameworks, and building our global hybrid culture.",
    location: "Austin, TX",
    skills: ["Talent Operations", "Workforce Analytics", "Culture Strategy", "Employee Relations"],
    phone: "+1 (555) 678-9012",
    is_active: true,
    joined_date: "2022-08-01",
  },
  owner: {
    id: "user-elena",
    organization_id: "org-teamora",
    department_id: "dept-exec",
    department_name: "Executive",
    employee_id: "EMP-1001",
    first_name: "Elena",
    last_name: "Rostova",
    email: "elena.rostova@teamora.internal",
    role: "owner",
    designation: "Chief Executive Officer",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
    bio: "CEO & Co-founder at Teamora. Uniting cross-functional company operations through seamless social workflows.",
    location: "New York, NY",
    skills: ["Executive Leadership", "Product Strategy", "Venture Growth", "Enterprise Operations"],
    phone: "+1 (555) 111-2233",
    is_active: true,
    joined_date: "2021-01-01",
  },
};

export const ALL_EMPLOYEES: UserProfile[] = [
  MOCK_USERS.employee,
  MOCK_USERS.sub_admin,
  MOCK_USERS.hr_admin,
  MOCK_USERS.owner,
  {
    id: "user-dinesh",
    organization_id: "org-teamora",
    department_id: "dept-des",
    department_name: "Product & Design",
    employee_id: "EMP-1033",
    first_name: "Dinesh",
    last_name: "Perera",
    email: "dinesh.perera@teamora.internal",
    role: "employee",
    designation: "Product Designer",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=80",
    bio: "Translating complex operational workflows into intuitive, delight-driven interface systems and typography.",
    location: "Colombo, Sri Lanka",
    skills: ["Product Design", "Figma", "Design Systems", "User Research", "Prototyping"],
    phone: "+1 (555) 789-0123",
    is_active: true,
    joined_date: "2023-11-15",
  },
  {
    id: "user-alex",
    organization_id: "org-teamora",
    department_id: "dept-eng",
    department_name: "Engineering",
    employee_id: "EMP-1025",
    first_name: "Alex",
    last_name: "Chen",
    email: "alex.chen@teamora.internal",
    role: "employee",
    designation: "Full Stack Engineer",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    bio: "Full stack web developer passionate about API scalability, Next.js server actions, and cloud databases.",
    location: "Seattle, WA",
    skills: ["Full Stack", "TypeScript", "Node.js", "GraphQL", "PostgreSQL", "Docker"],
    phone: "+1 (555) 321-6549",
    is_active: true,
    joined_date: "2023-04-12",
  },
  {
    id: "user-nimal",
    organization_id: "org-teamora",
    department_id: "dept-eng",
    department_name: "Engineering",
    employee_id: "EMP-1055",
    first_name: "Nimal",
    last_name: "Perera",
    email: "nimal.perera@teamora.internal",
    role: "employee",
    designation: "Video Producer & Editor",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80",
    bio: "Visual storyteller focusing on company keynotes, media production, and documentation reels.",
    location: "Kandy, Sri Lanka",
    skills: ["Motion Graphics", "Video Editing", "Creative Direction", "Media Production"],
    phone: "+1 (555) 987-6543",
    is_active: true,
    joined_date: "2024-06-01",
  },
  {
    id: "user-marcus",
    organization_id: "org-teamora",
    department_id: "dept-eng",
    department_name: "Engineering",
    employee_id: "EMP-1012",
    first_name: "Marcus",
    last_name: "Vance",
    email: "marcus.vance@teamora.internal",
    role: "sub_admin",
    designation: "DevOps Engineer",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    bio: "Automating cloud infrastructure, zero-downtime deployments, and platform telemetry across Kubernetes.",
    location: "Denver, CO",
    skills: ["DevOps", "Kubernetes", "AWS", "Terraform", "CI/CD", "Monitoring"],
    phone: "+1 (555) 456-7890",
    is_active: true,
    joined_date: "2022-10-01",
  },
  {
    id: "user-priya",
    organization_id: "org-teamora",
    department_id: "dept-ops",
    department_name: "Operations & Sales",
    employee_id: "EMP-1060",
    first_name: "Priya",
    last_name: "Sharma",
    email: "priya.sharma@teamora.internal",
    role: "employee",
    designation: "Data Analytics Lead",
    avatar_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    bio: "Unlocking business value and team productivity insights through data science and intelligence dashboards.",
    location: "Chicago, IL",
    skills: ["Data Analytics", "Python", "SQL", "Tableau", "Forecasting", "Business Intelligence"],
    phone: "+1 (555) 890-1234",
    is_active: true,
    joined_date: "2024-01-15",
  },
  {
    id: "user-kevin",
    organization_id: "org-teamora",
    department_id: "dept-eng",
    department_name: "Engineering",
    employee_id: "EMP-1077",
    first_name: "Kevin",
    last_name: "Zhang",
    email: "kevin.zhang@teamora.internal",
    role: "employee",
    designation: "QA Automation Engineer",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    bio: "Ensuring software excellence with automated testing suites, regression verification, and performance profiling.",
    location: "Toronto, Canada",
    skills: ["Playwright", "Cypress", "Automated QA", "Jest", "Load Testing"],
    phone: "+1 (555) 678-4321",
    is_active: true,
    joined_date: "2024-05-10",
  },
  {
    id: "user-rachel",
    organization_id: "org-teamora",
    department_id: "dept-mkt",
    department_name: "Marketing",
    employee_id: "EMP-1082",
    first_name: "Rachel",
    last_name: "Adams",
    email: "rachel.adams@teamora.internal",
    role: "employee",
    designation: "Marketing Specialist",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    bio: "Crafting impactful brand narratives, social campaigns, and internal workforce communications.",
    location: "Boston, MA",
    skills: ["Content Strategy", "Social Media", "Copywriting", "Communications", "Campaigns"],
    phone: "+1 (555) 345-6789",
    is_active: true,
    joined_date: "2024-02-20",
  },
  {
    id: "user-liam",
    organization_id: "org-teamora",
    department_id: "dept-eng",
    department_name: "Engineering",
    employee_id: "EMP-1008",
    first_name: "Liam",
    last_name: "O'Connor",
    email: "liam.oconnor@teamora.internal",
    role: "sub_admin",
    designation: "Cloud Architect",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
    bio: "Designing secure, high-throughput cloud infrastructure and zero-trust security postures for enterprise scale.",
    location: "Dublin, Ireland",
    skills: ["Cloud Architecture", "AWS/GCP", "Zero Trust", "Terraform", "Distributed Systems"],
    phone: "+1 (555) 567-8901",
    is_active: true,
    joined_date: "2022-11-01",
  },
];

export function formatSecondsToDigital(seconds: number): string {
  const safeSecs = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSecs / 3600);
  const mins = Math.floor((safeSecs % 3600) / 60);
  const secs = safeSecs % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function formatSecondsToHuman(seconds: number): string {
  const safeSecs = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSecs / 3600);
  const mins = Math.floor((safeSecs % 3600) / 60);
  const secs = safeSecs % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatTimeAmPm(isoOrTimeStr: string): string {
  if (!isoOrTimeStr) return "";
  const d = new Date(isoOrTimeStr);
  if (isNaN(d.getTime())) return isoOrTimeStr;
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

interface AppContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  currentSession: AttendanceSession | null;
  attendanceHistory: AttendanceSession[];
  checkIn: () => void;
  checkOut: () => void;
  liveDurationSeconds: number;
  corrections: AttendanceCorrection[];
  submitCorrection: (sessionId: string, requestedIn: string, requestedOut: string, reason: string) => void;
  approveCorrection: (correctionId: string) => void;
  rejectCorrection: (correctionId: string) => void;
  tasks: Task[];
  toggleTaskStatus: (taskId: string) => void;
  createTask: (title: string, priority: Task["priority"], dueDate: string, assignedTo: string, description?: string, status?: Task["status"]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  posts: FeedPost[];
  createPost: (content: string, attachments?: any[], isAnnouncement?: boolean, targetDept?: string, isAnonymous?: boolean) => void;
  toggleLike: (postId: string) => void;
  reactToPost: (postId: string, reaction: ReactionType) => void;
  addComment: (postId: string, content: string) => void;
  deletePost: (postId: string) => void;
  updateEmployee: (id: string, data: Partial<UserProfile>) => void;
  deleteEmployee: (id: string) => void;
  addEmployee: (employee: Omit<UserProfile, "id">) => void;
  toggleEmployeeActive: (id: string) => void;
  activities: WorksheetActivity[];
  reports: WorksheetReport[];
  addActivity: (activity: Omit<WorksheetActivity, "id" | "user_id" | "is_submitted">) => void;
  deleteActivity: (id: string) => void;
  submitDailyReport: (date: string, notes?: string) => void;
  approveReport: (reportId: string, feedback?: string) => void;
  requestReportChanges: (reportId: string, feedback: string) => void;
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (type: LeaveRequest["leave_type"], start: string, end: string, days: number, reason: string) => void;
  approveLeave: (id: string) => void;
  rejectLeave: (id: string) => void;
  setEmployeeLeaveStatus: (userId: string, isOnLeave: boolean, leaveType?: LeaveRequest["leave_type"], reason?: string) => void;
  departments: Department[];
  orgSettings: OrganizationSettings;
  updateOrgSettings: (newSettings: Partial<OrganizationSettings>) => void;

  // Worksheet V2.0 Live Task Tracking
  taskActivities: TaskActivity[];
  taskRevisions: TaskRevision[];
  activeTask: TaskActivity | null;
  activeTaskElapsedSeconds: number;
  todayTotalWorkSeconds: number;
  allEmployees: UserProfile[];
  startLiveTask: (title: string, category?: TaskActivity["category"], description?: string) => Promise<{ success: boolean; requiresSwitchConfirmation?: boolean; ongoingTask?: TaskActivity }>;
  confirmTaskSwitch: (newTitle: string, category?: TaskActivity["category"], description?: string) => void;
  endActiveTask: (manualEndTime?: string) => void;
  createManualTask: (data: { title: string; category?: TaskActivity["category"]; description?: string; start_at: string; end_at: string; employee_id?: string }) => { success: boolean; conflict?: TaskActivity };
  updateTaskActivity: (taskId: string, updates: Partial<TaskActivity>, reason?: string) => void;
  updateMultipleTasks: (taskUpdates: { taskId: string; updates: Partial<TaskActivity>; reason?: string }[]) => void;
  deleteTaskActivity: (taskId: string) => void;
  checkOverlap: (employeeId: string, startAt: string, endAt: string, excludeTaskId?: string) => TaskActivity | null;

  // UI Modal Controls
  isTaskPopupOpen: boolean;
  setIsTaskPopupOpen: (open: boolean) => void;
  taskPopupAnchor: { x: number; y: number; width?: number; height?: number } | null;
  setTaskPopupAnchor: (anchor: { x: number; y: number; width?: number; height?: number } | null) => void;
  editingTask: TaskActivity | null;
  setEditingTask: (task: TaskActivity | null) => void;
  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (open: boolean) => void;
  createTaskModalPrefill: { date?: string; hour?: number; minute?: number } | null;
  setCreateTaskModalPrefill: (data: { date?: string; hour?: number; minute?: number } | null) => void;
  switchModalData: { isOpen: boolean; pendingTitle: string; pendingCategory?: TaskActivity["category"]; pendingDescription?: string } | null;
  setSwitchModalData: (data: { isOpen: boolean; pendingTitle: string; pendingCategory?: TaskActivity["category"]; pendingDescription?: string } | null) => void;

  // Dark & Light Mode Theme Support
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;

  // User Profile Inspection
  selectedProfileUser: UserProfile | null;
  openUserProfile: (userOrId: string | UserProfile) => void;
  closeUserProfile: () => void;
}

const STORAGE_KEY_TASKS = "teamora_task_activities_v2";
const STORAGE_KEY_REVISIONS = "teamora_task_revisions_v2";
const STORAGE_KEY_THEME = "teamora_theme";

/**
 * Strict Task Overlap Sanitizer:
 * Enforces zero overlap for any employee on any given day.
 * If consecutive tasks overlap: the above task's end time is shifted earlier (upper) to
 * flush with the succeeding task's start time ("above box must go upper").
 */
export function resolveTaskOverlaps(tasks: TaskActivity[]): TaskActivity[] {
  if (!tasks || tasks.length <= 1) return tasks || [];

  // Group by employee_id and calendar date (YYYY-MM-DD)
  const employeeDateMap = new Map<string, TaskActivity[]>();

  tasks.forEach((task) => {
    const d = new Date(task.start_at);
    const dateKey = !isNaN(d.getTime())
      ? `${task.employee_id}_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      : `${task.employee_id}_unknown`;

    if (!employeeDateMap.has(dateKey)) {
      employeeDateMap.set(dateKey, []);
    }
    employeeDateMap.get(dateKey)!.push({ ...task });
  });

  const resolvedTasks: TaskActivity[] = [];

  employeeDateMap.forEach((dayTasks) => {
    // Sort tasks by start_at ascending
    dayTasks.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

    for (let i = 0; i < dayTasks.length - 1; i++) {
      const current = dayTasks[i];
      const next = dayTasks[i + 1];

      const currentStartMs = new Date(current.start_at).getTime();
      const currentEndMs = current.end_at
        ? new Date(current.end_at).getTime()
        : (current.duration_seconds ? currentStartMs + current.duration_seconds * 1000 : currentStartMs + 3600000);
      const nextStartMs = new Date(next.start_at).getTime();

      // If current task overlaps into next task: "above box must go upper"
      if (currentEndMs > nextStartMs) {
        if (nextStartMs >= currentStartMs + 5 * 60 * 1000) {
          // Above box's end time moves upper to next task's start time
          current.end_at = next.start_at;
          current.duration_seconds = Math.max(300, Math.floor((nextStartMs - currentStartMs) / 1000));
          if (current.status === "Ongoing") {
            current.status = "Completed";
          }
          current.updated_at = new Date().toISOString();
        } else {
          // Less than 5 mins space: push above box's start earlier so it maintains at least 5 mins
          const shiftedStartMs = nextStartMs - 5 * 60 * 1000;
          current.start_at = new Date(shiftedStartMs).toISOString();
          current.end_at = next.start_at;
          current.duration_seconds = 300;
          if (current.status === "Ongoing") {
            current.status = "Completed";
          }
          current.updated_at = new Date().toISOString();
        }
      }
    }

    resolvedTasks.push(...dayTasks);
  });

  return resolvedTasks;
}

function generateInitialTasks(): TaskActivity[] {
  const now = Date.now();
  // Ongoing task started 1h 24m 35s ago (5075 seconds)
  const ongoingStart = new Date(now - (1 * 3600 + 24 * 60 + 35) * 1000).toISOString();
  // Completed task 2 (Social Media Scheduling, 30 min duration)
  const task2End = ongoingStart;
  const task2Start = new Date(new Date(task2End).getTime() - 30 * 60 * 1000).toISOString();
  // Completed task 1 (Content Planning, 60 min duration)
  const task1End = task2Start;
  const task1Start = new Date(new Date(task1End).getTime() - 60 * 60 * 1000).toISOString();

  return [
    {
      id: "act-live-nethmi",
      organization_id: "org-teamora",
      employee_id: "user-nethmi",
      employee_name: "Nethmi Silva",
      employee_avatar: MOCK_USERS.employee.avatar_url,
      department_name: "Engineering",
      title: "Video Editing",
      category: "Development",
      description: "Editing product promotional and tutorial videos for the new feature release.",
      start_at: ongoingStart,
      end_at: null,
      status: "Ongoing",
      entry_mode: "live",
      created_at: ongoingStart,
      updated_at: ongoingStart,
      created_by: "user-nethmi",
      version: 1,
    },
    {
      id: "act-comp-2",
      organization_id: "org-teamora",
      employee_id: "user-nethmi",
      employee_name: "Nethmi Silva",
      employee_avatar: MOCK_USERS.employee.avatar_url,
      department_name: "Engineering",
      title: "Social Media Scheduling",
      category: "Planning",
      description: "Scheduling community posts and feature announcement banners.",
      start_at: task2Start,
      end_at: task2End,
      duration_seconds: 1800,
      status: "Completed",
      entry_mode: "live",
      created_at: task2Start,
      updated_at: task2End,
      created_by: "user-nethmi",
      version: 1,
    },
    {
      id: "act-comp-1",
      organization_id: "org-teamora",
      employee_id: "user-nethmi",
      employee_name: "Nethmi Silva",
      employee_avatar: MOCK_USERS.employee.avatar_url,
      department_name: "Engineering",
      title: "Content Planning",
      category: "Planning",
      description: "Drafting script outlines and team asset requirements.",
      start_at: task1Start,
      end_at: task1End,
      duration_seconds: 3600,
      status: "Completed",
      entry_mode: "live",
      created_at: task1Start,
      updated_at: task1End,
      created_by: "user-nethmi",
      version: 1,
    },
    // Nimal Perera (Colleague featured in Admin mockup)
    {
      id: "act-live-nimal",
      organization_id: "org-teamora",
      employee_id: "user-nimal",
      employee_name: "Nimal Perera",
      department_name: "Engineering",
      title: "Video Editing",
      category: "Development",
      description: "Rendering high-resolution video sequences.",
      start_at: ongoingStart,
      end_at: null,
      status: "Ongoing",
      entry_mode: "live",
      created_at: ongoingStart,
      updated_at: ongoingStart,
      created_by: "user-nimal",
      version: 1,
    },
    {
      id: "act-comp-nimal-2",
      organization_id: "org-teamora",
      employee_id: "user-nimal",
      employee_name: "Nimal Perera",
      department_name: "Engineering",
      title: "Social Media Scheduling",
      category: "Planning",
      start_at: task2Start,
      end_at: task2End,
      duration_seconds: 1800,
      status: "Completed",
      entry_mode: "live",
      created_at: task2Start,
      updated_at: task2End,
      created_by: "user-nimal",
      version: 1,
    },
    {
      id: "act-comp-nimal-1",
      organization_id: "org-teamora",
      employee_id: "user-nimal",
      employee_name: "Nimal Perera",
      department_name: "Engineering",
      title: "Content Planning",
      category: "Planning",
      start_at: task1Start,
      end_at: task1End,
      duration_seconds: 3600,
      status: "Completed",
      entry_mode: "live",
      created_at: task1Start,
      updated_at: task1End,
      created_by: "user-nimal",
      version: 1,
    },
    // Dinesh Perera (Design lead)
    {
      id: "act-comp-dinesh",
      organization_id: "org-teamora",
      employee_id: "user-dinesh",
      employee_name: "Dinesh Perera",
      department_name: "Product & Design",
      title: "UI Design Mockup Polish",
      category: "Design",
      start_at: task1Start,
      end_at: task2End,
      duration_seconds: 5400,
      status: "Completed",
      entry_mode: "live",
      created_at: task1Start,
      updated_at: task2End,
      created_by: "user-dinesh",
      version: 1,
    },
    // Sarah Lin (Sub Admin)
    {
      id: "act-live-sarah",
      organization_id: "org-teamora",
      employee_id: "user-sarah",
      employee_name: "Sarah Lin",
      department_name: "Engineering",
      title: "Mobile Bottom Menu Code Review",
      category: "Review",
      start_at: new Date(now - 45 * 60 * 1000).toISOString(),
      end_at: null,
      status: "Ongoing",
      entry_mode: "live",
      created_at: new Date(now - 45 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 45 * 60 * 1000).toISOString(),
      created_by: "user-sarah",
      version: 1,
    }
  ];
}

function generateInitialRevisions(): TaskRevision[] {
  return [
    {
      id: "rev-init-1",
      task_id: "act-live-nethmi",
      task_title: "Video Editing",
      original_start: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      original_end: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updated_start: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      updated_end: new Date(Date.now()).toISOString(),
      edited_by: "user-nethmi",
      edited_by_name: "Nethmi Silva",
      edited_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      reason: "Extended editing session to finish color grading and export presets.",
      was_live_recorded: true,
    }
  ];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.employee);
  
  // Worksheet V2.0 Task Activities and Revisions State
  const [taskActivities, setTaskActivities] = useState<TaskActivity[]>(generateInitialTasks);
  const [taskRevisions, setTaskRevisions] = useState<TaskRevision[]>(generateInitialRevisions);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Load from localStorage on client mount to prevent Next.js hydration errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
      if (savedTasks) {
        try {
          const parsed = JSON.parse(savedTasks);
          setTaskActivities(resolveTaskOverlaps(parsed));
        } catch (e) {
          console.error("Failed to parse saved task activities", e);
        }
      }
      const savedRevs = localStorage.getItem(STORAGE_KEY_REVISIONS);
      if (savedRevs) {
        try {
          setTaskRevisions(JSON.parse(savedRevs));
        } catch (e) {
          console.error("Failed to parse saved task revisions", e);
        }
      }
      setHasHydrated(true);
    }
  }, []);

  // Modal and UI Controls
  const [isTaskPopupOpen, setIsTaskPopupOpen] = useState(false);
  const [taskPopupAnchor, setTaskPopupAnchor] = useState<{ x: number; y: number; width?: number; height?: number } | null>(null);
  const [editingTask, setEditingTask] = useState<TaskActivity | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [createTaskModalPrefill, setCreateTaskModalPrefill] = useState<{ date?: string; hour?: number; minute?: number } | null>(null);
  const [switchModalData, setSwitchModalData] = useState<{ isOpen: boolean; pendingTitle: string; pendingCategory?: TaskActivity["category"]; pendingDescription?: string } | null>(null);

  // Dark & Light Mode Theme Support
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as "light" | "dark" | null;
      const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      setThemeState(initialTheme);
      if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_THEME, newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // User Profile Inspection Modal State
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfile | null>(null);

  const openUserProfile = (userOrId: string | UserProfile) => {
    if (!userOrId) return;
    if (typeof userOrId === "object") {
      setSelectedProfileUser(userOrId);
      return;
    }
    const idStr = String(userOrId).trim().toLowerCase();
    const found =
      ALL_EMPLOYEES.find(
        (u) =>
          u.id.toLowerCase() === idStr ||
          u.employee_id.toLowerCase() === idStr ||
          u.email.toLowerCase() === idStr ||
          `${u.first_name} ${u.last_name}`.toLowerCase() === idStr ||
          u.first_name.toLowerCase() === idStr
      ) ||
      Object.values(MOCK_USERS).find(
        (u) =>
          u.id.toLowerCase() === idStr ||
          u.employee_id.toLowerCase() === idStr ||
          `${u.first_name} ${u.last_name}`.toLowerCase() === idStr
      );
    if (found) {
      setSelectedProfileUser(found);
    }
  };

  const closeUserProfile = () => setSelectedProfileUser(null);

  // Sync to localStorage after hydration
  useEffect(() => {
    if (hasHydrated && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(taskActivities));
    }
  }, [taskActivities, hasHydrated]);

  useEffect(() => {
    if (hasHydrated && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_REVISIONS, JSON.stringify(taskRevisions));
    }
  }, [taskRevisions, hasHydrated]);

  // Master 1-second interval for clock synchronization
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute active task for currentUser
  const activeTask = taskActivities.find(
    (t) => t.employee_id === currentUser.id && t.status === "Ongoing"
  ) || null;

  // Compute live elapsed seconds for active task via pure timestamp math
  const activeTaskElapsedSeconds = activeTask
    ? Math.max(0, Math.floor((nowTimestamp - new Date(activeTask.start_at).getTime()) / 1000))
    : 0;

  // Compute today's total work seconds
  const todayDateStr = new Date(nowTimestamp).toISOString().split("T")[0];
  const todayCompletedSeconds = taskActivities
    .filter((t) => t.employee_id === currentUser.id && t.status === "Completed")
    .filter((t) => t.start_at.startsWith(todayDateStr) || (t.end_at && t.end_at.startsWith(todayDateStr)))
    .reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);

  const todayTotalWorkSeconds = todayCompletedSeconds + activeTaskElapsedSeconds;

  const todayStr = "2025-04-22";
  const initialCheckIn = new Date("2025-04-22T09:02:00");

  const [currentSession, setCurrentSession] = useState<AttendanceSession | null>({
    id: "att-today",
    organization_id: "org-teamora",
    user_id: MOCK_USERS.employee.id,
    user_name: "Nethmi Silva",
    user_avatar: MOCK_USERS.employee.avatar_url,
    department_name: "Engineering",
    work_date: todayStr,
    check_in: initialCheckIn.toISOString(),
    duration_seconds: 12480,
    status: "active",
    ongoing_task: "Review design mockups",
    ongoing_task_category: "Design",
  });

  const [liveDurationSeconds, setLiveDurationSeconds] = useState<number>(12480);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentSession && !currentSession.check_out) {
      interval = setInterval(() => {
        setLiveDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentSession]);

  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceSession[]>([
    {
      id: "att-yesterday",
      organization_id: "org-teamora",
      user_id: MOCK_USERS.employee.id,
      user_name: "Nethmi Silva",
      user_avatar: MOCK_USERS.employee.avatar_url,
      department_name: "Engineering",
      work_date: "2025-04-21",
      check_in: "2025-04-21T09:00:00Z",
      check_out: "2025-04-21T17:35:00Z",
      duration_seconds: 30900,
      status: "completed",
      ongoing_task: "Finalize Q1 deliverables",
      ongoing_task_category: "Development",
    },
    {
      id: "att-prev-1",
      organization_id: "org-teamora",
      user_id: MOCK_USERS.employee.id,
      user_name: "Nethmi Silva",
      user_avatar: MOCK_USERS.employee.avatar_url,
      department_name: "Engineering",
      work_date: "2025-04-18",
      check_in: "2025-04-18T08:58:00Z",
      check_out: "2025-04-18T17:05:00Z",
      duration_seconds: 29220,
      status: "completed",
      ongoing_task: "Sprint Retrospective & Auth Tests",
      ongoing_task_category: "Development",
    },
    {
      id: "att-sarah",
      organization_id: "org-teamora",
      user_id: MOCK_USERS.sub_admin.id,
      user_name: "Sarah Lin",
      user_avatar: MOCK_USERS.sub_admin.avatar_url,
      department_name: "Engineering",
      work_date: todayStr,
      check_in: "2025-04-22T08:50:00Z",
      duration_seconds: 13200,
      status: "active",
      ongoing_task: "Mobile Bottom Menu Code Review",
      ongoing_task_category: "Development",
    },
    {
      id: "att-david",
      organization_id: "org-teamora",
      user_id: MOCK_USERS.hr_admin.id,
      user_name: "David Miller",
      user_avatar: MOCK_USERS.hr_admin.avatar_url,
      department_name: "Human Resources",
      work_date: todayStr,
      check_in: "2025-04-22T09:25:00Z",
      duration_seconds: 11100,
      status: "late",
      is_late: true,
      ongoing_task: "Q2 Compensation & Policy Audit",
      ongoing_task_category: "Operations",
    },
    {
      id: "att-elena",
      organization_id: "org-teamora",
      user_id: MOCK_USERS.owner.id,
      user_name: "Elena Rostova",
      user_avatar: MOCK_USERS.owner.avatar_url,
      department_name: "Operations & Sales",
      work_date: todayStr,
      check_in: "2025-04-22T08:30:00Z",
      duration_seconds: 14400,
      status: "active",
      ongoing_task: "Executive Strategy & Board Review",
      ongoing_task_category: "Operations",
    },
    {
      id: "att-dinesh",
      organization_id: "org-teamora",
      user_id: "user-dinesh",
      user_name: "Dinesh Perera",
      user_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
      department_name: "Product & Design",
      work_date: todayStr,
      check_in: "2025-04-22T09:05:00Z",
      duration_seconds: 12600,
      status: "active",
      ongoing_task: "UI Design Mockup Polish",
      ongoing_task_category: "Design",
    },
    {
      id: "att-nimal",
      organization_id: "org-teamora",
      user_id: "user-nimal",
      user_name: "Nimal Perera",
      user_avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
      department_name: "Engineering",
      work_date: todayStr,
      check_in: "2025-04-22T09:15:00Z",
      duration_seconds: 12000,
      status: "active",
      ongoing_task: "Video Editing",
      ongoing_task_category: "Development",
    },
    {
      id: "att-marcus",
      organization_id: "org-teamora",
      user_id: "user-marcus",
      user_name: "Marcus Vance",
      user_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      department_name: "Engineering",
      work_date: todayStr,
      check_in: "2025-04-22T08:45:00Z",
      duration_seconds: 13800,
      status: "active",
      ongoing_task: "Cloud Cluster Scaling & Telemetry",
      ongoing_task_category: "Operations",
    },
    {
      id: "att-priya",
      organization_id: "org-teamora",
      user_id: "user-priya",
      user_name: "Priya Sharma",
      user_avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80",
      department_name: "Operations & Sales",
      work_date: todayStr,
      check_in: "2025-04-22T09:10:00Z",
      duration_seconds: 12300,
      status: "active",
      ongoing_task: "Q3 Analytics Model Forecasting",
      ongoing_task_category: "Operations",
    },
    {
      id: "att-liam",
      organization_id: "org-teamora",
      user_id: "user-liam",
      user_name: "Liam O'Connor",
      user_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
      department_name: "Engineering",
      work_date: todayStr,
      check_in: "2025-04-22T09:00:00Z",
      duration_seconds: 12900,
      status: "active",
      ongoing_task: "Architecture Security Benchmark",
      ongoing_task_category: "Development",
    }
  ]);

  const [corrections, setCorrections] = useState<AttendanceCorrection[]>([
    {
      id: "corr-1",
      session_id: "att-prev-1",
      user_id: MOCK_USERS.employee.id,
      user_name: "Nethmi Silva",
      original_check_in: "2025-04-18T08:58:00Z",
      original_check_out: "2025-04-18T17:05:00Z",
      requested_check_in: "2025-04-18T08:45:00Z",
      requested_check_out: "2025-04-18T17:30:00Z",
      reason: "Network timeout prevented server sync on time upon leaving the office.",
      status: "pending",
      created_at: "2025-04-19T09:00:00Z",
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "task-1",
      organization_id: "org-teamora",
      department_id: "dept-eng",
      title: "Finalize Q2 report",
      description: "Complete team deliverables breakdown and resource allocation matrix.",
      assigned_to: MOCK_USERS.employee.id,
      assigned_to_name: "Nethmi Silva",
      assigned_by: MOCK_USERS.sub_admin.id,
      assigned_by_name: "Sarah Lin",
      priority: "urgent",
      status: "in_progress",
      due_date: "Due today",
      created_at: "2025-04-20",
    },
    {
      id: "task-2",
      organization_id: "org-teamora",
      department_id: "dept-eng",
      title: "Review design mockups",
      description: "Inspect mobile responsive states and Facebook bottom bar interaction.",
      assigned_to: MOCK_USERS.employee.id,
      assigned_to_name: "Nethmi Silva",
      assigned_by: MOCK_USERS.sub_admin.id,
      assigned_by_name: "Sarah Lin",
      priority: "medium",
      status: "in_progress",
      due_date: "Tomorrow",
      created_at: "2025-04-21",
    },
    {
      id: "task-3",
      organization_id: "org-teamora",
      department_id: "dept-eng",
      title: "Prepare client presentation",
      description: "Compile feature summary slides and live demo credentials.",
      assigned_to: MOCK_USERS.employee.id,
      assigned_to_name: "Nethmi Silva",
      assigned_by: MOCK_USERS.owner.id,
      assigned_by_name: "Elena Rostova",
      priority: "low",
      status: "todo",
      due_date: "Friday",
      created_at: "2025-04-22",
    },
  ]);

  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: "post-anonymous-sample",
      organization_id: "org-teamora",
      author_id: "anon-sample",
      author_name: "Anonymous Colleague",
      author_avatar: "",
      author_role: "employee",
      author_designation: "Verified Team Member • Identity Protected",
      content: "💡 Question for management: Could we consider introducing flexible remote days on alternate Fridays? It would greatly improve team work-life balance and deep focus time!",
      is_anonymous: true,
      created_at: "3 hours ago",
      attachments: [],
      likes_count: 27,
      comments_count: 5,
      impressions_count: 72,
      reach_count: 48,
      has_liked: false,
      comments: [
        {
          id: "comm-anon-1",
          post_id: "post-anonymous-sample",
          author_id: MOCK_USERS.sub_admin.id,
          author_name: "Sarah Lin",
          author_avatar: MOCK_USERS.sub_admin.avatar_url,
          author_role: "sub_admin",
          content: "We're actually discussing this in our next sprint planning meeting! Great initiative. 👏",
          created_at: "2 hours ago",
        }
      ],
    },
    {
      id: "post-announcement",
      organization_id: "org-teamora",
      author_id: MOCK_USERS.owner.id,
      author_name: "Elena Rostova",
      author_avatar: MOCK_USERS.owner.avatar_url,
      author_role: "owner",
      author_designation: "Chief Executive Officer",
      content: "📢 Teamora Q2 All-Hands Meeting is scheduled for this Thursday at 3:00 PM. We will review company milestones, welcome our newest team members, and preview exciting upcoming developments! Please come with questions for the open AMA.",
      is_announcement: true,
      is_pinned: true,
      created_at: "Yesterday at 4:30 PM",
      attachments: [
        {
          id: "att-1",
          file_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
          file_name: "all-hands-celebration.jpg",
          file_type: "image"
        }
      ],
      likes_count: 42,
      comments_count: 8,
      impressions_count: 96,
      reach_count: 64,
      has_liked: true,
      comments: [
        {
          id: "comm-1",
          post_id: "post-announcement",
          author_id: MOCK_USERS.sub_admin.id,
          author_name: "Sarah Lin",
          author_avatar: MOCK_USERS.sub_admin.avatar_url,
          author_role: "sub_admin",
          content: "Looking forward to sharing the Engineering roadmap updates! 🚀",
          created_at: "Yesterday at 5:10 PM",
        }
      ],
    },
    {
      id: "post-dinesh",
      organization_id: "org-teamora",
      department_id: "dept-eng",
      department_name: "Engineering",
      author_id: "user-dinesh",
      author_name: "Dinesh Perera",
      author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      author_role: "employee",
      author_designation: "Product Designer",
      content: "Great progress on the product roadmap this sprint! Big thanks to everyone for the collaboration. 🚀\n\nCheckout the new interactive workspace components preview!",
      created_at: "2 hours ago",
      attachments: [
        {
          id: "att-2",
          file_url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80",
          file_name: "product-roadmap-preview.jpg",
          file_type: "image"
        }
      ],
      likes_count: 18,
      comments_count: 3,
      impressions_count: 54,
      reach_count: 38,
      has_liked: false,
      comments: [
        {
          id: "comm-2",
          post_id: "post-dinesh",
          author_id: MOCK_USERS.employee.id,
          author_name: "Nethmi Silva",
          author_avatar: MOCK_USERS.employee.avatar_url,
          author_role: "employee",
          content: "The new UI components look fantastic Dinesh! Great job.",
          created_at: "1 hour ago",
        }
      ],
    },
    {
      id: "post-sarah",
      organization_id: "org-teamora",
      department_id: "dept-eng",
      department_name: "Engineering",
      author_id: MOCK_USERS.sub_admin.id,
      author_name: "Sarah Lin",
      author_avatar: MOCK_USERS.sub_admin.avatar_url,
      author_role: "sub_admin",
      author_designation: "Engineering Lead",
      content: "Reminder for the frontend team: Code freeze for the mobile Facebook-style bottom bar is tomorrow at noon. Make sure all unit tests and responsive layout checks pass.",
      created_at: "4 hours ago",
      attachments: [],
      likes_count: 11,
      comments_count: 2,
      impressions_count: 38,
      reach_count: 24,
      has_liked: true,
      comments: [],
    }
  ]);

  const [activities, setActivities] = useState<WorksheetActivity[]>([
    {
      id: "act-1",
      user_id: MOCK_USERS.employee.id,
      task_id: "task-1",
      title: "Q2 Report Deliverables Breakdown",
      category: "Planning",
      start_time: "2025-04-22T09:30:00Z",
      end_time: "2025-04-22T11:00:00Z",
      duration_minutes: 90,
      attachment_urls: [],
      is_submitted: false,
    },
    {
      id: "act-2",
      user_id: MOCK_USERS.employee.id,
      task_id: "task-2",
      title: "Mobile Bottom Menu UI Implementation",
      category: "Development",
      start_time: "2025-04-22T11:30:00Z",
      end_time: "2025-04-22T13:30:00Z",
      duration_minutes: 120,
      attachment_urls: [],
      is_submitted: false,
    },
    {
      id: "act-3",
      user_id: MOCK_USERS.employee.id,
      title: "Engineering Team Sprint Sync",
      category: "Meeting",
      start_time: "2025-04-22T14:00:00Z",
      end_time: "2025-04-22T15:00:00Z",
      duration_minutes: 60,
      attachment_urls: [],
      is_submitted: false,
    }
  ]);

  const [reports, setReports] = useState<WorksheetReport[]>([
    {
      id: "rep-yesterday",
      user_id: MOCK_USERS.employee.id,
      user_name: "Nethmi Silva",
      user_avatar: MOCK_USERS.employee.avatar_url,
      department_name: "Engineering",
      report_date: "2025-04-21",
      total_minutes: 480,
      summary_notes: "Completed design review and submitted responsive layout fixes.",
      status: "approved",
      submitted_at: "2025-04-21T17:35:00Z",
      reviewer_id: MOCK_USERS.sub_admin.id,
      reviewer_name: "Sarah Lin",
      reviewer_feedback: "Excellent work on the UI fidelity. Approved.",
      activities: [],
    },
    {
      id: "rep-today",
      user_id: MOCK_USERS.employee.id,
      user_name: "Nethmi Silva",
      user_avatar: MOCK_USERS.employee.avatar_url,
      department_name: "Engineering",
      report_date: "2025-04-22",
      total_minutes: 270,
      summary_notes: "Working on Q2 deliverables and mobile bottom navigation.",
      status: "draft",
      activities: activities,
    }
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: "leave-1",
      user_id: MOCK_USERS.employee.id,
      user_name: "Nethmi Silva",
      user_avatar: MOCK_USERS.employee.avatar_url,
      department_name: "Engineering",
      leave_type: "Annual",
      start_date: "2025-05-02",
      end_date: "2025-05-04",
      days_count: 2,
      reason: "Family travel and personal commitments.",
      status: "pending",
      created_at: "2025-04-20",
    },
    {
      id: "leave-alex",
      user_id: "user-alex",
      user_name: "Alex Chen",
      user_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
      department_name: "Engineering",
      leave_type: "Annual",
      start_date: "2026-09-21",
      end_date: "2026-09-25",
      days_count: 5,
      reason: "Approved Annual Leave - Family vacation and personal travel.",
      status: "approved",
      created_at: "2026-09-18",
    },
    {
      id: "leave-rachel",
      user_id: "user-rachel",
      user_name: "Rachel Adams",
      user_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      department_name: "Marketing",
      leave_type: "Sick",
      start_date: "2026-09-21",
      end_date: "2026-09-22",
      days_count: 2,
      reason: "Medical recovery - Doctor advised rest.",
      status: "approved",
      created_at: "2026-09-20",
    }
  ]);

  const [departments] = useState<Department[]>([
    { id: "dept-eng", name: "Engineering", code: "ENG", sub_admin_id: MOCK_USERS.sub_admin.id, sub_admin_name: "Sarah Lin", member_count: 18 },
    { id: "dept-des", name: "Product & Design", code: "DES", member_count: 8 },
    { id: "dept-mkt", name: "Marketing", code: "MKT", member_count: 6 },
    { id: "dept-hr", name: "Human Resources", code: "HR", sub_admin_id: MOCK_USERS.hr_admin.id, sub_admin_name: "David Miller", member_count: 4 },
    { id: "dept-ops", name: "Operations & Sales", code: "OPS", member_count: 12 },
  ]);

  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    name: "Teamora Technologies",
    work_start_time: "09:00",
    work_end_time: "18:00",
    grace_period_minutes: 15,
    half_day_hours: 4,
    full_day_hours: 8,
  });

  const [allEmployees, setAllEmployees] = useState<UserProfile[]>(ALL_EMPLOYEES);

  const updateEmployee = (id: string, data: Partial<UserProfile>) => {
    setAllEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...data } : emp))
    );
  };

  const deleteEmployee = (id: string) => {
    setAllEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  const addEmployee = (employee: Omit<UserProfile, "id">) => {
    const newEmp: UserProfile = {
      ...employee,
      id: `user-${Date.now()}`,
    };
    setAllEmployees((prev) => [newEmp, ...prev]);
  };

  const toggleEmployeeActive = (id: string) => {
    setAllEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, is_active: !emp.is_active } : emp))
    );
  };

  const switchRole = (role: UserRole) => {
    setCurrentUser(MOCK_USERS[role]);
  };

  const checkIn = () => {
    if (currentSession && !currentSession.check_out) return;
    const now = new Date();
    const newSession: AttendanceSession = {
      id: `att-${Date.now()}`,
      organization_id: "org-teamora",
      user_id: currentUser.id,
      user_name: `${currentUser.first_name} ${currentUser.last_name}`,
      user_avatar: currentUser.avatar_url,
      department_name: currentUser.department_name,
      work_date: todayStr,
      check_in: now.toISOString(),
      duration_seconds: 0,
      status: "active",
    };
    setCurrentSession(newSession);
    setLiveDurationSeconds(0);
  };

  const checkOut = () => {
    if (!currentSession || currentSession.check_out) return;
    const now = new Date();
    const closedSession: AttendanceSession = {
      ...currentSession,
      check_out: now.toISOString(),
      duration_seconds: liveDurationSeconds,
      status: "completed",
    };
    setCurrentSession(null);
    setAttendanceHistory((prev) => [closedSession, ...prev]);
  };

  const submitCorrection = (sessionId: string, requestedIn: string, requestedOut: string, reason: string) => {
    const newCorrection: AttendanceCorrection = {
      id: `corr-${Date.now()}`,
      session_id: sessionId,
      user_id: currentUser.id,
      user_name: `${currentUser.first_name} ${currentUser.last_name}`,
      original_check_in: currentSession?.check_in || new Date().toISOString(),
      requested_check_in: requestedIn,
      requested_check_out: requestedOut,
      reason,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    setCorrections((prev) => [newCorrection, ...prev]);
  };

  const approveCorrection = (correctionId: string) => {
    setCorrections((prev) =>
      prev.map((c) => (c.id === correctionId ? { ...c, status: "approved", reviewed_by: currentUser.id } : c))
    );
  };

  const rejectCorrection = (correctionId: string) => {
    setCorrections((prev) =>
      prev.map((c) => (c.id === correctionId ? { ...c, status: "rejected", reviewed_by: currentUser.id } : c))
    );
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === "completed" ? "todo" : "completed" }
          : t
      )
    );
  };

  const createTask = (
    title: string, 
    priority: Task["priority"] = "medium", 
    dueDate: string = "Due today", 
    assignedTo: string = currentUser.id,
    description: string = "",
    status: Task["status"] = "todo"
  ) => {
    let assignedName = `${currentUser.first_name} ${currentUser.last_name}`;
    const allKnown = [...ALL_EMPLOYEES, ...Object.values(MOCK_USERS)];
    const userFound = allKnown.find((u) => u.id === assignedTo);
    if (userFound) {
      assignedName = `${userFound.first_name} ${userFound.last_name}`;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      organization_id: "org-teamora",
      title,
      description,
      assigned_to: assignedTo,
      assigned_to_name: assignedName,
      assigned_by: currentUser.id,
      assigned_by_name: `${currentUser.first_name} ${currentUser.last_name}`,
      priority,
      status,
      due_date: dueDate,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          let assignedName = t.assigned_to_name;
          if (updates.assigned_to && updates.assigned_to !== t.assigned_to) {
            const allKnown = [...ALL_EMPLOYEES, ...Object.values(MOCK_USERS)];
            const userFound = allKnown.find((u) => u.id === updates.assigned_to);
            if (userFound) {
              assignedName = `${userFound.first_name} ${userFound.last_name}`;
            }
          }
          return {
            ...t,
            ...updates,
            assigned_to_name: updates.assigned_to_name || assignedName,
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const createPost = (
    content: string, 
    attachments: any[] = [], 
    isAnnouncement: boolean = false, 
    targetDept?: string,
    isAnonymous: boolean = false
  ) => {
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      organization_id: "org-teamora",
      department_id: isAnonymous ? undefined : targetDept,
      author_id: isAnonymous ? `anon-${Date.now()}` : currentUser.id,
      author_name: isAnonymous ? "Anonymous Colleague" : `${currentUser.first_name} ${currentUser.last_name}`,
      author_avatar: isAnonymous ? "" : currentUser.avatar_url,
      author_role: isAnonymous ? "employee" : currentUser.role,
      author_designation: isAnonymous ? "Verified Team Member • Identity Protected" : currentUser.designation,
      content,
      is_announcement: isAnonymous ? false : isAnnouncement,
      is_pinned: isAnonymous ? false : isAnnouncement,
      is_anonymous: isAnonymous,
      created_at: "Just now",
      attachments: attachments || [],
      likes_count: 0,
      comments_count: 0,
      impressions_count: 1,
      reach_count: 1,
      has_liked: false,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const reactToPost = (postId: string, reaction: ReactionType) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          if (p.user_reaction === reaction) {
            // Toggling off the same reaction
            return {
              ...p,
              has_liked: false,
              user_reaction: null,
              likes_count: Math.max(0, p.likes_count - 1),
            };
          }
          // Changing reaction or newly reacting
          const wasReacted = !!p.user_reaction || p.has_liked;
          return {
            ...p,
            has_liked: true,
            user_reaction: reaction,
            likes_count: wasReacted ? p.likes_count : p.likes_count + 1,
          };
        }
        return p;
      })
    );
  };

  const toggleLike = (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (targetPost?.user_reaction) {
      reactToPost(postId, targetPost.user_reaction);
    } else {
      reactToPost(postId, "like");
    }
  };

  const addComment = (postId: string, content: string) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      post_id: postId,
      author_id: currentUser.id,
      author_name: `${currentUser.first_name} ${currentUser.last_name}`,
      author_avatar: currentUser.avatar_url,
      author_role: currentUser.role,
      content,
      created_at: "Just now",
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments_count: p.comments_count + 1,
              comments: [...p.comments, newComment],
            }
          : p
      )
    );
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const addActivity = (activity: Omit<WorksheetActivity, "id" | "user_id" | "is_submitted">) => {
    const newAct: WorksheetActivity = {
      ...activity,
      id: `act-${Date.now()}`,
      user_id: currentUser.id,
      is_submitted: false,
    };
    setActivities((prev) => [...prev, newAct]);
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const submitDailyReport = (date: string, notes?: string) => {
    const todayActivities = activities;
    const totalMins = todayActivities.reduce((acc, curr) => acc + curr.duration_minutes, 0);
    const existingIndex = reports.findIndex((r) => r.report_date === date);

    if (existingIndex >= 0) {
      setReports((prev) =>
        prev.map((r, i) =>
          i === existingIndex
            ? {
                ...r,
                total_minutes: totalMins,
                summary_notes: notes || r.summary_notes,
                status: "submitted",
                submitted_at: new Date().toISOString(),
                activities: todayActivities,
              }
            : r
        )
      );
    } else {
      const newReport: WorksheetReport = {
        id: `rep-${Date.now()}`,
        user_id: currentUser.id,
        user_name: `${currentUser.first_name} ${currentUser.last_name}`,
        user_avatar: currentUser.avatar_url,
        department_name: currentUser.department_name,
        report_date: date,
        total_minutes: totalMins,
        summary_notes: notes || "",
        status: "submitted",
        submitted_at: new Date().toISOString(),
        activities: todayActivities,
      };
      setReports((prev) => [newReport, ...prev]);
    }
  };

  const approveReport = (reportId: string, feedback?: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "approved",
              reviewer_id: currentUser.id,
              reviewer_name: `${currentUser.first_name} ${currentUser.last_name}`,
              reviewer_feedback: feedback || "Approved without remarks.",
            }
          : r
      )
    );
  };

  const requestReportChanges = (reportId: string, feedback: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "changes_requested",
              reviewer_id: currentUser.id,
              reviewer_name: `${currentUser.first_name} ${currentUser.last_name}`,
              reviewer_feedback: feedback,
            }
          : r
      )
    );
  };

  const submitLeaveRequest = (type: LeaveRequest["leave_type"], start: string, end: string, days: number, reason: string) => {
    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      user_id: currentUser.id,
      user_name: `${currentUser.first_name} ${currentUser.last_name}`,
      user_avatar: currentUser.avatar_url,
      department_name: currentUser.department_name || "General",
      leave_type: type,
      start_date: start,
      end_date: end,
      days_count: days,
      reason,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    setLeaveRequests((prev) => [newReq, ...prev]);
  };

  const approveLeave = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "approved", reviewed_by: currentUser.id } : l))
    );
  };

  const rejectLeave = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "rejected", reviewed_by: currentUser.id } : l))
    );
  };

  const setEmployeeLeaveStatus = (
    userId: string, 
    isOnLeave: boolean, 
    leaveType: LeaveRequest["leave_type"] = "Annual", 
    reason: string = "Approved time off / personal leave."
  ) => {
    setLeaveRequests((prev) => {
      if (!isOnLeave) {
        return prev.filter((r) => !(r.user_id === userId && r.status === "approved" && r.start_date <= "2026-09-21" && r.end_date >= "2026-09-21"));
      } else {
        const targetEmp = ALL_EMPLOYEES.find((e) => e.id === userId);
        const existing = prev.find((r) => r.user_id === userId && r.status === "approved" && r.start_date <= "2026-09-21" && r.end_date >= "2026-09-21");
        if (existing) return prev;
        const newLeave: LeaveRequest = {
          id: `leave-auto-${Date.now()}`,
          user_id: userId,
          user_name: targetEmp ? `${targetEmp.first_name} ${targetEmp.last_name}` : "Employee",
          user_avatar: targetEmp?.avatar_url,
          department_name: targetEmp?.department_name || "Engineering",
          leave_type: leaveType,
          start_date: "2026-09-21",
          end_date: "2026-09-25",
          days_count: 5,
          reason,
          status: "approved",
          created_at: new Date().toISOString().split("T")[0],
        };
        return [newLeave, ...prev];
      }
    });
  };

  const updateOrgSettings = (newSettings: Partial<OrganizationSettings>) => {
    setOrgSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // ==========================================
  // WORKSHEET V2.0 TASK ACTIVITY METHODS
  // ==========================================

  const checkOverlap = (
    employeeId: string,
    startAt: string,
    endAt: string,
    excludeTaskId?: string
  ): TaskActivity | null => {
    const sTime = new Date(startAt).getTime();
    const eTime = new Date(endAt).getTime();
    if (isNaN(sTime) || isNaN(eTime) || eTime <= sTime) return null;

    const conflict = taskActivities.find((t) => {
      if (t.id === excludeTaskId || t.employee_id !== employeeId) return false;
      const tStart = new Date(t.start_at).getTime();
      const tEnd = t.end_at ? new Date(t.end_at).getTime() : nowTimestamp;
      return Math.max(sTime, tStart) < Math.min(eTime, tEnd);
    });

    return conflict || null;
  };

  const startLiveTask = async (
    title: string,
    category: TaskActivity["category"] = "Development",
    description: string = ""
  ): Promise<{ success: boolean; requiresSwitchConfirmation?: boolean; ongoingTask?: TaskActivity }> => {
    if (activeTask) {
      setSwitchModalData({
        isOpen: true,
        pendingTitle: title,
        pendingCategory: category,
        pendingDescription: description,
      });
      return { success: false, requiresSwitchConfirmation: true, ongoingTask: activeTask };
    }

    const nowIso = new Date().toISOString();
    const newTask: TaskActivity = {
      id: `act-${Date.now()}`,
      organization_id: currentUser.organization_id || "org-teamora",
      employee_id: currentUser.id,
      employee_name: `${currentUser.first_name} ${currentUser.last_name}`,
      employee_avatar: currentUser.avatar_url,
      department_name: currentUser.department_name,
      title: title.trim(),
      category,
      description,
      start_at: nowIso,
      end_at: null,
      status: "Ongoing",
      entry_mode: "live",
      created_at: nowIso,
      updated_at: nowIso,
      created_by: currentUser.id,
      version: 1,
    };

    setTaskActivities((prev) => [newTask, ...prev]);
    return { success: true };
  };

  const confirmTaskSwitch = (
    newTitle: string,
    category: TaskActivity["category"] = "Development",
    description: string = ""
  ) => {
    const transitionTime = new Date().toISOString();
    setTaskActivities((prev) => {
      const updated = prev.map((t) => {
        if (t.employee_id === currentUser.id && t.status === "Ongoing") {
          const duration = Math.max(
            0,
            Math.floor((new Date(transitionTime).getTime() - new Date(t.start_at).getTime()) / 1000)
          );
          return {
            ...t,
            end_at: transitionTime,
            status: "Completed" as const,
            duration_seconds: duration,
            updated_at: transitionTime,
            version: t.version + 1,
          };
        }
        return t;
      });

      const newTask: TaskActivity = {
        id: `act-${Date.now()}`,
        organization_id: currentUser.organization_id || "org-teamora",
        employee_id: currentUser.id,
        employee_name: `${currentUser.first_name} ${currentUser.last_name}`,
        employee_avatar: currentUser.avatar_url,
        department_name: currentUser.department_name,
        title: newTitle.trim(),
        category,
        description,
        start_at: transitionTime,
        end_at: null,
        status: "Ongoing",
        entry_mode: "live",
        created_at: transitionTime,
        updated_at: transitionTime,
        created_by: currentUser.id,
        version: 1,
      };

      return [newTask, ...updated];
    });

    setSwitchModalData(null);
  };

  const endActiveTask = (manualEndTime?: string) => {
    if (!activeTask) return;
    const endTime = manualEndTime ? new Date(manualEndTime).toISOString() : new Date().toISOString();
    const duration = Math.max(
      0,
      Math.floor((new Date(endTime).getTime() - new Date(activeTask.start_at).getTime()) / 1000)
    );

    setTaskActivities((prev) =>
      prev.map((t) =>
        t.id === activeTask.id
          ? {
              ...t,
              end_at: endTime,
              duration_seconds: duration,
              status: "Completed",
              updated_at: new Date().toISOString(),
              version: t.version + 1,
            }
          : t
      )
    );
  };

  const createManualTask = (data: {
    title: string;
    category?: TaskActivity["category"];
    description?: string;
    start_at: string;
    end_at: string;
    employee_id?: string;
  }): { success: boolean; conflict?: TaskActivity } => {
    const empId = data.employee_id || currentUser.id;
    const conflict = checkOverlap(empId, data.start_at, data.end_at);
    if (conflict) {
      return { success: false, conflict };
    }

    const duration = Math.max(
      0,
      Math.floor((new Date(data.end_at).getTime() - new Date(data.start_at).getTime()) / 1000)
    );
    const nowTime = Date.now();
    const isScheduled = new Date(data.start_at).getTime() > nowTime;

    const newTask: TaskActivity = {
      id: `act-${Date.now()}`,
      organization_id: currentUser.organization_id || "org-teamora",
      employee_id: empId,
      employee_name: `${currentUser.first_name} ${currentUser.last_name}`,
      employee_avatar: currentUser.avatar_url,
      department_name: currentUser.department_name,
      title: data.title.trim(),
      category: data.category || "General",
      description: data.description || "",
      start_at: data.start_at,
      end_at: data.end_at,
      duration_seconds: duration,
      status: isScheduled ? "Scheduled" : "Completed",
      entry_mode: "manual",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: currentUser.id,
      version: 1,
    };

    setTaskActivities((prev) => [newTask, ...prev]);
    return { success: true };
  };

  const updateTaskActivity = (
    taskId: string,
    updates: Partial<TaskActivity>,
    reason: string = "Manual task adjustment"
  ) => {
    const existing = taskActivities.find((t) => t.id === taskId);
    if (!existing) return;

    const startChanged = updates.start_at && updates.start_at !== existing.start_at;
    const endChanged = updates.end_at !== undefined && updates.end_at !== existing.end_at;

    if (startChanged || endChanged) {
      const revision: TaskRevision = {
        id: `rev-${Date.now()}`,
        task_id: existing.id,
        task_title: updates.title || existing.title,
        original_start: existing.start_at,
        original_end: existing.end_at,
        updated_start: updates.start_at || existing.start_at,
        updated_end: updates.end_at !== undefined ? updates.end_at : existing.end_at,
        edited_by: currentUser.id,
        edited_by_name: `${currentUser.first_name} ${currentUser.last_name}`,
        edited_at: new Date().toISOString(),
        reason,
        was_live_recorded: existing.entry_mode === "live",
      };
      setTaskRevisions((prev) => [revision, ...prev]);
    }

    setTaskActivities((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const newStart = updates.start_at || t.start_at;
          const newEnd = updates.end_at !== undefined ? updates.end_at : t.end_at;
          let newDuration = t.duration_seconds;
          let newStatus = updates.status || t.status;

          if (newEnd) {
            newDuration = Math.max(
              0,
              Math.floor((new Date(newEnd).getTime() - new Date(newStart).getTime()) / 1000)
            );
            if (t.status === "Ongoing") {
              newStatus = "Completed";
            }
          }

          return {
            ...t,
            ...updates,
            start_at: newStart,
            end_at: newEnd,
            status: newStatus,
            duration_seconds: newDuration,
            updated_at: new Date().toISOString(),
            version: t.version + 1,
          };
        }
        return t;
      });

      return resolveTaskOverlaps(updated);
    });
  };

  const updateMultipleTasks = (
    taskUpdates: { taskId: string; updates: Partial<TaskActivity>; reason?: string }[]
  ) => {
    if (!taskUpdates.length) return;

    const newRevisions: TaskRevision[] = [];
    taskUpdates.forEach(({ taskId, updates, reason }) => {
      const existing = taskActivities.find((t) => t.id === taskId);
      if (!existing) return;
      const startChanged = updates.start_at && updates.start_at !== existing.start_at;
      const endChanged = updates.end_at !== undefined && updates.end_at !== existing.end_at;
      if (startChanged || endChanged) {
        newRevisions.push({
          id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          task_id: existing.id,
          task_title: updates.title || existing.title,
          original_start: existing.start_at,
          original_end: existing.end_at,
          updated_start: updates.start_at || existing.start_at,
          updated_end: updates.end_at !== undefined ? updates.end_at : existing.end_at,
          edited_by: currentUser.id,
          edited_by_name: `${currentUser.first_name} ${currentUser.last_name}`,
          edited_at: new Date().toISOString(),
          reason: reason || "Task layout collision resolution",
          was_live_recorded: existing.entry_mode === "live",
        });
      }
    });

    if (newRevisions.length > 0) {
      setTaskRevisions((prev) => [...newRevisions, ...prev]);
    }

    setTaskActivities((prev) => {
      const updateMap = new Map(taskUpdates.map((u) => [u.taskId, u.updates]));
      const updated = prev.map((t) => {
        const updates = updateMap.get(t.id);
        if (!updates) return t;

        const newStart = updates.start_at || t.start_at;
        const newEnd = updates.end_at !== undefined ? updates.end_at : t.end_at;
        let newDuration = t.duration_seconds;
        let newStatus = updates.status || t.status;

        if (newEnd) {
          newDuration = Math.max(
            0,
            Math.floor((new Date(newEnd).getTime() - new Date(newStart).getTime()) / 1000)
          );
          if (t.status === "Ongoing") {
            newStatus = "Completed";
          }
        }

        return {
          ...t,
          ...updates,
          start_at: newStart,
          end_at: newEnd,
          status: newStatus,
          duration_seconds: newDuration,
          updated_at: new Date().toISOString(),
          version: t.version + 1,
        };
      });

      return resolveTaskOverlaps(updated);
    });
  };

  const deleteTaskActivity = (taskId: string) => {
    setTaskActivities((prev) => prev.filter((t) => t.id !== taskId));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        currentSession,
        attendanceHistory,
        checkIn,
        checkOut,
        liveDurationSeconds,
        corrections,
        submitCorrection,
        approveCorrection,
        rejectCorrection,
        tasks,
        toggleTaskStatus,
        createTask,
        updateTask,
        deleteTask,
        posts,
        createPost,
        toggleLike,
        reactToPost,
        addComment,
        deletePost,
        activities,
        reports,
        addActivity,
        deleteActivity,
        submitDailyReport,
        approveReport,
        requestReportChanges,
        leaveRequests,
        submitLeaveRequest,
        approveLeave,
        rejectLeave,
        setEmployeeLeaveStatus,
        departments,
        orgSettings,
        updateOrgSettings,

        // Worksheet V2.0 Live Task Tracking
        taskActivities,
        taskRevisions,
        activeTask,
        activeTaskElapsedSeconds,
        todayTotalWorkSeconds,
        allEmployees,
        updateEmployee,
        deleteEmployee,
        addEmployee,
        toggleEmployeeActive,
        startLiveTask,
        confirmTaskSwitch,
        endActiveTask,
        createManualTask,
        updateTaskActivity,
        updateMultipleTasks,
        deleteTaskActivity,
        checkOverlap,

        // UI Modal Controls
        isTaskPopupOpen,
        setIsTaskPopupOpen,
        taskPopupAnchor,
        setTaskPopupAnchor,
        editingTask,
        setEditingTask,
        isCreateTaskModalOpen,
        setIsCreateTaskModalOpen,
        createTaskModalPrefill,
        setCreateTaskModalPrefill,
        switchModalData,
        setSwitchModalData,

        // Theme Support
        theme,
        toggleTheme,
        setTheme,

        // User Profile Inspection
        selectedProfileUser,
        openUserProfile,
        closeUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

