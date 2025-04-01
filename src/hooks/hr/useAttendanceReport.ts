
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
    byScheduleType?: { 
      name: string; 
      present: number; 
      absent: number; 
      late: number; 
      leave: number;
    }[];
  };
  employeeStats?: {
    employee_name: string;
    present: number;
    absent: number;
    late: number;
    leave: number;
  }[];
}

export function useAttendanceReport(startDate?: Date, endDate?: Date) {
  return useQuery<AttendanceReportData, Error>({
    queryKey: ['attendance-report', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      // Construct date filters
      let query = supabase
        .from('hr_attendance')
        .select(`
          *,
          employees:employee_id (
            id,
            full_name,
            position,
            department,
            schedule_id
          ),
          schedules:employees (
            schedule:schedule_id (
              name
            )
          )
        `)
        .order('attendance_date', { ascending: false });
      
      if (startDate) {
        query = query.gte('attendance_date', startDate.toISOString().split('T')[0]);
      }
      
      if (endDate) {
        query = query.lte('attendance_date', endDate.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data
      const records: AttendanceRecord[] = (data || []).map(record => ({
        id: record.id,
        employee_id: record.employee_id,
        employee_name: record.employees?.full_name || 'غير محدد',
        attendance_date: record.attendance_date,
        check_in: record.check_in,
        check_out: record.check_out,
        status: record.status,
        notes: record.notes,
        schedule_name: record.employees?.schedule?.name || 'دوام عادي'
      }));
      
      // Calculate statistics
      const totalRecords = records.length;
      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = records.filter(r => r.status === 'absent').length;
      const lateCount = records.filter(r => r.status === 'late').length;
      const leaveCount = records.filter(r => r.status === 'leave').length;
      
      // Calculate employee-specific stats
      const employeeMap = new Map();
      
      records.forEach(record => {
        if (!employeeMap.has(record.employee_id)) {
          employeeMap.set(record.employee_id, {
            employee_name: record.employee_name,
            present: 0,
            absent: 0,
            late: 0,
            leave: 0
          });
        }
        
        const empStats = employeeMap.get(record.employee_id);
        
        if (record.status === 'present') empStats.present++;
        else if (record.status === 'absent') empStats.absent++;
        else if (record.status === 'late') empStats.late++;
        else if (record.status === 'leave') empStats.leave++;
      });
      
      const employeeStats = Array.from(employeeMap.values());
      
      // Calculate stats by schedule type
      const scheduleMap = new Map();
      
      records.forEach(record => {
        const scheduleName = record.schedule_name || 'دوام عادي';
        
        if (!scheduleMap.has(scheduleName)) {
          scheduleMap.set(scheduleName, {
            name: scheduleName,
            present: 0,
            absent: 0,
            late: 0,
            leave: 0
          });
        }
        
        const schedStats = scheduleMap.get(scheduleName);
        
        if (record.status === 'present') schedStats.present++;
        else if (record.status === 'absent') schedStats.absent++;
        else if (record.status === 'late') schedStats.late++;
        else if (record.status === 'leave') schedStats.leave++;
      });
      
      const scheduleStats = Array.from(scheduleMap.values());
      
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
          leavePercentage: totalRecords ? (leaveCount / totalRecords) * 100 : 0,
          byScheduleType: scheduleStats
        },
        employeeStats
      };
    },
    enabled: !!startDate && !!endDate
  });
}
