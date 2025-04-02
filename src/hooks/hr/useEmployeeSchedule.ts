
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
        toast.error("فشل في تحميل جداول العمل");
        return [];
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
        toast.error("حدث خطأ أثناء تعيين جدول العمل للموظف");
        throw error;
      }

      // Invalidate employee queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });

      toast.success("تم تعيين جدول العمل للموظف بنجاح");
      return { success: true };
    } catch (error) {
      console.error("useEmployeeSchedule - Exception assigning schedule to employee:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Get employee schedule
  const getEmployeeSchedule = async (employeeId: string) => {
    if (!employeeId) {
      console.warn("useEmployeeSchedule - Called getEmployeeSchedule with no employeeId");
      return defaultSchedule;
    }
    
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
        return defaultSchedule;
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
        return defaultSchedule;
      }

      console.log("useEmployeeSchedule - Got schedule:", schedule);
      return schedule as WorkSchedule;
    } catch (error) {
      console.error("useEmployeeSchedule - Error getting employee schedule:", error);
      return defaultSchedule; // Fallback to default schedule
    }
  };

  // Get work days for a schedule
  const getWorkDays = async (scheduleId: string) => {
    if (!scheduleId) {
      console.warn("useEmployeeSchedule - Called getWorkDays with no scheduleId");
      return [];
    }
    
    console.log(`useEmployeeSchedule - Getting work days for schedule ${scheduleId}`);
    
    try {
      const { data, error } = await supabase
        .from("hr_work_days")
        .select("*")
        .eq("schedule_id", scheduleId)
        .order("day_of_week", { ascending: true });

      if (error) {
        console.error("useEmployeeSchedule - Error getting work days:", error);
        toast.error("فشل في تحميل أيام العمل");
        return [];
      }
      
      console.log("useEmployeeSchedule - Work days:", data);
      return data || [];
    } catch (error) {
      console.error("useEmployeeSchedule - Error getting work days:", error);
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
