// src/hooks/hr/useEmployeeAttendanceReport.ts
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface EmployeeAttendanceReportData {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalWorkHours: number;
  earlyDepartures: number;
  records: any[];
}

export function useEmployeeAttendanceReport(employeeId?: string, startDate?: Date, endDate?: Date) {
  return useQuery<EmployeeAttendanceReportData, Error>({
    queryKey: ['employee-attendance-report', employeeId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!employeeId || !startDate || !endDate) {
        throw new Error("يجب تحديد الموظف وفترة التقرير");
      }

      // Fetch attendance records for the specific employee in the date range
      const { data, error } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('attendance_date', startDate.toISOString().split('T')[0])
        .lte('attendance_date', endDate.toISOString().split('T')[0])
        .order('attendance_date', { ascending: false });

      if (error) throw error;

      // Calculate statistics
      let totalWorkHours = 0;
      
      // Process each record to calculate work hours where applicable
      data?.forEach(record => {
        if (record.check_in && record.check_out) {
          const checkIn = new Date(record.check_in);
          const checkOut = new Date(record.check_out);
          const hoursDiff = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          totalWorkHours += hoursDiff;
        }
      });

      const presentDays = data?.filter(r => r.status === 'present').length || 0;
      const absentDays = data?.filter(r => r.status === 'absent').length || 0;
      const lateDays = data?.filter(r => r.status === 'late').length || 0;
      const earlyDepartures = data?.filter(r => r.left_early === true).length || 0;

      return {
        totalDays: data?.length || 0,
        presentDays,
        absentDays,
        lateDays,
        earlyDepartures,
        totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
        records: data || []
      };
    },
    enabled: !!employeeId && !!startDate && !!endDate
  });
}

