
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

  // Check in function
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
      // Get current employee info
      const employeeResult = await getEmployeeInfo();
      if (!employeeResult.success) {
        toast({
          title: "خطأ",
          description: employeeResult.error,
          variant: "destructive",
        });
        return { success: false, error: employeeResult.error };
      }

      const employee = employeeResult.data;
      
      // Get server timestamp for today's date
      const { data: serverTime, error: timeError } = await supabase.rpc('get_server_timestamp');
      if (timeError) {
        console.error("Error getting server timestamp:", timeError);
        throw timeError;
      }
      
      console.log("Server timestamp for check-in:", serverTime);
      const today = new Date(serverTime).toISOString().split('T')[0];

      // Check if employee already checked in today
      const { data: existingRecord, error: checkError } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('attendance_date', today)
        .single();

      if (existingRecord && existingRecord.check_in) {
        toast({
          title: "تنبيه",
          description: "لقد قمت بتسجيل الحضور مسبقًا اليوم",
          variant: "default",
        });
        return { success: false, alreadyCheckedIn: true, record: existingRecord };
      }

      // Insert attendance record using server timestamp directly
      const { data, error } = await supabase
        .from('hr_attendance')
        .insert({
          employee_id: employee.id,
          attendance_date: today,
          check_in: serverTime,  // Using the server timestamp directly
          status: 'present',
          created_by: user.id
        })
        .select('*')
        .single();

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تسجيل الحضور بنجاح",
      });
      
      return { success: true, data };
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

  // Check out function
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
      // Get current employee info
      const employeeResult = await getEmployeeInfo();
      if (!employeeResult.success) {
        toast({
          title: "خطأ",
          description: employeeResult.error,
          variant: "destructive",
        });
        return { success: false, error: employeeResult.error };
      }

      const employee = employeeResult.data;
      
      // Get server timestamp
      const { data: serverTime, error: timeError } = await supabase.rpc('get_server_timestamp');
      if (timeError) {
        console.error("Error getting server timestamp:", timeError);
        throw timeError;
      }
      
      console.log("Server timestamp for check-out:", serverTime);
      const today = new Date(serverTime).toISOString().split('T')[0];

      // Check if employee checked in today
      const { data: existingRecord, error: checkError } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('attendance_date', today)
        .single();

      if (!existingRecord) {
        toast({
          title: "خطأ",
          description: "لم تقم بتسجيل الحضور اليوم بعد",
          variant: "destructive",
        });
        return { success: false, error: "لم تقم بتسجيل الحضور اليوم بعد" };
      }

      if (existingRecord.check_out) {
        toast({
          title: "تنبيه",
          description: "لقد قمت بتسجيل الانصراف مسبقًا اليوم",
          variant: "default",
        });
        return { success: false, alreadyCheckedOut: true, record: existingRecord };
      }

      // Update attendance record with server timestamp directly
      const { data, error } = await supabase
        .from('hr_attendance')
        .update({ check_out: serverTime })  // Using the server timestamp directly
        .eq('id', existingRecord.id)
        .select('*')
        .single();

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تسجيل الانصراف بنجاح",
      });
      
      return { success: true, data };
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

  // Get today's attendance for current employee
  const getTodayAttendance = async () => {
    if (!user) {
      return { success: false, error: "يجب تسجيل الدخول أولاً" };
    }

    try {
      // Get current employee info
      const employeeResult = await getEmployeeInfo();
      if (!employeeResult.success) {
        return { success: false, error: employeeResult.error };
      }

      const employee = employeeResult.data;
      
      // Get server timestamp for today's date
      const { data: serverTime, error: timeError } = await supabase.rpc('get_server_timestamp');
      if (timeError) {
        console.error("Error getting server timestamp:", timeError);
        throw timeError;
      }
      
      console.log("Server timestamp for getting today's attendance:", serverTime);
      const today = new Date(serverTime).toISOString().split('T')[0];

      // Get today's attendance record
      const { data, error } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('attendance_date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error code
        throw error;
      }

      return { success: true, data };
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
