
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HRStats {
  totalEmployees: number;
  newEmployees: number;
  presentToday: number;
  attendanceRate: number;
  activeLeaves: number;
  upcomingLeaves: number;
  expiringContracts: number;
  pendingTrainings: number;
  trends: {
    attendanceTrend: number[];
    employeeTrend: number[];
    leaveTrend: number[];
    trainingTrend: number[];
  };
}

// Helper function to ensure we always have valid trend data
const ensureValidTrend = (data: number[] | undefined): number[] => {
  if (!data || data.length < 2) {
    return [0, 0, 0, 0, 0, 0, 0];
  }
  return data;
};

export function useHRStats() {
  const today = new Date().toISOString().split('T')[0];
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['hr-stats'],
    queryFn: async (): Promise<HRStats> => {
      try {
        // Get total employees count
        const { count: totalEmployees, error: employeesError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true });
          
        if (employeesError) throw employeesError;
          
        // Get new employees (hired in the last month)
        const { count: newEmployees, error: newEmployeesError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .gte('hire_date', oneMonthAgoStr);
          
        if (newEmployeesError) throw newEmployeesError;
        
        // Get present employees today
        const { count: presentToday, error: presentError } = await supabase
          .from('hr_attendance')
          .select('*', { count: 'exact', head: true })
          .eq('attendance_date', today)
          .eq('status', 'present');
          
        if (presentError) throw presentError;
        
        // Get active leaves
        const { count: activeLeaves, error: leavesError } = await supabase
          .from('hr_leave_requests')
          .select('*', { count: 'exact', head: true })
          .lte('start_date', today)
          .gte('end_date', today)
          .eq('status', 'approved');
          
        if (leavesError) throw leavesError;
        
        // Get upcoming leaves
        const { count: upcomingLeaves, error: upcomingLeavesError } = await supabase
          .from('hr_leave_requests')
          .select('*', { count: 'exact', head: true })
          .gt('start_date', today)
          .lte('start_date', nextWeekStr)
          .eq('status', 'approved');
          
        if (upcomingLeavesError) throw upcomingLeavesError;
        
        // Get expiring contracts this month
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        const oneMonthLaterStr = oneMonthLater.toISOString().split('T')[0];
        
        const { count: expiringContracts, error: contractsError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .lte('contract_end_date', oneMonthLaterStr)
          .gt('contract_end_date', today);
          
        if (contractsError) throw contractsError;
        
        // Get pending trainings
        const { count: pendingTrainings, error: trainingsError } = await supabase
          .from('hr_employee_training')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'enrolled');
          
        if (trainingsError) throw trainingsError;
        
        // Calculate attendance rate
        const attendanceRate = totalEmployees > 0 ? 
          Math.round((presentToday / (totalEmployees - activeLeaves)) * 100) : 0;
          
        // Mock trend data (in a real app, we would fetch this from the database)
        // For a 7-day period
        const trends = {
          attendanceTrend: [75, 82, 78, 85, 80, 87, attendanceRate],
          employeeTrend: [totalEmployees - 5, totalEmployees - 3, totalEmployees - 3, totalEmployees - 2, totalEmployees - 1, totalEmployees - 1, totalEmployees],
          leaveTrend: [3, 4, 3, 2, 5, 4, activeLeaves],
          trainingTrend: [10, 8, 12, 15, 14, 13, pendingTrainings]
        };
        
        return {
          totalEmployees: totalEmployees || 0,
          newEmployees: newEmployees || 0,
          presentToday: presentToday || 0,
          attendanceRate,
          activeLeaves: activeLeaves || 0,
          upcomingLeaves: upcomingLeaves || 0,
          expiringContracts: expiringContracts || 0,
          pendingTrainings: pendingTrainings || 0,
          trends
        };
      } catch (error) {
        console.error('Error fetching HR stats:', error);
        return {
          totalEmployees: 0,
          newEmployees: 0,
          presentToday: 0,
          attendanceRate: 0,
          activeLeaves: 0,
          upcomingLeaves: 0,
          expiringContracts: 0,
          pendingTrainings: 0,
          trends: {
            attendanceTrend: [0, 0, 0, 0, 0, 0, 0],
            employeeTrend: [0, 0, 0, 0, 0, 0, 0],
            leaveTrend: [0, 0, 0, 0, 0, 0, 0],
            trainingTrend: [0, 0, 0, 0, 0, 0, 0]
          }
        };
      }
    },
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });
}

// Helper to get trend direction (up or down)
export const getTrendDirection = (data: number[]): 'up' | 'down' | 'neutral' => {
  const validData = ensureValidTrend(data);
  if (validData.length < 2) return 'neutral';
  
  const lastValue = validData[validData.length - 1];
  const previousValue = validData[validData.length - 2];
  
  if (lastValue > previousValue) return 'up';
  if (lastValue < previousValue) return 'down';
  return 'neutral';
};

// Helper to get trend percentage change
export const getTrendPercentage = (data: number[]): number => {
  const validData = ensureValidTrend(data);
  if (validData.length < 2) return 0;
  
  const lastValue = validData[validData.length - 1];
  const firstValue = validData[0];
  
  if (firstValue === 0) return 0;
  return Math.round(((lastValue - firstValue) / firstValue) * 100);
};
