
export interface Meeting {
  id: string;
  title: string;
  meeting_type: string;
  date: string;
  start_time: string;
  duration: number;
  location?: string;
  meeting_link?: string;
  objectives?: string;
  attendance_type: string;
  meeting_status: string;
  folder_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type MeetingType = 'board' | 'department' | 'team' | 'committee' | 'other';

export type AttendanceType = 'in_person' | 'virtual' | 'hybrid';

export type ParticipantRole = 'organizer' | 'presenter' | 'member' | 'guest';

export type AttendanceStatus = 'pending' | 'confirmed' | 'attended' | 'absent';

export type TaskType = 'action_item' | 'follow_up' | 'decision' | 'other';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type DecisionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface MeetingTask {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
  task_type: TaskType;
  status: TaskStatus;
  created_at?: string;
  updated_at?: string;
}
