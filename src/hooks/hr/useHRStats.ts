
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
  
  // New fields
  employeeGrowthRate?: number;
  turnoverRate?: number;
  turnoverChange?: number;
  averageTenure?: number;
  attendanceRateChange?: number;
  leaveUtilizationRate?: number; 
  leaveUtilizationChange?: number;
  trainingBudgetUsed?: number;
  trainingBudgetChange?: number;
  pendingLeaveRequests?: number;
  
  // Sample historical data for sparklines
  employeeCountHistory?: number[];
  attendanceHistory?: number[];
  leaveHistory?: number[];
  turnoverHistory?: number[];
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
        
        // Get pending leave requests
        const { count: pendingLeaveRequests, error: pendingLeaveError } = await supabase
          .from('hr_leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        if (pendingLeaveError) throw pendingLeaveError;
        
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
        
        // Calculate employee growth rate (simplified for demo)
        const employeeGrowthRate = totalEmployees > 0 ? 
          Math.round((newEmployees / totalEmployees) * 100) : 0;
        
        // For demonstration purposes, we're simulating some of the new metrics
        // In a real application, these would be calculated from actual data
        
        // Sample trend data
        const turnoverRate = 2.5; // 2.5% turnover rate
        const turnoverChange = -0.3; // decreased by 0.3%
        const averageTenure = 3.2; // 3.2 years average tenure
        const attendanceRateChange = 2; // 2% increase in attendance rate
        const leaveUtilizationRate = 68; // 68% of leave utilized
        const leaveUtilizationChange = 5; // 5% increase in leave utilization
        const trainingBudgetUsed = 45; // 45% of budget used
        const trainingBudgetChange = 10; // 10% increase in budget utilization
        
        // Sample historical data for sparklines
        const employeeCountHistory = [120, 122, 125, 128, 130, totalEmployees];
        const attendanceHistory = [65, 68, 70, 72, 75, attendanceRate];
        const leaveHistory = [8, 12, 10, 15, 8, activeLeaves];
        const turnoverHistory = [3.2, 3.0, 2.8, 2.5, 2.2, 2.0];
        
        return {
          totalEmployees: totalEmployees || 0,
          newEmployees: newEmployees || 0,
          presentToday: presentToday || 0,
          attendanceRate,
          activeLeaves: activeLeaves || 0,
          upcomingLeaves: upcomingLeaves || 0,
          expiringContracts: expiringContracts || 0,
          pendingTrainings: pendingTrainings || 0,
          
          // New fields
          employeeGrowthRate,
          turnoverRate,
          turnoverChange,
          averageTenure,
          attendanceRateChange,
          leaveUtilizationRate,
          leaveUtilizationChange,
          trainingBudgetUsed,
          trainingBudgetChange,
          pendingLeaveRequests: pendingLeaveRequests || 0,
          
          // Historical data
          employeeCountHistory,
          attendanceHistory,
          leaveHistory,
          turnoverHistory
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
          pendingTrainings: 0
        };
      }
    },
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });
}
