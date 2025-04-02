
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
  // Trend data for sparklines
  employeeTrend: number[];
  attendanceTrend: number[];
  leavesTrend: number[];
  contractsTrend: number[];
  trainingsTrend: number[];
}

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
        
        // Generate trend data (for demonstration - in a real app, this would come from historical data)
        // In this example we're simulating trend data by generating random variations
        const generateTrendData = (baseValue: number, variance: number = 2, length: number = 7): number[] => {
          if (baseValue === 0) return Array(length).fill(0);
          // Ensure we have at least two points for valid sparkline
          return Array.from({ length: Math.max(2, length) }, () => {
            return Math.max(0, baseValue + Math.floor(Math.random() * variance * 2) - variance);
          });
        };
        
        // Make sure we always have valid array data for trends (at least 2 points)
        const employeeTrend = generateTrendData(totalEmployees || 0, 5, 10);
        const attendanceTrend = generateTrendData(presentToday || 0, 3, 10);
        const leavesTrend = generateTrendData(activeLeaves || 0, 2, 10);
        const contractsTrend = generateTrendData(expiringContracts || 0, 1, 10);
        const trainingsTrend = generateTrendData(pendingTrainings || 0, 2, 10);

        return {
          totalEmployees: totalEmployees || 0,
          newEmployees: newEmployees || 0,
          presentToday: presentToday || 0,
          attendanceRate,
          activeLeaves: activeLeaves || 0,
          upcomingLeaves: upcomingLeaves || 0,
          expiringContracts: expiringContracts || 0,
          pendingTrainings: pendingTrainings || 0,
          employeeTrend,
          attendanceTrend,
          leavesTrend,
          contractsTrend,
          trainingsTrend
        };
      } catch (error) {
        console.error('Error fetching HR stats:', error);
        // Return default values with valid trend arrays to prevent errors
        return {
          totalEmployees: 0,
          newEmployees: 0,
          presentToday: 0,
          attendanceRate: 0,
          activeLeaves: 0,
          upcomingLeaves: 0,
          expiringContracts: 0,
          pendingTrainings: 0,
          employeeTrend: [0, 0],
          attendanceTrend: [0, 0],
          leavesTrend: [0, 0],
          contractsTrend: [0, 0],
          trainingsTrend: [0, 0]
        };
      }
    },
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });
}
