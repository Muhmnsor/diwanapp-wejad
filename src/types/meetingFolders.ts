
export interface MeetingFolder {
  id: string;
  name: string;
  type: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

// Create a proper interface that doesn't reference an undefined type
export interface MeetingWithFolder {
  id: string;
  title: string;
  meeting_type: string;
  date: string;
  start_time: string;
  duration: number;
  location?: string;
  meeting_link?: string;
  objectives?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  meeting_status: string;
  attendance_type: string;
  status: string;
  folder_id?: string;
}
