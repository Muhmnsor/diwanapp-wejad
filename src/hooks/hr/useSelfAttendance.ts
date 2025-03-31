
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "@/hooks/use-toast";

export function useSelfAttendance() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

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
    isLoading
  };
}

