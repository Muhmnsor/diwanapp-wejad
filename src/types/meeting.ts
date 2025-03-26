
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
  folder_name?: string; // Add folder_name property to fix error in MeetingDetailsPage
  created_at?: string;
  updated_at?: string;
  folder?: {
    id: string;
    name: string;
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

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';

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

// Define a standardized MeetingParticipant interface to use across the application
export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  user_email: string;
  user_display_name: string;
  role: string;
  attendance_status: string;
  title?: string; // Added: participant's organizational title
  phone?: string; // Added: participant's phone number
  created_at?: string;
  updated_at?: string;
}
