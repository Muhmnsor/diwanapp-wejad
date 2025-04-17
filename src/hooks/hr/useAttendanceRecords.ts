
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAttendanceRecords() {
  return useQuery({
    queryKey: ['attendance-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_attendance')
        .select(`
          *,
          employees:employee_id (
            full_name,
            position,
            department,
            schedule_id
          ),
          schedules:employees(
            schedule:schedule_id(*)
          )
        `)
        .order('attendance_date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });
}
