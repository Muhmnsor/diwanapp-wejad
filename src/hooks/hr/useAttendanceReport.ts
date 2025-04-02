
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string | null;
  schedule_name?: string;
}

export interface AttendanceReportData {
  records: AttendanceRecord[];
  stats: {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    leaveCount: number;
    presentPercentage: number;
    absentPercentage: number;
    latePercentage: number;
    leavePercentage: number;
  };
}

export function useAttendanceReport(startDate?: Date, endDate?: Date, employeeId?: string) {
  return useQuery<AttendanceReportData, Error>({
    queryKey: ['attendance-report', startDate?.toISOString(), endDate?.toISOString(), employeeId],
    queryFn: async () => {
      if (!startDate || !endDate) {
        return { records: [], stats: {
          totalRecords: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          leaveCount: 0,
          presentPercentage: 0,
          absentPercentage: 0,
          latePercentage: 0,
          leavePercentage: 0
        }};
      }
      
      // Format dates for the query
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Construct query
      let query = supabase
        .from('hr_attendance')
        .select(`
          *,
          employees:employee_id (
            id,
            full_name,
            position,
            department
          )
        `)
        .gte('attendance_date', startDateStr)
        .lte('attendance_date', endDateStr)
        .order('attendance_date', { ascending: false });
      
      // Add employee filter if specified
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      // Transform the data
      const records: AttendanceRecord[] = (data || []).map(record => ({
        id: record.id,
        employee_id: record.employee_id,
        employee_name: record.employees?.full_name || 'غير محدد',
        attendance_date: record.attendance_date,
        check_in: record.check_in,
        check_out: record.check_out,
        status: record.status || 'غير محدد',
        notes: record.notes
      }));
      
      // Calculate statistics
      const totalRecords = records.length;
      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = records.filter(r => r.status === 'absent').length;
      const lateCount = records.filter(r => r.status === 'late').length;
      const leaveCount = records.filter(r => r.status === 'leave').length;
      
      return {
        records,
        stats: {
          totalRecords,
          presentCount,
          absentCount,
          lateCount,
          leaveCount,
          presentPercentage: totalRecords ? (presentCount / totalRecords) * 100 : 0,
          absentPercentage: totalRecords ? (absentCount / totalRecords) * 100 : 0,
          latePercentage: totalRecords ? (lateCount / totalRecords) * 100 : 0,
          leavePercentage: totalRecords ? (leaveCount / totalRecords) * 100 : 0
        }
      };
    },
    enabled: !!startDate && !!endDate
  });
}
