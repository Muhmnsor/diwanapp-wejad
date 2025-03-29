
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
  folder_name?: string;
  created_at?: string;
  updated_at?: string;
  folder?: {
    id: string;
    name: string;
  };
  creator?: {
    display_name: string;
    email: string;
  };
}

export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type MeetingType = 'board' | 'department' | 'team' | 'committee' | 'other';

export type AttendanceType = 'in_person' | 'virtual' | 'hybrid';

export type ParticipantRole = 'chairman' | 'secretary' | 'member' | 'observer';

export type AttendanceStatus = 'pending' | 'confirmed' | 'attended' | 'absent';

export type TaskType = 'action_item' | 'follow_up' | 'decision' | 'other';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type DecisionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Export RequestStatus type with all valid status values
export type RequestStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed' | 'cancelled';

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

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  user_email: string;
  user_display_name: string;
  role: string;
  attendance_status: string;
  title?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}
