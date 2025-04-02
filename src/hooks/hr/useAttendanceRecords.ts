
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

interface AttendanceRecord {
  id: string;
  employee_id: string;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string | null;
  employees?: {
    full_name: string;
    position?: string;
  } | null;
}

export function useAttendanceRecords(
  dateRange?: DateRange | undefined,
  employeeId?: string
) {
  return useQuery<AttendanceRecord[], Error>({
    queryKey: ['attendance-records', dateRange?.from?.toISOString(), dateRange?.to?.toISOString(), employeeId],
    queryFn: async () => {
      console.log("Fetching attendance records with filters:", {
        dateRange,
        employeeId
      });
      
      let query = supabase
        .from("hr_attendance")
        .select(`
          *,
          employees (
            full_name,
            position
          )
        `)
        .order("attendance_date", { ascending: false });
      
      // Apply date range filter if provided
      if (dateRange?.from) {
        query = query.gte('attendance_date', dateRange.from.toISOString().split('T')[0]);
      }
      
      if (dateRange?.to) {
        query = query.lte('attendance_date', dateRange.to.toISOString().split('T')[0]);
      }
      
      // Apply employee filter if provided
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching attendance records:", error);
        throw error;
      }
      
      return data || [];
    }
  });
}
