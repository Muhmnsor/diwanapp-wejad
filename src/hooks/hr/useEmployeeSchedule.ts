
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Schedule {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  work_hours_per_day: number;
  work_days_per_week: number;
}

export function useEmployeeSchedule() {
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['work-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_work_schedules')
        .select('*')
        .order('name');
        
      if (error) {
        console.error("Error fetching work schedules:", error);
        throw error;
      }
      
      return data as Schedule[];
    }
  });

  // Find default schedule
  const defaultSchedule = schedules?.find(schedule => schedule.is_default);

  // Function to assign schedule to employee
  const assignScheduleToEmployee = async (employeeId: string, scheduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({ schedule_id: scheduleId })
        .eq('id', employeeId);
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error("Error assigning schedule to employee:", error);
      return { success: false, error };
    }
  };

  return {
    schedules,
    defaultSchedule,
    isLoadingSchedules,
    assignScheduleToEmployee
  };
}
