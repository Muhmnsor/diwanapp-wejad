
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Schedule {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export function useEmployeeSchedules() {
  return useQuery({
    queryKey: ['employee-schedules'],
    queryFn: async (): Promise<Schedule[]> => {
      const { data, error } = await supabase
        .from('hr_work_schedule_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching employee schedules:", error);
        throw error;
      }
      
      return data || [];
    },
  });
}
