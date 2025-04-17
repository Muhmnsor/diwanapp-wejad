
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAttendanceRecords() {
  return useQuery({
    queryKey: ['attendance-records'],
    queryFn: async () => {
      console.log('Fetching attendance records...');
      
      const { data, error } = await supabase
        .from('hr_attendance')
        .select(`
          *,
          employees:employee_id (
            id,
            full_name,
            position,
            department,
            schedule_id
          )
        `)
        .order('attendance_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching attendance records:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} attendance records`);
      
      // Additional validation to ensure we don't have records with missing employee data
      const validRecords = data?.filter(record => 
        record.employee_id && record.employees && record.employees.full_name
      ) || [];
      
      console.log(`${validRecords.length} records have valid employee information`);
      
      return validRecords;
    },
    staleTime: 60 * 1000, // Cache data for 1 minute
  });
}
