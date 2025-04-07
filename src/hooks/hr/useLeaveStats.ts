// src/hooks/hr/useLeaveStats.ts
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface LeaveStatsData {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

export function useLeaveStats(period: "yearly" | "quarterly" | "monthly", startDate?: Date, endDate?: Date) {
  return useQuery<LeaveStatsData, Error>({
    queryKey: ['leave-stats', period, startDate?.toISOString(), endDate?.toISOString()],
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
      
      // Fetch leave requests for the period
      const { data, error } = await supabase
        .from('hr_leave_requests')
        .select('*')
        .gte('start_date', start.toISOString().split('T')[0])
        .lte('start_date', end.toISOString().split('T')[0]);

      if (error) throw error;

      // Calculate statistics
      const total = data?.length || 0;
      const approved = data?.filter(r => r.status === 'approved').length || 0;
      const rejected = data?.filter(r => r.status === 'rejected').length || 0;
      const pending = data?.filter(r => r.status === 'pending').length || 0;
      
      return {
        total,
        approved,
        rejected,
        pending
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

