// src/hooks/hr/useAttendanceOperations.ts
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSchedules } from "./useSchedules";

export function useAttendanceOperations() {
  const { schedules, defaultSchedule, isLoadingSchedules, getWorkDays, assignScheduleToEmployee } = useSchedules();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Add getEmployeeSchedule function that was missing
  const getEmployeeSchedule = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('schedule_id')
        .eq('id', employeeId)
        .single();
        
      if (error) throw error;
      
      return data?.schedule_id;
    } catch (error) {
      console.error("Error fetching employee schedule:", error);
      return null;
    }
  };

  const checkIn = async (employeeId: string) => {
    setIsCheckingIn(true);
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Check if already checked in today
      const { data: existingRecord, error: checkError } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('attendance_date', today)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingRecord) {
        return {
          success: false,
          error: 'تم تسجيل الحضور مسبقاً اليوم'
        };
      }
      
      // Get employee schedule
      const scheduleId = await getEmployeeSchedule(employeeId);
      const schedule = schedules.find(s => s.id === scheduleId) || defaultSchedule;
      
      // Check if today is a work day
      const workDays = await getWorkDays(schedule.id);
      const dayOfWeek = now.getDay();
      const isWorkDay = workDays.includes(dayOfWeek);
      
      if (!isWorkDay) {
        return {
          success: false,
          error: 'اليوم ليس يوم عمل وفقاً للجدول'
        };
      }
      
      // Calculate if late
      const startTime = schedule.start_time;
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const startDateTime = new Date(now);
      startDateTime.setHours(startHour, startMinute, 0);
      
      const isLate = now > startDateTime;
      
      // Record attendance
      const { data, error } = await supabase
        .from('hr_attendance')
        .insert({
          employee_id: employeeId,
          attendance_date: today,
          check_in: now.toISOString(),
          status: isLate ? 'late' : 'present',
          notes: isLate ? 'تأخر عن موعد الحضور' : ''
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        isLate
      };
    } catch (error) {
      console.error("Error checking in:", error);
      return {
        success: false,
        error: 'حدث خطأ أثناء تسجيل الحضور'
      };
    } finally {
      setIsCheckingIn(false);
    }
  };
  
  const checkOut = async (employeeId: string) => {
    setIsCheckingOut(true);
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Get today's attendance record
      const { data: existingRecord, error: checkError } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('attendance_date', today)
        .single();
      
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          return {
            success: false,
            error: 'لم يتم تسجيل الحضور اليوم'
          };
        }
        throw checkError;
      }
      
      if (existingRecord.check_out) {
        return {
          success: false,
          error: 'تم تسجيل الانصراف مسبقاً'
        };
      }
      
      // Get employee schedule
      const scheduleId = await getEmployeeSchedule(employeeId);
      const schedule = schedules.find(s => s.id === scheduleId) || defaultSchedule;
      
      // Calculate if early departure
      const endTime = schedule.end_time;
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const endDateTime = new Date(now);
      endDateTime.setHours(endHour, endMinute, 0);
      
      const isEarlyDeparture = now < endDateTime;
      
      // Update attendance record
      const { data, error } = await supabase
        .from('hr_attendance')
        .update({
          check_out: now.toISOString(),
          notes: isEarlyDeparture 
            ? (existingRecord.notes ? existingRecord.notes + ' | انصراف مبكر' : 'انصراف مبكر')
            : existingRecord.notes
        })
        .eq('id', existingRecord.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        isEarlyDeparture
      };
    } catch (error) {
      console.error("Error checking out:", error);
      return {
        success: false,
        error: 'حدث خطأ أثناء تسجيل الانصراف'
      };
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  const markAbsent = async (employeeId: string, date: string, reason: string = '') => {
    setIsSubmitting(true);
    try {
      // Check if already has attendance record for this date
      const { data: existingRecord, error: checkError } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('attendance_date', date)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('hr_attendance')
          .update({
            status: 'absent',
            notes: reason
          })
          .eq('id', existingRecord.id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          success: true,
          data
        };
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('hr_attendance')
          .insert({
            employee_id: employeeId,
            attendance_date: date,
            status: 'absent',
            notes: reason
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          success: true,
          data
        };
      }
    } catch (error) {
      console.error("Error marking absent:", error);
      return {
        success: false,
        error: 'حدث خطأ أثناء تسجيل الغياب'
      };
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateAttendanceRecord = async (recordId: string, updates: any) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('hr_attendance')
        .update(updates)
        .eq('id', recordId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("Error updating attendance record:", error);
      return {
        success: false,
        error: 'حدث خطأ أثناء تحديث سجل الحضور'
      };
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const deleteAttendanceRecord = async (recordId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('hr_attendance')
        .delete()
        .eq('id', recordId);
      
      if (error) throw error;
      
      return {
        success: true
      };
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      return {
        success: false,
        error: 'حدث خطأ أثناء حذف سجل الحضور'
      };
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    checkIn,
    checkOut,
    markAbsent,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    isSubmitting,
    isCheckingIn,
    isCheckingOut,
    schedules,
    defaultSchedule,
    isLoadingSchedules,
    getWorkDays,
    assignScheduleToEmployee,
    getEmployeeSchedule
  };
}
