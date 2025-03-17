
// Meeting management system types

export interface Meeting {
  id: string;
  title: string;
  meeting_type: 'board' | 'general_assembly' | 'committee' | 'other';
  date: string;
  start_time: string;
  duration: number; // in minutes
  attendance_type: 'in_person' | 'remote' | 'hybrid';
  location?: string;
  meeting_link?: string;
  objectives?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingAgendaItem {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  role: 'chairman' | 'member' | 'secretary' | 'observer';
  attendance_status: 'pending' | 'confirmed' | 'declined' | 'attended';
  created_at: string;
  updated_at: string;
  // User data (joined)
  user?: {
    display_name?: string;
    email?: string;
  };
}

export interface MeetingTask {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  task_type: 'preparation' | 'execution' | 'follow_up';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  due_date?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  // User data (joined)
  assignee?: {
    display_name?: string;
    email?: string;
  };
}

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  content?: string;
  status: 'draft' | 'published';
  created_by: string;
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
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  // User data (joined)
  responsible_user?: {
    display_name?: string;
    email?: string;
  };
}

export interface MeetingAttachment {
  id: string;
  meeting_id: string;
  task_id?: string;
  decision_id?: string;
  agenda_item_id?: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface MeetingNotification {
  id: string;
  meeting_id: string;
  user_id: string;
  notification_type: 'meeting_scheduled' | 'meeting_updated' | 'meeting_cancelled' | 
                     'meeting_reminder' | 'task_assigned' | 'task_due' | 'minutes_published';
  is_read: boolean;
  sent_at: string;
  notification_data?: Record<string, any>;
}

export interface MeetingFormData {
  title: string;
  meeting_type: 'board' | 'general_assembly' | 'committee' | 'other';
  date: string;
  start_time: string;
  duration: number;
  attendance_type: 'in_person' | 'remote' | 'hybrid';
  location?: string;
  meeting_link?: string;
  objectives?: string;
  participants: {
    user_id: string;
    role: 'chairman' | 'member' | 'secretary' | 'observer';
  }[];
  agenda_items: {
    title: string;
    description?: string;
    order_number: number;
  }[];
}
