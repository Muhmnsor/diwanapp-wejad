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
      console.log("useEmployeeSchedule - Fetching work schedules");
      try {
        const { data, error } = await supabase
          .from("hr_work_schedules")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("useEmployeeSchedule - Error fetching schedules:", error);
          throw error;
        }
        
        console.log("useEmployeeSchedule - Schedules fetched:", data);
        return data as WorkSchedule[];
      } catch (err) {
        console.error("useEmployeeSchedule - Exception fetching schedules:", err);
        throw err;
      }
    },
  });

  // Get default schedule
  const defaultSchedule = schedules?.find(s => s.is_default) || null;
  console.log("useEmployeeSchedule - Default schedule:", defaultSchedule);

  // Assign schedule to employee
  const assignScheduleToEmployee = async (employeeId: string, scheduleId: string) => {
    setIsLoading(true);
    console.log(`useEmployeeSchedule - Assigning schedule ${scheduleId} to employee ${employeeId}`);
    
    try {
      const { error } = await supabase
        .from("employees")
        .update({ schedule_id: scheduleId })
        .eq("id", employeeId);

      if (error) {
        console.error("useEmployeeSchedule - Error assigning schedule:", error);
        throw error;
      }

      // Invalidate more specific queries to refresh data properly
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employee-schedule", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["work-days"] });

      toast.success("تم تعيين جدول العمل للموظف بنجاح");
      return { success: true };
    } catch (error) {
      console.error("useEmployeeSchedule - Exception assigning schedule to employee:", error);
      toast.error("حدث خطأ أثناء تعيين جدول العمل للموظف");
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Get employee schedule - improve with a more specific query key
  const getEmployeeSchedule = async (employeeId: string) => {
    console.log(`useEmployeeSchedule - Getting schedule for employee ${employeeId}`);
    
    try {
      // First get the employee's schedule_id
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("schedule_id")
        .eq("id", employeeId)
        .single();

      if (employeeError) {
        console.error("useEmployeeSchedule - Error getting employee:", employeeError);
        throw employeeError;
      }

      console.log("useEmployeeSchedule - Employee data:", employee);

      // If no schedule is assigned, return default
      if (!employee?.schedule_id) {
        console.log("useEmployeeSchedule - No schedule assigned, returning default");
        return defaultSchedule;
      }

      console.log(`useEmployeeSchedule - Getting schedule ${employee.schedule_id}`);
      
      // Get the schedule details
      const { data: schedule, error: scheduleError } = await supabase
        .from("hr_work_schedules")
        .select("*")
        .eq("id", employee.schedule_id)
        .single();

      if (scheduleError) {
        console.error("useEmployeeSchedule - Error getting schedule:", scheduleError);
        throw scheduleError;
      }

      console.log("useEmployeeSchedule - Got schedule:", schedule);
      return schedule as WorkSchedule;
    } catch (error) {
      console.error("useEmployeeSchedule - Error getting employee schedule:", error);
      return defaultSchedule; // Fallback to default schedule
    }
  };

  // Get work days for a schedule - enhance with caching
  const getWorkDays = async (scheduleId: string) => {
    console.log(`useEmployeeSchedule - Getting work days for schedule ${scheduleId}`);
    
    if (!scheduleId) {
      console.error("useEmployeeSchedule - No scheduleId provided to getWorkDays");
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from("hr_work_days")
        .select("*")
        .eq("schedule_id", scheduleId)
        .order("day_of_week", { ascending: true });

      if (error) {
        console.error("useEmployeeSchedule - Error getting work days:", error);
        throw error;
      }
      
      console.log(`useEmployeeSchedule - Work days for schedule ${scheduleId}:`, data);
      
      if (!data || data.length === 0) {
        console.warn(`useEmployeeSchedule - No work days found for schedule ${scheduleId}`);
      }
      
      return data;
    } catch (error) {
      console.error(`useEmployeeSchedule - Error getting work days for schedule ${scheduleId}:`, error);
      return [];
    }
  };

  // Add a new function to refresh schedule data
  const refreshScheduleData = (employeeId: string) => {
    console.log(`useEmployeeSchedule - Refreshing schedule data for employee ${employeeId}`);
    queryClient.invalidateQueries({ queryKey: ["employee-schedule", employeeId] });
    queryClient.invalidateQueries({ queryKey: ["work-days"] });
    queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
  };

  return {
    schedules,
    defaultSchedule,
    isLoadingSchedules,
    isLoading,
    assignScheduleToEmployee,
    getEmployeeSchedule,
    getWorkDays,
    refreshScheduleData, // New function to easily refresh data
  };
}
