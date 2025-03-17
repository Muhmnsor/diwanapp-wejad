
export interface Meeting {
  id: string;
  title: string;
  meeting_type: MeetingType;
  date: string;
  start_time: string;
  duration: number;
  location?: string;
  meeting_link?: string;
  objectives?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  meeting_status: MeetingStatus;
  attendance_type: AttendanceType;
  status: MeetingLifecycleStatus;
}

export type MeetingType = 'board' | 'department' | 'team' | 'committee' | 'other';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type AttendanceType = 'in_person' | 'virtual' | 'hybrid';
export type MeetingLifecycleStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  role: ParticipantRole;
  attendance_status: AttendanceStatus;
  created_at: string;
  updated_at: string;
  user_display_name?: string;
  user_email?: string;
}

export type ParticipantRole = 'organizer' | 'presenter' | 'member' | 'guest';
export type AttendanceStatus = 'pending' | 'confirmed' | 'attended' | 'absent';

export interface AgendaItem {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface MeetingDecision {
  id: string;
  meeting_id: string;
  agenda_item_id?: string;
  decision_text: string;
  responsible_user_id?: string;
  due_date?: string;
  status: DecisionStatus;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export type DecisionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  content?: string;
  status: MinutesStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type MinutesStatus = 'draft' | 'published' | 'archived';

export interface MeetingAttachment {
  id: string;
  meeting_id: string;
  agenda_item_id?: string;
  decision_id?: string;
  task_id?: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface MeetingTask {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
  status: TaskStatus;
  task_type: TaskType;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskType = 'preparation' | 'execution' | 'follow_up' | 'action_item' | 'decision' | 'other';
