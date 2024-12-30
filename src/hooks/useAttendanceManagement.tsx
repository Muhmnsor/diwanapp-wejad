import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  notRecorded: number;
}

export const useAttendanceManagement = (projectId: string) => {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    absent: 0,
    notRecorded: 0
  });

  const handleAttendanceChange = async (registrationId: string, status: 'present' | 'absent', activityId?: string) => {
    try {
      console.log('Updating attendance for registration:', registrationId, 'with status:', status);
      
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('registration_id', registrationId)
        .eq(activityId ? 'activity_id' : 'event_id', activityId || projectId)
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
            [activityId ? 'activity_id' : 'event_id']: activityId || projectId,
            project_id: activityId ? projectId : null,
            status,
            check_in_time: status === 'present' ? new Date().toISOString() : null
          });

        if (insertError) throw insertError;
      }

      // Update local stats immediately
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
      console.error('Error updating attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
      throw error;
    }
  };

  const handleGroupAttendance = async (status: 'present' | 'absent', activityId?: string) => {
    try {
      console.log('Processing group attendance with status:', status, 'for activity:', activityId);
      
      // Get all registrations that don't have attendance records yet
      const { data: registrations } = await supabase
        .from('registrations')
        .select('id')
        .eq(activityId ? 'project_id' : 'event_id', activityId ? projectId : projectId);

      if (!registrations) {
        console.log('No registrations found');
        return;
      }

      console.log('Found registrations:', registrations);

      // Process each registration
      for (const registration of registrations) {
        const { data: existingRecord } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('registration_id', registration.id)
          .eq(activityId ? 'activity_id' : 'event_id', activityId || projectId)
          .maybeSingle();

        if (!existingRecord) {
          const { error: insertError } = await supabase
            .from('attendance_records')
            .insert({
              registration_id: registration.id,
              [activityId ? 'activity_id' : 'event_id']: activityId || projectId,
              project_id: activityId ? projectId : null,
              status,
              check_in_time: status === 'present' ? new Date().toISOString() : null
            });

          if (insertError) {
            console.error('Error inserting attendance record:', insertError);
            continue;
          }
        }
      }

      // Update local stats immediately after group operation
      const { data: updatedRecords } = await supabase
        .from('attendance_records')
        .select('status')
        .eq(activityId ? 'activity_id' : 'event_id', activityId || projectId);

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