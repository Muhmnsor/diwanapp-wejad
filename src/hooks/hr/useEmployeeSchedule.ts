
import { useState, useCallback, useMemo } from "react";
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

interface WorkDay {
  id: string;
  schedule_id: string;
  day_of_week: number;
  is_working_day: boolean;
  start_time: string | null;
  end_time: string | null;
}

// Create cache keys for better caching
const CACHE_KEYS = {
  SCHEDULES: "work-schedules",
  EMPLOYEE_SCHEDULE: "employee-schedule",
  WORK_DAYS: "work-days",
};

export function useEmployeeSchedule() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all available work schedules
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: [CACHE_KEYS.SCHEDULES],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("hr_work_schedules")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }
        
        return data as WorkSchedule[];
      } catch (err) {
        console.error("Error fetching schedules:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Memoize default schedule to prevent unnecessary re-renders
  const defaultSchedule = useMemo(() => {
    return schedules?.find(s => s.is_default) || null;
  }, [schedules]);

  // Assign schedule to employee - optimized with useMutation
  const { mutateAsync: assignScheduleToEmployee } = useMutation({
    mutationFn: async ({ employeeId, scheduleId }: { employeeId: string, scheduleId: string }) => {
      setIsLoading(true);
      
      try {
        const { error } = await supabase
          .from("employees")
          .update({ schedule_id: scheduleId })
          .eq("id", employeeId);

        if (error) {
          throw error;
        }

        return { success: true };
      } catch (error) {
        console.error("Error assigning schedule:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries on success
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", variables.employeeId] });
      queryClient.invalidateQueries({ 
        queryKey: [CACHE_KEYS.EMPLOYEE_SCHEDULE, variables.employeeId] 
      });
      
      toast.success("تم تعيين جدول العمل للموظف بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تعيين جدول العمل للموظف");
    }
  });

  // Get employee schedule with caching
  const getEmployeeSchedule = useCallback(async (employeeId: string) => {
    const cacheKey = [CACHE_KEYS.EMPLOYEE_SCHEDULE, employeeId];
    
    // Check if we have cached data
    const cachedData = queryClient.getQueryData(cacheKey) as WorkSchedule | undefined;
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // First get the employee's schedule_id
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("schedule_id")
        .eq("id", employeeId)
        .single();

      if (employeeError) {
        throw employeeError;
      }

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

      if (scheduleError) {
        throw scheduleError;
      }

      // Cache the result
      queryClient.setQueryData(cacheKey, schedule);
      
      return schedule as WorkSchedule;
    } catch (error) {
      console.error("Error getting employee schedule:", error);
      return defaultSchedule; // Fallback to default schedule
    }
  }, [defaultSchedule, queryClient]);

  // Get work days for a schedule with caching
  const getWorkDays = useCallback(async (scheduleId: string) => {
    if (!scheduleId) return [];
    
    const cacheKey = [CACHE_KEYS.WORK_DAYS, scheduleId];
    
    // Check if we have cached data
    const cachedData = queryClient.getQueryData(cacheKey) as WorkDay[] | undefined;
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const { data, error } = await supabase
        .from("hr_work_days")
        .select("*")
        .eq("schedule_id", scheduleId)
        .order("day_of_week", { ascending: true });

      if (error) {
        throw error;
      }
      
      // Cache the result
      queryClient.setQueryData(cacheKey, data);
      
      return data as WorkDay[];
    } catch (error) {
      console.error("Error getting work days:", error);
      return [];
    }
  }, [queryClient]);

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
