
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "@/hooks/use-toast";

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
      const { data, error } = await supabase
        .from('hr_attendance')
        .insert({
          ...record,
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
    isLoading
  };
}
