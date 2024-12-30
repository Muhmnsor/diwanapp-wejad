import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AttendanceStats } from "./types";

export const useEventAttendance = (eventId: string) => {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    absent: 0,
    notRecorded: 0
  });

  const handleAttendanceChange = async (registrationId: string, status: 'present' | 'absent') => {
    try {
      console.log('Updating event attendance for registration:', registrationId, 'with status:', status);
      
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('registration_id', registrationId)
        .eq('event_id', eventId)
        .maybeSingle();

      if (existingRecord) {
        const { error: updateError } = await supabase
          .from('attendance_records')
          .update({
            status,
            check_in_time: status === 'present' ? new Date().toISOString() : null
          })
          .eq('id', existingRecord.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('attendance_records')
          .insert({
            registration_id: registrationId,
            event_id: eventId,
            status,
            check_in_time: status === 'present' ? new Date().toISOString() : null
          });

        if (insertError) throw insertError;
      }

      setAttendanceStats(prev => {
        const newStats = { ...prev };
        if (existingRecord) {
          if (existingRecord.status === 'present') newStats.present--;
          if (existingRecord.status === 'absent') newStats.absent--;
        } else {
          newStats.notRecorded--;
        }
        if (status === 'present') newStats.present++;
        if (status === 'absent') newStats.absent++;
        return newStats;
      });

    } catch (error) {
      console.error('Error updating event attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
      throw error;
    }
  };

  const handleGroupAttendance = async (status: 'present' | 'absent') => {
    try {
      console.log('Processing group attendance for event:', eventId, 'with status:', status);
      
      const { data: registrations } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', eventId);

      if (!registrations) {
        console.log('No registrations found');
        return;
      }

      console.log('Found registrations:', registrations);

      for (const registration of registrations) {
        await handleAttendanceChange(registration.id, status);
      }

    } catch (error) {
      console.error('Error in group attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور الجماعي');
      throw error;
    }
  };

  return {
    attendanceStats,
    setAttendanceStats,
    handleAttendanceChange,
    handleGroupAttendance
  };
};