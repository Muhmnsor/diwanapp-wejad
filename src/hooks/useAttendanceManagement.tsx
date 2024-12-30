import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAttendanceManagement = (projectId: string, selectedActivity: string | null) => {
  const handleAttendanceChange = async (registrationId: string, status: 'present' | 'absent') => {
    if (!selectedActivity) {
      toast.error("الرجاء اختيار النشاط أولاً");
      return;
    }

    try {
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('registration_id', registrationId)
        .eq('activity_id', selectedActivity)
        .maybeSingle();

      if (existingRecord) {
        await supabase
          .from('attendance_records')
          .update({
            status,
            check_in_time: status === 'present' ? new Date().toISOString() : null
          })
          .eq('id', existingRecord.id);
      } else {
        await supabase
          .from('attendance_records')
          .insert({
            registration_id: registrationId,
            activity_id: selectedActivity,
            project_id: projectId,
            status,
            check_in_time: status === 'present' ? new Date().toISOString() : null
          });
      }

      toast.success(status === 'present' ? 'تم تسجيل الحضور' : 'تم تسجيل الغياب');
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
    }
  };

  const handleGroupAttendance = async (registrations: any[], status: 'present' | 'absent') => {
    if (!selectedActivity) {
      toast.error("الرجاء اختيار النشاط أولاً");
      return;
    }

    try {
      console.log("Starting group attendance for activity:", selectedActivity);
      console.log("Number of registrations:", registrations.length);
      
      for (const registration of registrations) {
        const { data: existingRecord } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('registration_id', registration.id)
          .eq('activity_id', selectedActivity)
          .maybeSingle();

        if (!existingRecord) {
          await supabase
            .from('attendance_records')
            .insert({
              registration_id: registration.id,
              activity_id: selectedActivity,
              project_id: projectId,
              status,
              check_in_time: status === 'present' ? new Date().toISOString() : null
            });
          console.log(`Created attendance record for registration ${registration.id}`);
        }
      }

      toast.success(status === 'present' ? 'تم تسجيل حضور الجميع' : 'تم تسجيل غياب الجميع');
    } catch (error) {
      console.error('Error in group attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور الجماعي');
    }
  };

  return {
    handleAttendanceChange,
    handleGroupAttendance
  };
};