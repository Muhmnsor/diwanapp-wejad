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
      console.log('Updating attendance for registration:', registrationId, 'with status:', status, 'for activity:', activityId);
      
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('registration_id', registrationId)
        .eq(activityId ? 'activity_id' : 'event_id', activityId || projectId)
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
            [activityId ? 'activity_id' : 'event_id']: activityId || projectId,
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

  const handleGroupAttendance = async (status: 'present' | 'absent', activityId?: string) => {
    try {
      console.log('Processing group attendance with status:', status, 'for activity:', activityId);
      
      const { data: registrations } = await supabase
        .from('registrations')
        .select('*')
        .eq('project_id', projectId);

      if (registrations) {
        for (const registration of registrations) {
          // Check if attendance record already exists
          const { data: existingRecord } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('registration_id', registration.id)
            .eq(activityId ? 'activity_id' : 'event_id', activityId || projectId)
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
                registration_id: registration.id,
                [activityId ? 'activity_id' : 'event_id']: activityId || projectId,
                project_id: projectId,
                status,
                check_in_time: status === 'present' ? new Date().toISOString() : null
              });
          }
        }
        toast.success(status === 'present' ? 'تم تسجيل حضور الجميع' : 'تم تسجيل غياب الجميع');
      }
    } catch (error) {
      console.error('Error in group attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور الجماعي');
    }
  };

  return {
    attendanceStats,
    setAttendanceStats,
    handleAttendanceChange,
    handleGroupAttendance
  };
};