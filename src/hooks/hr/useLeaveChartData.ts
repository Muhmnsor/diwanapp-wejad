
// src/hooks/hr/useLeaveChartData.ts
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface LeaveTypeData {
  name: string;
  value: number;
}

interface LeaveChartData {
  byType: LeaveTypeData[];
  monthly: LeaveTypeData[];
  quarterly: LeaveTypeData[];
  yearly: LeaveTypeData[];
}

export function useLeaveChartData(period: "yearly" | "quarterly" | "monthly", startDate?: Date, endDate?: Date) {
  return useQuery<LeaveChartData, Error>({
    queryKey: ['leave-chart-data', period, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      // Calculate date range based on period if not explicitly provided
      let start = startDate;
      let end = endDate || new Date();
      
      if (!start) {
        start = new Date();
        if (period === 'yearly') {
          start.setFullYear(start.getFullYear() - 1);
        } else if (period === 'quarterly') {
          start.setMonth(start.getMonth() - 3);
        } else if (period === 'monthly') {
          start.setMonth(start.getMonth() - 1);
        }
      }
      
      // Fetch leave types
      const { data: leaveTypes, error: typesError } = await supabase
        .from('hr_leave_types')
        .select('id, name');
        
      if (typesError) throw typesError;
      
      // Fetch leave requests for the period
      const { data: leaveRequests, error: requestsError } = await supabase
        .from('hr_leave_requests')
        .select('leave_type, start_date, end_date')
        .gte('start_date', start.toISOString().split('T')[0])
        .lte('start_date', end.toISOString().split('T')[0]);

      if (requestsError) throw requestsError;

      // Count leaves by type
      const typeMap = new Map<string, number>();
      
      // Initialize with all leave types
      leaveTypes?.forEach(type => {
        typeMap.set(type.name, 0);
      });
      
      // Count by type
      leaveRequests?.forEach(leave => {
        const currentCount = typeMap.get(leave.leave_type) || 0;
        typeMap.set(leave.leave_type, currentCount + 1);
      });
      
      // Convert to array format for charts
      const byTypeData = Array.from(typeMap).map(([name, value]) => ({ name, value }));
      
      // For simplicity, use the same data for all periods
      return {
        byType: byTypeData,
        monthly: byTypeData,
        quarterly: byTypeData,
        yearly: byTypeData
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
