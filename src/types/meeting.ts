
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";
export type TaskType = "action_item" | "follow_up" | "decision" | "preparation" | "execution" | "other";
export type DecisionStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type MeetingType = "regular" | "urgent" | "followup" | "planning" | "review" | "other";
export type AttendanceType = "in_person" | "online" | "hybrid";
export type ParticipantRole = "organizer" | "presenter" | "member" | "guest";
export type AttendanceStatus = "pending" | "confirmed" | "attended" | "absent";

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
  created_by: string;
  created_at: string;
  updated_at?: string;
  folder_name?: string;
  objectives?: string[];
  folder?: {
    id: string;
    name: string;
  };
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
  role: ParticipantRole;
  user?: {
    id: string;
    email?: string;
    display_name?: string;
  };
  attendance_status?: AttendanceStatus;
  user_email?: string;
  user_display_name?: string;
}

export interface MeetingDecision {
  id: string;
  meeting_id: string;
  decision_text: string;
  responsible_user_id?: string;
  due_date?: string;
  status: DecisionStatus;
  created_at: string;
  created_by?: string;
  order_number?: number;
}
