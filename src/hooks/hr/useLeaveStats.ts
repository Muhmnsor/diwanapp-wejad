
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaveStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export function useLeaveStats(
  period: "yearly" | "quarterly" | "monthly" = "yearly",
  startDate?: Date,
  endDate?: Date
) {
  return useQuery({
    queryKey: ["leave-stats", period, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      // Calculate date range based on period
      let queryStartDate = startDate;
      let queryEndDate = endDate;

      if (!queryStartDate || !queryEndDate) {
        const now = new Date();
        
        if (period === "yearly") {
          queryStartDate = new Date(now.getFullYear(), 0, 1);
          queryEndDate = new Date(now.getFullYear(), 11, 31);
        } else if (period === "quarterly") {
          const quarter = Math.floor(now.getMonth() / 3);
          queryStartDate = new Date(now.getFullYear(), quarter * 3, 1);
          queryEndDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        } else if (period === "monthly") {
          queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
      }

      // Format dates for Supabase
      const formattedStartDate = queryStartDate?.toISOString().split('T')[0];
      const formattedEndDate = queryEndDate?.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('hr_leave_requests')
        .select('status')
        .gte('created_at', formattedStartDate)
        .lte('created_at', formattedEndDate);

      if (error) {
        console.error("Error fetching leave stats:", error);
        throw error;
      }

      // Count stats
      const stats: LeaveStats = {
        total: data.length,
        approved: data.filter(leave => leave.status === 'approved').length,
        pending: data.filter(leave => leave.status === 'pending').length,
        rejected: data.filter(leave => leave.status === 'rejected').length
      };

      return stats;
    }
  });
}
