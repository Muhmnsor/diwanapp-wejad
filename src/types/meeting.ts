
// If the file doesn't exist, create it with the following content
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";
export type TaskType = "action_item" | "follow_up" | "decision" | "preparation" | "execution" | "other";
export type AttendanceType = "in_person" | "remote" | "hybrid";
export type MeetingType = "regular" | "executive" | "emergency" | "other";
export type ParticipantRole = "attendee" | "organizer" | "presenter" | "secretary" | "observer";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type DecisionStatus = "approved" | "rejected" | "pending" | "deferred";

export interface MeetingTask {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  assigned_to?: string;
  created_at: string;
  created_by?: string;
  assigned_user_name?: string;
  task_type: TaskType;
  requires_deliverable?: boolean;
  templates?: Array<{ url: string, name: string, type: string }>;
  general_task_id?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  start_time: string;
  duration: number;
  location?: string;
  meeting_link?: string;
  attendance_type: string;
  meeting_status: string;
  meeting_type: string;
  folder_id: string;
  folder_name?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  objectives?: { id: string; content: string; order_number: number }[];
  folder?: any;
}

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  content: string;
  created_at: string;
  created_by: string;
  attendees: Array<{
    id: string;
    name: string;
    role?: string;
    attendance_status: string;
  }>;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  role: string;
  user?: {
    id: string;
    email?: string;
    display_name?: string;
  };
  attendance_status?: string;
}
