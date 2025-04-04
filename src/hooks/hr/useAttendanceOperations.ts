
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "@/hooks/use-toast";
import { useEmployeeSchedule } from "./useEmployeeSchedule";

export interface AttendanceRecord {
  id?: string;
  employee_id: string;
  attendance_date: string;
  check_in: string;
  check_out?: string | null;
  status: string;
  notes?: string | null;
  created_by?: string | null;
}

export function useAttendanceOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { getEmployeeSchedule, getWorkDays } = useEmployeeSchedule();

  // Helper function to convert date and time to timestamp
  const formatDateTimeToTimestamp = (date: string, time: string) => {
    if (!date || !time) return null;
    // Create a date object with the date and time
    const dateTimeString = `${date}T${time}:00`;
    return dateTimeString;
  };

  // Determine if an employee is late based on their schedule
  const checkIfLate = async (
    employeeId: string, 
    attendanceDate: string, 
    checkInTime: string
  ) => {
    try {
      // Get the employee's schedule
      const schedule = await getEmployeeSchedule(employeeId);
      if (!schedule) return false; // No schedule, can't determine if late
      
      // Get the work days for this schedule
      const workDays = await getWorkDays(schedule.id);
      if (!workDays || workDays.length === 0) return false;
      
      // Convert attendance date to day of week (0-6, where 0 is Sunday)
      const date = new Date(attendanceDate);
      const dayOfWeek = date.getDay();
      
      // Find the work day configuration for this day
      const workDay = workDays.find(d => d.day_of_week === dayOfWeek);
      
      // If not a working day or no start time, can't be late
      if (!workDay || !workDay.is_working_day || !workDay.start_time) {
        return false;
      }
      
      // Compare check-in time with scheduled start time
      const [startHour, startMinute] = workDay.start_time.split(':').map(Number);
      const [checkHour, checkMinute] = checkInTime.split(':').map(Number);
      
      // Calculate minutes from midnight for both times
      const startMinutes = startHour * 60 + startMinute;
      const checkMinutes = checkHour * 60 + checkMinute;
      
      // Allow 10 minutes grace period
      const graceMinutes = 10;
      
      // If check-in time is more than grace period after start time, employee is late
      return checkMinutes > (startMinutes + graceMinutes);
    } catch (error) {
      console.error('Error checking if employee is late:', error);
      return false;
    }
  };

  const addAttendanceRecord = async (record: AttendanceRecord) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول لإضافة سجل حضور",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsLoading(true);
    try {
      // If status is not explicitly set and we have check-in time, determine if late
      if (!record.status && record.check_in) {
        const isLate = await checkIfLate(
          record.employee_id,
          record.attendance_date,
          record.check_in
        );
        
        // Set status based on lateness
        record.status = isLate ? 'late' : 'present';
      }

      // Ensure created_by is explicitly set to the current user's ID
      // This is critical for our updated RLS policy that checks created_by
      const formattedRecord = {
        ...record,
        check_in: formatDateTimeToTimestamp(record.attendance_date, record.check_in),
        check_out: record.check_out ? formatDateTimeToTimestamp(record.attendance_date, record.check_out) : null,
        created_by: user.id,
        status: record.status || 'present' // Default to present if not set
      };

      // Check user HR permissions first
      const { data: hasAccess, error: permissionError } = await supabase
        .rpc('has_hr_access', { p_user_id: user.id });
        
      if (permissionError) {
        console.error('Error checking HR permissions:', permissionError);
        throw new Error('فشل التحقق من الصلاحيات');
      }
      
      if (!hasAccess) {
        throw new Error('ليس لديك صلاحية إضافة سجلات الحضور');
      }

      console.log('Inserting attendance record with data:', formattedRecord);
      
      const { data, error } = await supabase
        .from('hr_attendance')
        .insert(formattedRecord)
        .select('*')
        .single();

      if (error) {
        console.error('Error from Supabase:', error);
        throw error;
      }

      console.log('Successfully added attendance record:', data);
      
      toast({
        title: "تم بنجاح",
        description: "تم تسجيل الحضور بنجاح",
      });
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error adding attendance record:', error);
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

  return {
    addAttendanceRecord,
    isLoading,
    checkIfLate
  };
}
