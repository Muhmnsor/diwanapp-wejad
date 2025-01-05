export interface AttendanceStats {
  totalRegistrations: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface AttendanceRecord {
  id: string;
  registration_id: string;
  status: 'present' | 'absent';
  check_in_time?: string;
  recorded_by?: string;
}

export interface AttendanceHookReturn {
  stats: AttendanceStats;
  records: AttendanceRecord[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}