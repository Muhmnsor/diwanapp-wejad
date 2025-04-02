
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Schedule {
  id: string;
  name: string;
  work_days_per_week: number;
  work_hours_per_day: number;
  is_default: boolean;
  description?: string;
}

export function useEmployeeSchedules() {
  return useQuery({
    queryKey: ["employee-schedules"],
    queryFn: async (): Promise<Schedule[]> => {
      console.log("Fetching employee schedules");
      
      const { data, error } = await supabase
        .from("hr_work_schedules")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching schedules:", error);
        throw error;
      }
      
      return data || [];
    },
  });
}
