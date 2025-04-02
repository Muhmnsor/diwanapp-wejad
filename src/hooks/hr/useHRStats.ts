
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HRStats {
  totalEmployees: number;
  newEmployees: number;
  presentToday: number;
  attendanceRate: number;
  activeLeaves: number;
  upcomingLeaves: number;
  expiringContracts: number;
  pendingTrainings: number;
  urgentTasks: number;
  expiringContractDetails: {
    id: string;
    employeeName: string;
    expiryDate: string;
    daysRemaining: number;
    contractType: string;
  }[];
  employeesByDepartment: { name: string; value: number }[];
  employeesByContractType: { name: string; value: number }[];
  weeklyAttendanceData: {
    name: string;
    present: number;
    late: number;
    absent: number;
  }[];
  leavesByType: { name: string; value: number }[];
  trends: {
    employeeTrend: number[];
    attendanceTrend: number[];
    leaveTrend: number[];
    contractsTrend: number[];
    trainingTrend: number[];
    tasksTrend: number[];
  };
}

export function useHRStats() {
  return useQuery<HRStats, Error>({
    queryKey: ['hr-stats'],
    queryFn: async () => {
      // In a real app, we would fetch this data from an API or database
      // For now, we'll use sample data

      // Fetch basic employee count
      const { count: totalEmployees, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
      // Fetch new employees from the last month
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newEmployees, error: newEmpError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .gte('hire_date', thirtyDaysAgo.toISOString().split('T')[0]);
        
      if (newEmpError) throw newEmpError;
      
      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      
      const { count: presentToday, error: presentError } = await supabase
        .from('hr_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('attendance_date', today)
        .eq('status', 'present');
        
      if (presentError) throw presentError;
      
      // Sample data for the rest - in a real app, these would come from the database
      return {
        totalEmployees: totalEmployees || 28,
        newEmployees: newEmployees || 3,
        presentToday: presentToday || 22,
        attendanceRate: 85,
        activeLeaves: 4,
        upcomingLeaves: 7,
        expiringContracts: 5,
        pendingTrainings: 12,
        urgentTasks: 3,
        expiringContractDetails: [
          { id: '1', employeeName: 'أحمد محمد', expiryDate: '2023-08-15', daysRemaining: 5, contractType: 'دوام كامل' },
          { id: '2', employeeName: 'فاطمة علي', expiryDate: '2023-08-22', daysRemaining: 12, contractType: 'دوام جزئي' },
          { id: '3', employeeName: 'محمد خالد', expiryDate: '2023-08-30', daysRemaining: 20, contractType: 'دوام كامل' },
          { id: '4', employeeName: 'نوره سالم', expiryDate: '2023-09-05', daysRemaining: 26, contractType: 'متعاقد' },
          { id: '5', employeeName: 'عبدالله يوسف', expiryDate: '2023-09-10', daysRemaining: 31, contractType: 'دوام كامل' }
        ],
        employeesByDepartment: [
          { name: 'الإدارة', value: 5 },
          { name: 'تقنية المعلومات', value: 8 },
          { name: 'الموارد البشرية', value: 4 },
          { name: 'المالية', value: 3 },
          { name: 'التسويق', value: 6 }
        ],
        employeesByContractType: [
          { name: 'دوام كامل', value: 20 },
          { name: 'دوام جزئي', value: 5 },
          { name: 'متعاقد', value: 3 }
        ],
        weeklyAttendanceData: [
          { name: 'الأحد', present: 22, late: 3, absent: 3 },
          { name: 'الإثنين', present: 24, late: 2, absent: 2 },
          { name: 'الثلاثاء', present: 23, late: 4, absent: 1 },
          { name: 'الأربعاء', present: 25, late: 1, absent: 2 },
          { name: 'الخميس', present: 20, late: 5, absent: 3 }
        ],
        leavesByType: [
          { name: 'سنوية', value: 15 },
          { name: 'مرضية', value: 8 },
          { name: 'طارئة', value: 5 },
          { name: 'أمومة', value: 2 },
          { name: 'بدون راتب', value: 1 }
        ],
        trends: {
          employeeTrend: [23, 24, 25, 26, 28, 28, 28],
          attendanceTrend: [80, 82, 85, 83, 86, 84, 85],
          leaveTrend: [2, 3, 5, 4, 2, 3, 4],
          contractsTrend: [1, 0, 2, 3, 4, 5, 5],
          trainingTrend: [5, 8, 10, 12, 15, 13, 12],
          tasksTrend: [1, 2, 3, 5, 4, 3, 3]
        }
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function getTrendDirection(data: number[]) {
  if (!data || data.length < 2) return 'neutral';
  
  const lastValue = data[data.length - 1];
  const previousValue = data[data.length - 2];
  
  if (lastValue > previousValue) return 'up';
  if (lastValue < previousValue) return 'down';
  return 'neutral';
}

export function getTrendPercentage(data: number[]) {
  if (!data || data.length < 2) return 0;
  
  const lastValue = data[data.length - 1];
  const previousValue = data[data.length - 2];
  
  if (previousValue === 0) return 0; // Avoid division by zero
  
  const percentageChange = Math.abs(((lastValue - previousValue) / previousValue) * 100);
  return Math.round(percentageChange);
}
