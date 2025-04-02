import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HRStats {
  employeeCount: number;
  attendanceRate: number;
  activeLeaves: number;
  turnoverRate: number;
  employeeTrend: number[];
  attendanceTrend: number[];
  leavesTrend: number[];
  turnoverTrend: number[];
}

export function useHRStats() {
  return useQuery({
    queryKey: ["hr-stats"],
    queryFn: async (): Promise<HRStats> => {
      try {
        // Fetch employee count
        const { count: employeeCount, error: employeeError } = await supabase
          .from("hr_employees")
          .select("*", { count: "exact", head: true });

        if (employeeError) {
          console.error("Error fetching employee count:", employeeError);
          throw employeeError;
        }

        // Fetch attendance records for the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const { data: attendanceData, error: attendanceError } = await supabase
          .from("hr_attendance")
          .select("*")
          .gte("attendance_date", startOfMonth)
          .lte("attendance_date", endOfMonth);

        if (attendanceError) {
          console.error("Error fetching attendance data:", attendanceError);
          throw attendanceError;
        }

        const totalAttendanceRecords = attendanceData?.length || 0;
        const presentRecords = attendanceData?.filter(record => record.status === "present").length || 0;
        const attendanceRate = totalAttendanceRecords > 0 
          ? (presentRecords / totalAttendanceRecords) * 100 
          : 0;

        // Fetch active leaves
        const { data: leavesData, error: leavesError } = await supabase
          .from("hr_leaves")
          .select("*")
          .lte("start_date", new Date().toISOString())
          .gte("end_date", new Date().toISOString())
          .eq("status", "approved");

        if (leavesError) {
          console.error("Error fetching leaves data:", leavesError);
          throw leavesError;
        }

        const activeLeaves = leavesData?.length || 0;

        // For turnover rate, we would calculate based on employees who left divided by average headcount
        // This is a simplified calculation for demo purposes
        const { data: formerEmployees, error: turnoverError } = await supabase
          .from("hr_employees")
          .select("*")
          .eq("status", "inactive");

        if (turnoverError) {
          console.error("Error fetching turnover data:", turnoverError);
          throw turnoverError;
        }

        const formerEmployeeCount = formerEmployees?.length || 0;
        const turnoverRate = employeeCount > 0 
          ? (formerEmployeeCount / (employeeCount + formerEmployeeCount)) * 100 
          : 0;

        // Generate mock trend data (in a real app, this would come from the database)
        // Ensuring all trend arrays have at least one value to prevent issues with sparklines
        const employeeTrend = generateTrendData(employeeCount);
        const attendanceTrend = generateTrendData(attendanceRate);
        const leavesTrend = generateTrendData(activeLeaves);
        const turnoverTrend = generateTrendData(turnoverRate);

        return {
          employeeCount: employeeCount || 0,
          attendanceRate,
          activeLeaves,
          turnoverRate,
          employeeTrend,
          attendanceTrend,
          leavesTrend,
          turnoverTrend
        };
      } catch (error) {
        console.error("Error in HR stats query:", error);
        throw error;
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

// Helper function to generate trend data, always ensuring at least one data point
function generateTrendData(baseValue: number): number[] {
  // If we can't generate valid data, return an array with just the base value
  if (typeof baseValue !== 'number' || isNaN(baseValue)) {
    return [0]; // Fallback to zero if baseValue is invalid
  }
  
  // Otherwise generate some random data based on the base value
  const fluctuation = 0.15; // 15% fluctuation
  const points = 7; // Last 7 days/weeks/months
  
  const result = [];
  for (let i = 0; i < points; i++) {
    const randomFactor = 1 + (Math.random() * fluctuation * 2 - fluctuation);
    // Make sure we don't generate negative values for counts
    const value = Math.max(0, baseValue * randomFactor);
    result.push(typeof value === 'number' ? value : 0);
  }
  
  // Make sure array has at least one item
  if (result.length === 0) {
    result.push(baseValue);
  }
  
  return result;
}
