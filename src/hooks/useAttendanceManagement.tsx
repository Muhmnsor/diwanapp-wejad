import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  notRecorded: number;
}

export const useAttendanceManagement = (eventId: string) => {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    absent: 0,
    notRecorded: 0
  });

  const handleAttendanceChange = async (registrationId: string, status: 'present' | 'absent') => {
    try {
      console.log('Updating attendance for registration:', registrationId, 'with status:', status);
      
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('registration_id', registrationId)
        .eq('event_id', eventId)
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
            event_id: eventId,
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

  const handleBarcodeScanned = async (code: string) => {
    try {
      const { data: registration } = await supabase
        .from('registrations')
        .select('*')
        .eq('registration_number', code)
        .eq('event_id', eventId)
        .maybeSingle();

      if (registration) {
        await handleAttendanceChange(registration.id, 'present');
        toast.success('تم تسجيل الحضور بنجاح');
      } else {
        toast.error('رقم التسجيل غير موجود');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast.error('حدث خطأ في قراءة الباركود');
    }
  };

  const handleGroupAttendance = async (status: 'present' | 'absent') => {
    try {
      const { data: registrations } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);

      if (registrations) {
        for (const registration of registrations) {
          await handleAttendanceChange(registration.id, status);
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
    handleBarcodeScanned,
    handleGroupAttendance
  };
};