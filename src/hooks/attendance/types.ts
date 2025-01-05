export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  notRecorded: number;
}

export interface AttendanceRecord {
  id: string;
  registration_id: string;
  status: 'present' | 'absent';
  check_in_time?: string;
  recorded_by?: string;
}

export interface AttendanceHookReturn {
  attendanceStats: AttendanceStats;
  setAttendanceStats: (stats: AttendanceStats) => void;
  handleAttendanceChange: (registrationId: string, status: 'present' | 'absent', activityId?: string) => Promise<void>;
  handleGroupAttendance: (status: 'present' | 'absent', activityId?: string) => Promise<void>;
}