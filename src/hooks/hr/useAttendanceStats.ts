// src/hooks/hr/useAttendanceStats.ts
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface AttendanceStatsData {
  presentCount: number;
  lateCount: number;
  absentCount: number;
  averageWorkHours: number;
}

export function useAttendanceStats(period: "daily" | "weekly" | "monthly", startDate?: Date, endDate?: Date) {
  return useQuery<AttendanceStatsData, Error>({
    queryKey: ['attendance-stats', period, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      // Calculate date range based on period if not explicitly provided
      let start = startDate;
      let end = endDate || new Date();
      
      if (!start) {
        start = new Date();
        if (period === 'weekly') {
          start.setDate(start.getDate() - 7);
        } else if (period === 'monthly') {
          start.setMonth(start.getMonth() - 1);
        }
      }
      
      // Fetch attendance records for the period
      const { data, error } = await supabase
        .from('hr_attendance')
        .select('*')
        .gte('attendance_date', start.toISOString().split('T')[0])
        .lte('attendance_date', end.toISOString().split('T')[0]);

      if (error) throw error;

      // Calculate statistics
      let totalWorkHours = 0;
      
      // Process each record to calculate work hours
      data?.forEach(record => {
        if (record.check_in && record.check_out) {
          const checkIn = new Date(record.check_in);
          const checkOut = new Date(record.check_out);
          const hoursDiff = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          totalWorkHours += hoursDiff;
        }
      });

      const presentCount = data?.filter(r => r.status === 'present').length || 0;
      const absentCount = data?.filter(r => r.status === 'absent').length || 0;
      const lateCount = data?.filter(r => r.status === 'late').length || 0;
      const averageWorkHours = data?.length ? parseFloat((totalWorkHours / data.length).toFixed(1)) : 0;
      
      return {
        presentCount,
        lateCount,
        absentCount,
        averageWorkHours
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

