import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AttendanceStats } from "./types";

export const useActivityAttendance = (projectId: string) => {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    absent: 0,
    notRecorded: 0
  });

  const handleAttendanceChange = async (registrationId: string, status: 'present' | 'absent', activityId: string) => {
    try {
      console.log('Updating activity attendance for registration:', registrationId, 'with status:', status);
      
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('registration_id', registrationId)
        .eq('activity_id', activityId)
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
            activity_id: activityId,
            project_id: projectId,
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
      console.error('Error updating activity attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
      throw error;
    }
  };

  const handleGroupAttendance = async (status: 'present' | 'absent', activityId: string) => {
    try {
      console.log('Processing group attendance for activity:', activityId, 'with status:', status);
      
      const { data: registrations } = await supabase
        .from('registrations')
        .select('id')
        .eq('project_id', projectId);

      if (!registrations) {
        console.log('No registrations found');
        return;
      }

      console.log('Found registrations:', registrations);

      for (const registration of registrations) {
        const { data: existingRecord } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('registration_id', registration.id)
          .eq('activity_id', activityId)
          .maybeSingle();

        if (!existingRecord) {
          const { error: insertError } = await supabase
            .from('attendance_records')
            .insert({
              registration_id: registration.id,
              activity_id: activityId,
              project_id: projectId,
              status,
              check_in_time: status === 'present' ? new Date().toISOString() : null
            });

          if (insertError) {
            console.error('Error inserting attendance record:', insertError);
            continue;
          }
        }
      }

      const { data: updatedRecords } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('activity_id', activityId);

      if (updatedRecords) {
        const newStats = {
          total: registrations.length,
          present: updatedRecords.filter(r => r.status === 'present').length,
          absent: updatedRecords.filter(r => r.status === 'absent').length,
          notRecorded: registrations.length - updatedRecords.length
        };
        setAttendanceStats(newStats);
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