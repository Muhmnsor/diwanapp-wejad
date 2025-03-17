
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  location?: string;
  meeting_type: string;
  status: string;
  start_time: string;
  end_time: string;
  date: string;
  duration: number;
  attendance_type: 'in_person' | 'remote' | 'hybrid';
  meeting_link?: string;
  objectives?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  agenda_items?: MeetingAgendaItem[];
}

export interface MeetingAgendaItem {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  order_number: number;
  duration?: number;
  presenter?: string;
  status: string;
  created_at: string;
}

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  content: string;
  status: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  creator?: {
    display_name?: string;
    email?: string;
  };
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  role: string;
  status: string;
  attendance_status: string;
  created_at: string;
  user: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
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
  created_at: string;
  updated_at?: string;
  assignee?: {
    display_name?: string;
    email?: string;
  };
}

export interface MeetingDecision {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  status: string;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  assignee?: {
    display_name: string;
    email: string;
  };
}

export interface MeetingAttachment {
  id: string;
  meeting_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  updated_at?: string;
}

export interface MeetingFormData {
  title: string;
  meeting_type: string;
  date: string;
  start_time: string;
  duration: number;
  attendance_type: 'in_person' | 'remote' | 'hybrid';
  location?: string;
  meeting_link?: string;
  objectives?: string;
  participants: Array<{
    user_id: string;
    role: string;
  }>;
  agenda_items?: Array<{
    title: string;
    description?: string;
    order_number: number;
  }>;
}

// Define component props interfaces - Updated to match actual usage
export interface MeetingAgendaPanelProps {
  meetingId: string;
}

export interface MeetingParticipantsPanelProps {
  meetingId: string;
}

export interface MeetingMinutesPanelProps {
  meetingId: string;
}

export interface MeetingDecisionsPanelProps {
  meetingId: string;
}

export interface MeetingDetailProps {
  meetingId: string;
}
