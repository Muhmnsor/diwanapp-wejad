
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "@/hooks/use-toast";

export function useSelfAttendance() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  // Helper function to convert date and time to timestamp
  const formatDateTimeToTimestamp = (date: string, time: string) => {
    if (!date || !time) return null;
    // Create a date object with the date and time
    const dateTimeString = `${date}T${time}:00`;
    return dateTimeString;
  };

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
      .maybeSingle();

    if (error) {
      console.error("Error fetching employee data:", error);
      return { 
        success: false, 
        error: error.message || "حدث خطأ أثناء جلب بيانات الموظف" 
      };
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
      
      // Get current date and time
      const today = new Date();
      const currentDate = today.toISOString().split('T')[0];
      const currentTime = today.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Check if employee already checked in today
      const { data: existingRecord, error: checkError } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('attendance_date', currentDate)
        .single();

      if (existingRecord && existingRecord.check_in) {
        toast({
          title: "تنبيه",
          description: "لقد قمت بتسجيل الحضور مسبقًا اليوم",
          variant: "default",
        });
        return { success: false, alreadyCheckedIn: true, record: existingRecord };
      }

      const attendanceRecord = {
        employee_id: employee.id,
        attendance_date: currentDate,
        check_in: currentTime,
        status: 'present',
        created_by: user.id
      };

      // Format timestamp
      const formattedRecord = {
        ...attendanceRecord,
        check_in: formatDateTimeToTimestamp(currentDate, currentTime),
      };

      // Insert attendance record
      const { data, error } = await supabase
        .from('hr_attendance')
        .insert(formattedRecord)
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
      
      // Get current date and time
      const today = new Date();
      const currentDate = today.toISOString().split('T')[0];
      const currentTime = today.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Check if employee checked in today
      const { data: existingRecord, error: checkError } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('attendance_date', currentDate)
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

      // Format timestamp
      const checkOut = formatDateTimeToTimestamp(currentDate, currentTime);

      // Update attendance record with check out time
      const { data, error } = await supabase
        .from('hr_attendance')
        .update({ check_out: checkOut })
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
      
      // Get current date
      const today = new Date().toISOString().split('T')[0];

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
