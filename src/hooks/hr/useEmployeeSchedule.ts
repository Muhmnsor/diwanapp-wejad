
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface WorkSchedule {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  work_hours_per_day: number;
  work_days_per_week: number;
}

export function useEmployeeSchedule() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all available work schedules
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["work-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_work_schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WorkSchedule[];
    },
  });

  // Get default schedule
  const defaultSchedule = schedules?.find(s => s.is_default) || null;

  // Assign schedule to employee
  const assignScheduleToEmployee = async (employeeId: string, scheduleId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("employees")
        .update({ schedule_id: scheduleId })
        .eq("id", employeeId);

      if (error) throw error;

      // Invalidate employee queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });

      toast.success("تم تعيين جدول العمل للموظف بنجاح");
      return { success: true };
    } catch (error) {
      console.error("Error assigning schedule to employee:", error);
      toast.error("حدث خطأ أثناء تعيين جدول العمل للموظف");
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Get employee schedule
  const getEmployeeSchedule = async (employeeId: string) => {
    try {
      // First get the employee's schedule_id
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("schedule_id")
        .eq("id", employeeId)
        .single();

      if (employeeError) throw employeeError;

      // If no schedule is assigned, return default
      if (!employee?.schedule_id) {
        return defaultSchedule;
      }

      // Get the schedule details
      const { data: schedule, error: scheduleError } = await supabase
        .from("hr_work_schedules")
        .select("*")
        .eq("id", employee.schedule_id)
        .single();

      if (scheduleError) throw scheduleError;

      return schedule as WorkSchedule;
    } catch (error) {
      console.error("Error getting employee schedule:", error);
      return defaultSchedule; // Fallback to default schedule
    }
  };

  // Get work days for a schedule
  const getWorkDays = async (scheduleId: string) => {
    try {
      const { data, error } = await supabase
        .from("hr_work_days")
        .select("*")
        .eq("schedule_id", scheduleId)
        .order("day_of_week", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting work days:", error);
      return [];
    }
  };

  return {
    schedules,
    defaultSchedule,
    isLoadingSchedules,
    isLoading,
    assignScheduleToEmployee,
    getEmployeeSchedule,
    getWorkDays,
  };
}
