
import { useState, useCallback } from "react";
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
  const { data: schedules, isLoading: isLoadingSchedules, error: schedulesError } = useQuery({
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
        
        console.log(`useEmployeeSchedule - Schedules fetched: ${data?.length || 0}`);
        return data as WorkSchedule[];
      } catch (err) {
        console.error("useEmployeeSchedule - Exception fetching schedules:", err);
        toast.error("فشل في تحميل جداول العمل");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Get default schedule
  const defaultSchedule = schedules?.find(s => s.is_default) || null;
  
  // Log error if no default schedule found
  if (schedules?.length && !defaultSchedule) {
    console.warn("useEmployeeSchedule - No default schedule found among schedules");
  }

  // Assign schedule to employee
  const assignScheduleToEmployee = async (employeeId: string, scheduleId: string) => {
    if (!employeeId || !scheduleId) {
      console.error("useEmployeeSchedule - Invalid employee or schedule ID for assignment");
      toast.error("معرفات غير صالحة لتعيين الجدول");
      return { success: false, error: "Invalid IDs" };
    }
    
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

  // Get employee schedule (with better error handling)
  const getEmployeeSchedule = useCallback(async (employeeId: string) => {
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
        if (employeeError.code !== 'PGRST116') { // Not found error is somewhat expected
          toast.error("خطأ في تحميل بيانات الموظف");
        }
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
        toast.error("خطأ في تحميل بيانات جدول العمل");
        return defaultSchedule;
      }

      console.log("useEmployeeSchedule - Got schedule:", schedule);
      return schedule as WorkSchedule;
    } catch (error) {
      console.error("useEmployeeSchedule - Error getting employee schedule:", error);
      toast.error("خطأ في تحميل جدول العمل");
      return defaultSchedule; // Fallback to default schedule
    }
  }, [defaultSchedule]);

  // Get work days for a schedule (with improved error handling)
  const getWorkDays = useCallback(async (scheduleId: string) => {
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
      
      console.log(`useEmployeeSchedule - ${data?.length || 0} work days loaded`);
      return data || [];
    } catch (error) {
      console.error("useEmployeeSchedule - Error getting work days:", error);
      toast.error("خطأ في تحميل أيام العمل");
      return [];
    }
  }, []);

  return {
    schedules,
    defaultSchedule,
    isLoadingSchedules,
    schedulesError,
    isLoading,
    assignScheduleToEmployee,
    getEmployeeSchedule,
    getWorkDays,
  };
}
