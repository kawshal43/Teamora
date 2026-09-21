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
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
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
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
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
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
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
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (555) 111-2233",
    is_active: true,
    joined_date: "2021-01-01",
  },
};

export const ALL_EMPLOYEES: UserProfile[] = [
  MOCK_USERS.employee,
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
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (555) 987-6543",
    is_active: true,
    joined_date: "2024-06-01",
  },
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
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (555) 789-0123",
    is_active: true,
    joined_date: "2023-11-15",
  },
  MOCK_USERS.sub_admin,
  MOCK_USERS.hr_admin,
  MOCK_USERS.owner,
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
  createTask: (title: string, priority: Task["priority"], dueDate: string, assignedTo: string) => void;
  posts: FeedPost[];
  createPost: (content: string, attachments?: any[], isAnnouncement?: boolean, targetDept?: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  deletePost: (postId: string) => void;
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
  deleteTaskActivity: (taskId: string) => void;
  checkOverlap: (employeeId: string, startAt: string, endAt: string, excludeTaskId?: string) => TaskActivity | null;

  // UI Modal Controls
  isTaskPopupOpen: boolean;
  setIsTaskPopupOpen: (open: boolean) => void;
  editingTask: TaskActivity | null;
  setEditingTask: (task: TaskActivity | null) => void;
  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (open: boolean) => void;
  createTaskModalPrefill: { date?: string; hour?: number; minute?: number } | null;
  setCreateTaskModalPrefill: (data: { date?: string; hour?: number; minute?: number } | null) => void;
  switchModalData: { isOpen: boolean; pendingTitle: string; pendingCategory?: TaskActivity["category"]; pendingDescription?: string } | null;
  setSwitchModalData: (data: { isOpen: boolean; pendingTitle: string; pendingCategory?: TaskActivity["category"]; pendingDescription?: string } | null) => void;
}

const STORAGE_KEY_TASKS = "teamora_task_activities_v2";
const STORAGE_KEY_REVISIONS = "teamora_task_revisions_v2";

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
          setTaskActivities(JSON.parse(savedTasks));
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
  const [editingTask, setEditingTask] = useState<TaskActivity | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [createTaskModalPrefill, setCreateTaskModalPrefill] = useState<{ date?: string; hour?: number; minute?: number } | null>(null);
  const [switchModalData, setSwitchModalData] = useState<{ isOpen: boolean; pendingTitle: string; pendingCategory?: TaskActivity["category"]; pendingDescription?: string } | null>(null);

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
      attachments: [],
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
      content: "Great progress on the product roadmap this sprint! Big thanks to everyone for the collaboration. 🚀",
      created_at: "2 hours ago",
      attachments: [],
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

  const createTask = (title: string, priority: Task["priority"], dueDate: string, assignedTo: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      organization_id: "org-teamora",
      title,
      description: "",
      assigned_to: assignedTo,
      assigned_to_name: "Nethmi Silva",
      assigned_by: currentUser.id,
      assigned_by_name: `${currentUser.first_name} ${currentUser.last_name}`,
      priority,
      status: "todo",
      due_date: dueDate,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const createPost = (content: string, attachments: any[] = [], isAnnouncement: boolean = false, targetDept?: string) => {
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      organization_id: "org-teamora",
      department_id: targetDept,
      author_id: currentUser.id,
      author_name: `${currentUser.first_name} ${currentUser.last_name}`,
      author_avatar: currentUser.avatar_url,
      author_role: currentUser.role,
      author_designation: currentUser.designation,
      content,
      is_announcement: isAnnouncement,
      is_pinned: isAnnouncement,
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

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = !p.has_liked;
          return {
            ...p,
            has_liked: hasLiked,
            likes_count: hasLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1),
          };
        }
        return p;
      })
    );
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

    setTaskActivities((prev) =>
      prev.map((t) => {
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
      })
    );
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
        posts,
        createPost,
        toggleLike,
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
        departments,
        orgSettings,
        updateOrgSettings,

        // Worksheet V2.0 Live Task Tracking
        taskActivities,
        taskRevisions,
        activeTask,
        activeTaskElapsedSeconds,
        todayTotalWorkSeconds,
        allEmployees: ALL_EMPLOYEES,
        startLiveTask,
        confirmTaskSwitch,
        endActiveTask,
        createManualTask,
        updateTaskActivity,
        deleteTaskActivity,
        checkOverlap,

        // UI Modal Controls
        isTaskPopupOpen,
        setIsTaskPopupOpen,
        editingTask,
        setEditingTask,
        isCreateTaskModalOpen,
        setIsCreateTaskModalOpen,
        createTaskModalPrefill,
        setCreateTaskModalPrefill,
        switchModalData,
        setSwitchModalData,
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

