
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WorkSchedule {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  work_hours_per_day: number;
  work_days_per_week: number;
}

export function useEmployeeSchedule() {
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["work-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_work_schedules")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching work schedules:", error);
        throw error;
      }

      return data as WorkSchedule[];
    },
  });

  // Find the default schedule
  const defaultSchedule = schedules?.find(schedule => schedule.is_default === true);

  const assignScheduleToEmployee = async (employeeId: string, scheduleId: string) => {
    try {
      // Validate inputs to prevent empty strings
      if (!employeeId) {
        console.error("Employee ID is required");
        return { success: false, error: { message: "Employee ID is required" } };
      }

      if (!scheduleId) {
        console.error("Schedule ID is required");
        return { success: false, error: { message: "Schedule ID is required" } };
      }

      const { error } = await supabase
        .from("employees")
        .update({ 
          schedule_id: scheduleId,
          updated_at: new Date().toISOString()
        })
        .eq("id", employeeId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error assigning schedule:", error);
      return { success: false, error };
    }
  };

  return {
    schedules: schedules || [],
    defaultSchedule,
    isLoadingSchedules,
    assignScheduleToEmployee,
  };
}
