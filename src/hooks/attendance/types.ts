export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  notRecorded: number;
}

export interface AttendanceRecord {
  id: string;
  registration_id: string;
  event_id?: string;
  project_id?: string;
  activity_id?: string;
  status: 'present' | 'absent';
  check_in_time?: string;
}