export type UserRole = 'employee' | 'sub_admin' | 'hr_admin' | 'owner';

export interface UserProfile {
  id: string;
  organization_id: string;
  department_id?: string;
  department_name?: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  designation: string;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  joined_date: string;
}

export interface AttendanceSession {
  id: string;
  organization_id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  department_name?: string;
  work_date: string; // YYYY-MM-DD
  check_in: string;  // ISO string
  check_out?: string; // ISO string
  duration_seconds: number;
  status: 'active' | 'completed' | 'late' | 'corrected';
  is_late?: boolean;
  ongoing_task?: string;
  ongoing_task_category?: string;
}

export interface AttendanceCorrection {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  original_check_in: string;
  original_check_out?: string;
  requested_check_in: string;
  requested_check_out: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  review_comment?: string;
  created_at: string;
}

export interface FeedAttachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: 'image' | 'video' | 'document';
  file_size?: string;
}

export interface FeedComment {
  id: string;
  post_id: string;
  parent_comment_id?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role: UserRole;
  content: string;
  created_at: string;
}

export interface FeedPost {
  id: string;
  organization_id: string;
  department_id?: string;
  department_name?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role: UserRole;
  author_designation: string;
  content: string;
  is_announcement?: boolean;
  is_pinned?: boolean;
  created_at: string;
  attachments: FeedAttachment[];
  likes_count: number;
  comments_count: number;
  impressions_count: number;
  reach_count: number;
  has_liked?: boolean;
  comments: FeedComment[];
}

export interface WorksheetActivity {
  id: string;
  user_id: string;
  task_id?: string;
  title: string;
  description?: string;
  category: 'Development' | 'Design' | 'Meeting' | 'Review' | 'Planning' | 'General';
  start_time: string; // ISO string
  end_time: string;   // ISO string
  duration_minutes: number;
  attachment_urls: string[];
  is_submitted: boolean;
}

export interface WorksheetReport {
  id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  department_name?: string;
  report_date: string; // YYYY-MM-DD
  total_minutes: number;
  summary_notes: string;
  status: 'draft' | 'submitted' | 'approved' | 'changes_requested';
  submitted_at?: string;
  reviewer_id?: string;
  reviewer_name?: string;
  reviewer_feedback?: string;
  activities: WorksheetActivity[];
}

export interface Task {
  id: string;
  organization_id: string;
  department_id?: string;
  department_name?: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_to_name: string;
  assigned_to_avatar?: string;
  assigned_by: string;
  assigned_by_name: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed';
  due_date: string;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  department_name: string;
  leave_type: 'Annual' | 'Sick' | 'Casual' | 'Unpaid';
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  review_comment?: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  sub_admin_id?: string;
  sub_admin_name?: string;
  member_count: number;
}

export interface OrganizationSettings {
  name: string;
  work_start_time: string;
  work_end_time: string;
  grace_period_minutes: number;
  half_day_hours: number;
  full_day_hours: number;
}

// ==========================================
// WORKSHEET V2.0 — LIVE TASK TRACKING TYPES
// ==========================================

export type TaskActivityStatus = 'Ongoing' | 'Completed' | 'Scheduled';
export type TaskEntryMode = 'live' | 'manual';

export interface TaskActivity {
  id: string;
  organization_id: string;
  employee_id: string;
  employee_name?: string;
  employee_avatar?: string;
  department_name?: string;
  title: string;
  description?: string;
  category?: 'Development' | 'Design' | 'Meeting' | 'Review' | 'Planning' | 'General';
  start_at: string; // ISO string
  end_at?: string | null; // ISO string; null while ongoing
  duration_seconds?: number;
  status: TaskActivityStatus;
  entry_mode: TaskEntryMode;
  created_at: string;
  updated_at: string;
  created_by: string;
  version: number;
}

export interface TaskRevision {
  id: string;
  task_id: string;
  task_title: string;
  original_start: string;
  original_end?: string | null;
  updated_start: string;
  updated_end?: string | null;
  edited_by: string;
  edited_by_name: string;
  edited_at: string;
  reason?: string;
  was_live_recorded: boolean;
}


