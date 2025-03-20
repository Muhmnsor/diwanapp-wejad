
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  duration: number;
  location: string;
  location_url?: string;
  meeting_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendance_type: AttendanceType;
  meeting_type: MeetingType;
  creator_id: string;
  folder_id?: string;
  created_at: string;
  updated_at: string;
  creator?: {
    display_name: string;
  };
  folder?: {
    name: string;
  };
  objectives?: string[] | string; // Can be array or string for backward compatibility
  agenda?: string[] | string; // Can be array or string for backward compatibility
}

export type MeetingType = 'board' | 'department' | 'team' | 'committee' | 'other';
export type AttendanceType = 'in_person' | 'remote' | 'hybrid';

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id?: string;
  user_email?: string;
  user_display_name: string;
  user_phone?: string;
  role: 'chairman' | 'member' | 'secretary' | 'viewer';
  attendance_status: 'pending' | 'attended' | 'excused' | 'absent';
  is_external: boolean;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface MeetingAttachment {
  id: string;
  meeting_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

// Create a specific type for meeting form data
export interface MeetingFormData {
  title: string;
  description?: string;
  date: string;
  start_time: string;
  duration: number;
  location: string;
  location_url?: string;
  meeting_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendance_type: AttendanceType;
  folder_id?: string;
  objectives: string[]; // Array for ordered list
  agenda: string[]; // Array for ordered list
}
