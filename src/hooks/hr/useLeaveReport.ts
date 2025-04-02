
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface LeaveRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  duration: number;
  status: string;
  reason: string | null;
}

export interface LeaveReportData {
  records: LeaveRecord[];
  stats: {
    totalLeaves: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    approvedPercentage: number;
    pendingPercentage: number;
    rejectedPercentage: number;
    byLeaveType?: { 
      name: string; 
      count: number; 
      percentage: number;
    }[];
  };
  employeeStats?: {
    employee_name: string;
    annual: number;
    sick: number;
    other: number;
    total: number;
  }[];
  monthlyDistribution?: {
    month: string;
    count: number;
  }[];
}

export function useLeaveReport(startDate?: Date, endDate?: Date) {
  return useQuery<LeaveReportData, Error>({
    queryKey: ['leave-report', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      // Sample data for now - in a production app, this would fetch from the API
      const leaveTypeData = [
        { name: 'إجازة سنوية', count: 45 },
        { name: 'إجازة مرضية', count: 28 },
        { name: 'إجازة استثنائية', count: 12 },
        { name: 'إجازة أمومة', count: 8 },
        { name: 'إجازة زواج', count: 5 },
        { name: 'إجازة حداد', count: 2 }
      ];
      
      const totalLeaves = leaveTypeData.reduce((sum, item) => sum + item.count, 0);
      
      const byLeaveType = leaveTypeData.map(item => ({
        ...item,
        percentage: (item.count / totalLeaves) * 100
      }));
      
      const monthNames = [
        'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      
      const monthlyDistribution = monthNames.map((month, index) => ({
        month,
        count: Math.floor(Math.random() * 20) + 5 // Random data between 5-25
      }));
      
      return {
        records: [],
        stats: {
          totalLeaves,
          approvedCount: 88,
          pendingCount: 7,
          rejectedCount: 5,
          approvedPercentage: (88 / totalLeaves) * 100,
          pendingPercentage: (7 / totalLeaves) * 100,
          rejectedPercentage: (5 / totalLeaves) * 100,
          byLeaveType
        },
        employeeStats: [
          { employee_name: 'أحمد محمد', annual: 12, sick: 5, other: 2, total: 19 },
          { employee_name: 'سارة العلي', annual: 15, sick: 2, other: 1, total: 18 },
          { employee_name: 'محمد عبدالله', annual: 10, sick: 8, other: 3, total: 21 },
          { employee_name: 'فاطمة الأحمد', annual: 7, sick: 6, other: 4, total: 17 },
          { employee_name: 'عبدالله الخالد', annual: 14, sick: 3, other: 0, total: 17 }
        ],
        monthlyDistribution
      };
    },
    enabled: !!startDate && !!endDate
  });
}
