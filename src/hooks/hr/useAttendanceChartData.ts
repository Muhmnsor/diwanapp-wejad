// src/hooks/hr/useAttendanceChartData.ts
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface AttendanceChartData {
  daily: Array<{ name: string; present: number; late: number; absent: number }>;
  weekly: Array<{ name: string; present: number; late: number; absent: number }>;
  monthly: Array<{ name: string; present: number; late: number; absent: number }>;
}

export function useAttendanceChartData(period: "daily" | "weekly" | "monthly", startDate?: Date, endDate?: Date) {
  return useQuery<AttendanceChartData, Error>({
    queryKey: ['attendance-chart-data', period, startDate?.toISOString(), endDate?.toISOString()],
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
        .lte('attendance_date', end.toISOString().split('T')[0])
        .order('attendance_date', { ascending: true });

      if (error) throw error;

      // Process data for charts
      let dailyData: any[] = [];
      let weeklyData: any[] = [];
      let monthlyData: any[] = [];
      
      // Process daily data
      // Group by hours of the day for daily
      if (period === 'daily') {
        // Initialize hours for a day (8am to 5pm)
        const hours = ['8 ص', '9 ص', '10 ص', '11 ص', '12 م', '1 م', '2 م', '3 م', '4 م', '5 م'];
        dailyData = hours.map(hour => ({
          name: hour,
          present: 0,
          late: 0,
          absent: 0
        }));
        
        // Count each record
        data?.forEach(record => {
          if (!record.check_in) return;
          
          const checkInHour = new Date(record.check_in).getHours();
          const hourIndex = checkInHour - 8; // Assuming 8am is the start
          
          if (hourIndex >= 0 && hourIndex < dailyData.length) {
            if (record.status === 'present') dailyData[hourIndex].present++;
            else if (record.status === 'late') dailyData[hourIndex].late++;
            else if (record.status === 'absent') dailyData[hourIndex].absent++;
          }
        });
      }
      
      // Process weekly data
      // Group by days of the week for weekly
      if (period === 'weekly' || period === 'monthly') {
        const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const daysCount: { [key: string]: { present: number, late: number, absent: number } } = {};
        
        dayNames.forEach(day => {
          daysCount[day] = { present: 0, late: 0, absent: 0 };
        });
        
        data?.forEach(record => {
          const recordDate = new Date(record.attendance_date);
          const dayOfWeek = dayNames[recordDate.getDay()];
          
          if (record.status === 'present') daysCount[dayOfWeek].present++;
          else if (record.status === 'late') daysCount[dayOfWeek].late++;
          else if (record.status === 'absent') daysCount[dayOfWeek].absent++;
        });
        
        weeklyData = dayNames.map(day => ({
          name: day,
          present: daysCount[day].present,
          late: daysCount[day].late,
          absent: daysCount[day].absent
        }));
      }
      
      // Process monthly data
      // Group by weeks for monthly
      if (period === 'monthly') {
        // Simplify to just 4 weeks
        monthlyData = [
          { name: 'أسبوع 1', present: 0, late: 0, absent: 0 },
          { name: 'أسبوع 2', present: 0, late: 0, absent: 0 },
          { name: 'أسبوع 3', present: 0, late: 0, absent: 0 },
          { name: 'أسبوع 4', present: 0, late: 0, absent: 0 }
        ];
        
        data?.forEach(record => {
          const recordDate = new Date(record.attendance_date);
          // Calculate which week of the month
          const day = recordDate.getDate();
          let weekIndex = Math.floor((day - 1) / 7);
          if (weekIndex > 3) weekIndex = 3; // Cap at week 4
          
          if (record.status === 'present') monthlyData[weekIndex].present++;
          else if (record.status === 'late') monthlyData[weekIndex].late++;
          else if (record.status === 'absent') monthlyData[weekIndex].absent++;
        });
      }
      
      return {
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

