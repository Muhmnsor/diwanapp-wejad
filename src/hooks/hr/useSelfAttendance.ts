import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "@/hooks/use-toast";

export function useSelfAttendance() {
  const [isLoading, setIsLoading] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState<{allowed: boolean; reason?: string}>({ allowed: true });
  const { user } = useAuthStore();

  // Check if current time is eligible for check-in based on schedule
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) return;
      
      try {
        // Get employee data with schedule
        const { data: employee, error } = await supabase
          .from('employees')
          .select(`
            id, 
            schedule_id,
            default_schedule_id
          `)
          .eq('user_id', user.id)
          .single();
          
        if (error || !employee) {
          setCanCheckIn({ allowed: false, reason: "لم يتم العثور على سجل الموظف" });
          return;
        }
        
        // If no schedule is assigned
        if (!employee.schedule_id && !employee.default_schedule_id) {
          setCanCheckIn({ allowed: false, reason: "لم يتم تعيين جدول عمل للموظف" });
          return;
        }
        
        const scheduleId = employee.schedule_id || employee.default_schedule_id;
        
        // Get the day of week (0 = Sunday, 1 = Monday, etc.)
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        // Check if today is a working day according to the schedule
        const { data: workDay, error: workDayError } = await supabase
          .from('hr_weekly_schedule')
          .select('is_working_day, work_start_time')
          .eq('schedule_type_id', scheduleId)
          .eq('day_of_week', dayOfWeek)
          .single();
          
        if (workDayError || !workDay) {
          setCanCheckIn({ allowed: false, reason: "لم يتم العثور على جدول العمل لهذا اليوم" });
          return;
        }
        
        // Check if it's a working day
        if (!workDay.is_working_day) {
          setCanCheckIn({ allowed: false, reason: "اليوم ليس يوم عمل حسب جدولك" });
          return;
        }
        
        // If no start time is set, allow check-in
        if (!workDay.work_start_time) {
          setCanCheckIn({ allowed: true });
          return;
        }
        
        // Check if we're within 30 minutes of the work start time
        const now = new Date();
        
        // Parse the work_start_time (format: "HH:MM:SS")
        const [hours, minutes] = workDay.work_start_time.split(':').map(Number);
        
        // Create start time Date object for today
        const workStartTime = new Date();
        workStartTime.setHours(hours, minutes, 0, 0);
        
        // Create a Date object for 30 minutes before start time
        const checkInWindowStart = new Date(workStartTime);
        checkInWindowStart.setMinutes(checkInWindowStart.getMinutes() - 30);
        
        // Check if current time is within the window
        if (now < checkInWindowStart) {
          const timeUntilWindow = Math.round((checkInWindowStart.getTime() - now.getTime()) / 60000);
          setCanCheckIn({ 
            allowed: false, 
            reason: `يمكنك تسجيل الحضور قبل ${timeUntilWindow} دقيقة من الآن` 
          });
        } else {
          setCanCheckIn({ allowed: true });
        }
        
      } catch (error) {
        console.error("Error checking attendance eligibility:", error);
        setCanCheckIn({ allowed: true }); // Default to allowed on error
      }
    };
    
    checkEligibility();
    
    // Check eligibility every minute
    const intervalId = setInterval(checkEligibility, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  // Get employee info for current user
  const getEmployeeInfo = async () => {
    if (!user) {
       console.log("User not authenticated in getEmployeeInfo");
       return { success: false, error: "يجب تسجيل الدخول أولاً" };
     }

    try {
      console.log("Fetching employee info for user:", user.id);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log("Error fetching employee data:", error);
        throw error;
      }
      
      if (!data) {
        console.log("No employee data found for user:", user.id);
        return { 
          success: false, 
          error: "لم يتم العثور على بيانات الموظف. يرجى التواصل مع إدارة الموارد البشرية." 
        };
      }

      console.log("Employee data found:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching employee info:', error);
      return { 
        success: false, 
        error: error.message || "حدث خطأ أثناء جلب بيانات الموظف" 
      };
    }
  };

  // Check in function - using the SECURITY DEFINER RPC function
  const checkIn = async () => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول لتسجيل الحضور",
        variant: "destructive",
      });
      return { success: false };
    }
    
    // Check if check-in is allowed
    if (!canCheckIn.allowed) {
      toast({
        title: "غير مسموح",
        description: canCheckIn.reason || "لا يمكن تسجيل الحضور في هذا الوقت",
        variant: "destructive",
      });
      return { success: false, error: canCheckIn.reason };
    }

    setIsLoading(true);
    try {
      // Call the record_employee_attendance RPC function with 'check_in' action
      const { data, error } = await supabase.rpc('record_employee_attendance', {
        p_action: 'check_in'
      });

      if (error) throw error;
      
      console.log("Check-in response:", data);
      
      if (!data.success) {
        // Handle specific error cases
        if (data.alreadyCheckedIn) {
          toast({
            title: "تنبيه",
            description: data.message || "لقد قمت بتسجيل الحضور مسبقًا اليوم",
            variant: "default",
          });
          return { success: false, alreadyCheckedIn: true, data: data.data };
        } else {
          throw new Error(data.message);
        }
      }

      toast({
        title: "تم بنجاح",
        description: "تم تسجيل الحضور بنجاح",
      });
      
      return { success: true, data: data.data };
    } catch (error: any) {
      console.error('Error checking in:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تسجيل الحضور",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Check out function - using the SECURITY DEFINER RPC function
  const checkOut = async () => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول لتسجيل الانصراف",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsLoading(true);
    try {
      // Call the record_employee_attendance RPC function with 'check_out' action
      const { data, error } = await supabase.rpc('record_employee_attendance', {
        p_action: 'check_out'
      });

      if (error) throw error;
      
      console.log("Check-out response:", data);
      
      if (!data.success) {
        // Handle specific error cases
        if (data.alreadyCheckedOut) {
          toast({
            title: "تنبيه",
            description: data.message || "لقد قمت بتسجيل الانصراف مسبقًا اليوم",
            variant: "default",
          });
          return { success: false, alreadyCheckedOut: true, data: data.data };
        } else {
          throw new Error(data.message);
        }
      }

      toast({
        title: "تم بنجاح",
        description: "تم تسجيل الانصراف بنجاح",
      });
      
      return { success: true, data: data.data };
    } catch (error: any) {
      console.error('Error checking out:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تسجيل الانصراف",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Get today's attendance for current employee - using the SECURITY DEFINER RPC function
  const getTodayAttendance = async () => {
    if (!user) {
      return { success: false, error: "يجب تسجيل الدخول أولاً" };
    }

    try {
      // Call the record_employee_attendance RPC function with 'get_today' action
      const { data, error } = await supabase.rpc('record_employee_attendance', {
        p_action: 'get_today'
      });

      if (error) throw error;
      
      console.log("Get today attendance response:", data);
      
      return { success: data.success, data: data.data };
    } catch (error: any) {
      console.error('Error fetching today attendance:', error);
      return { 
        success: false, 
        error: error.message || "حدث خطأ أثناء جلب بيانات الحضور" 
      };
    }
  };

  return {
    checkIn,
    checkOut,
    getTodayAttendance,
    getEmployeeInfo,
    isLoading,
    canCheckIn
  };
}
