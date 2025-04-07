
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLeaveChartData(
  period: "yearly" | "quarterly" | "monthly" = "yearly",
  startDate?: Date,
  endDate?: Date
) {
  return useQuery({
    queryKey: ["leave-chart-data", period, startDate?.toISOString(), endDate?.toISOString()],
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

      // Fetch leaves with leave type info
      const { data: leaveRequests, error } = await supabase
        .from('hr_leave_requests')
        .select(`
          *,
          leave_type:hr_leave_types(name)
        `)
        .gte('created_at', formattedStartDate)
        .lte('created_at', formattedEndDate);

      if (error) {
        console.error("Error fetching leave chart data:", error);
        throw error;
      }

      // Process data for charts
      const leaveTypeMap = {};
      leaveRequests.forEach(request => {
        const typeName = request.leave_type?.name || 'غير محدد';
        if (!leaveTypeMap[typeName]) {
          leaveTypeMap[typeName] = 0;
        }
        leaveTypeMap[typeName]++;
      });

      // Convert to array format for charts
      const chartData = Object.entries(leaveTypeMap).map(([name, value]) => ({
        name,
        value
      }));

      return {
        [period]: chartData
      };
    }
  });
}
