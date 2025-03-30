
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
            department
          )
        `)
        .order('attendance_date', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      return data || [];
    }
  });
}
