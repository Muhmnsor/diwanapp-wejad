
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
  objectives?: string;
  agenda?: string;
}

export type MeetingType = 'board' | 'department' | 'team' | 'committee' | 'other';
export type AttendanceType = 'in_person' | 'remote' | 'hybrid';
export type ParticipantRole = 'chairman' | 'member' | 'secretary' | 'viewer';
export type AttendanceStatus = 'pending' | 'attended' | 'excused' | 'absent';

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id?: string;
  user_email?: string;
  user_display_name: string;
  user_phone?: string;
  role: ParticipantRole;
  attendance_status: AttendanceStatus;
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
