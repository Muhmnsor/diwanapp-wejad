import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAttendanceActions = (projectId: string, selectedActivityId: string | null) => {
  const handleAttendance = async (registrationId: string, status: 'present' | 'absent') => {
    try {
      if (!selectedActivityId) {
        toast.error('الرجاء اختيار نشاط أولاً');
        return;
      }

      console.log('Recording attendance:', { registrationId, status, selectedActivityId });
      
      const { data: existingRecord, error: fetchError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('registration_id', registrationId)
        .eq('activity_id', selectedActivityId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing attendance:', fetchError);
        throw fetchError;
      }

      let result;
      
      if (existingRecord) {
        const { data, error } = await supabase
          .from('attendance_records')
          .update({
            status,
            check_in_time: status === 'present' ? new Date().toISOString() : null,
          })
          .eq('id', existingRecord.id)
          .select();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('attendance_records')
          .insert({
            registration_id: registrationId,
            project_id: projectId,
            activity_id: selectedActivityId,
            status,
            check_in_time: status === 'present' ? new Date().toISOString() : null,
          })
          .select();

        if (error) throw error;
        result = data;
      }

      console.log('Attendance recorded:', result);
      toast.success(status === 'present' ? 'تم تسجيل الحضور' : 'تم تسجيل الغياب');
      
      return result;
    } catch (error) {
      console.error('Error recording attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
    }
  };

  const handleBarcodeScanned = async (code: string, registrations: any[]) => {
    if (!selectedActivityId) {
      toast.error('الرجاء اختيار نشاط أولاً');
      return;
    }

    console.log('Scanning barcode:', code);
    const registration = registrations.find(r => r.registration_number === code);
    
    if (registration) {
      await handleAttendance(registration.id, 'present');
      toast.success('تم تسجيل الحضور بنجاح');
    } else {
      toast.error('لم يتم العثور على رقم التسجيل');
    }
  };

  const handleGroupAttendance = async (status: 'present' | 'absent', registrations: any[]) => {
    if (!selectedActivityId) {
      toast.error('الرجاء اختيار نشاط أولاً');
      return;
    }

    console.log('Recording group attendance:', status);
    try {
      const registrationsToUpdate = registrations.filter(registration => {
        if (!registration.attendance_records?.length) {
          return true;
        }
        const lastRecord = registration.attendance_records[registration.attendance_records.length - 1];
        return lastRecord.status !== status;
      });

      if (registrationsToUpdate.length === 0) {
        toast.info('لا يوجد مشاركين بحاجة لتحديث الحضور');
        return;
      }

      console.log('Registrations to update:', registrationsToUpdate);

      for (const registration of registrationsToUpdate) {
        await handleAttendance(registration.id, status);
      }
      
      toast.success(
        status === 'present' 
          ? 'تم تسجيل حضور جميع المشاركين' 
          : 'تم تسجيل غياب جميع المشاركين'
      );
    } catch (error) {
      console.error('Error in group attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور الجماعي');
    }
  };

  return {
    handleAttendance,
    handleBarcodeScanned,
    handleGroupAttendance
  };
};