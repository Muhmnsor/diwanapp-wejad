
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";

export interface LeaveRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  duration: number;
  reason: string | null;
  status: string;
}

export interface LeaveReportData {
  records: LeaveRecord[];
  stats: {
    totalRequests: number;
    approvedCount: number;
    rejectedCount: number;
    pendingCount: number;
    totalDays: number;
    approvedPercentage: number;
    rejectedPercentage: number;
    pendingPercentage: number;
  };
  leaveTypeStats?: {
    leave_type: string;
    count: number;
    days: number;
  }[];
  employeeStats?: {
    employee_name: string;
    count: number;
    days: number;
  }[];
  // Add trend data for sparklines
  trends?: {
    leaves: number[];
    approvals: number[];
    rejections: number[];
  };
}

export function useLeaveReport(startDate?: Date, endDate?: Date) {
  return useQuery<LeaveReportData, Error>({
    queryKey: ['leave-report', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      // Construct date filters
      let query = supabase
        .from('hr_leave_requests')
        .select(`
          *,
          employees:employee_id (
            id,
            full_name,
            position,
            department
          )
        `)
        .order('created_at', { ascending: false });
      
      if (startDate) {
        query = query.gte('start_date', startDate.toISOString().split('T')[0]);
      }
      
      if (endDate) {
        query = query.lte('end_date', endDate.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data
      const records: LeaveRecord[] = (data || []).map(record => {
        const startDate = new Date(record.start_date);
        const endDate = new Date(record.end_date);
        const duration = differenceInDays(endDate, startDate) + 1; // Include both start and end dates
        
        return {
          id: record.id,
          employee_id: record.employee_id,
          employee_name: record.employees?.full_name || 'غير محدد',
          leave_type: record.leave_type,
          start_date: record.start_date,
          end_date: record.end_date,
          duration,
          reason: record.reason,
          status: record.status
        };
      });
      
      // Calculate statistics
      const totalRequests = records.length;
      const approvedCount = records.filter(r => r.status === 'approved').length;
      const rejectedCount = records.filter(r => r.status === 'rejected').length;
      const pendingCount = records.filter(r => r.status === 'pending').length;
      const totalDays = records.reduce((sum, record) => sum + record.duration, 0);
      
      // Calculate leave type stats
      const leaveTypeMap = new Map();
      
      records.forEach(record => {
        if (!leaveTypeMap.has(record.leave_type)) {
          leaveTypeMap.set(record.leave_type, { count: 0, days: 0 });
        }
        
        const typeStats = leaveTypeMap.get(record.leave_type);
        typeStats.count++;
        typeStats.days += record.duration;
      });
      
      const leaveTypeStats = Array.from(leaveTypeMap.entries()).map(([leave_type, stats]) => ({
        leave_type,
        count: stats.count,
        days: stats.days
      }));
      
      // Calculate employee-specific stats
      const employeeMap = new Map();
      
      records.forEach(record => {
        if (!employeeMap.has(record.employee_id)) {
          employeeMap.set(record.employee_id, {
            employee_name: record.employee_name,
            count: 0,
            days: 0
          });
        }
        
        const empStats = employeeMap.get(record.employee_id);
        empStats.count++;
        empStats.days += record.duration;
      });
      
      const employeeStats = Array.from(employeeMap.values());
      
      // Add trend data (either real or fallback sample data)
      // In a real app, this would be calculated from historical data
      const trends = {
        leaves: totalRequests > 0 ? [5, 7, 12, 8, 10, totalRequests] : [5, 7, 12, 8, 10, 9],
        approvals: approvedCount > 0 ? [3, 5, 8, 6, 7, approvedCount] : [3, 5, 8, 6, 7, 8],
        rejections: rejectedCount > 0 ? [1, 2, 3, 1, 2, rejectedCount] : [1, 2, 3, 1, 2, 1]
      };
      
      return {
        records,
        stats: {
          totalRequests,
          approvedCount,
          rejectedCount,
          pendingCount,
          totalDays,
          approvedPercentage: totalRequests ? (approvedCount / totalRequests) * 100 : 0,
          rejectedPercentage: totalRequests ? (rejectedCount / totalRequests) * 100 : 0,
          pendingPercentage: totalRequests ? (pendingCount / totalRequests) * 100 : 0
        },
        leaveTypeStats,
        employeeStats,
        trends
      };
    },
    enabled: !!startDate && !!endDate
  });
}
