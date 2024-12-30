import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAttendanceManagement = (projectId: string, selectedActivityId: string | null) => {
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    notRecorded: 0
  });

  const { data: registrations = [], isLoading, refetch } = useQuery({
    queryKey: ['registrations-preparation', projectId, selectedActivityId],
    queryFn: async () => {
      console.log('Fetching registrations for project:', projectId, 'and activity:', selectedActivityId);
      
      if (!selectedActivityId) return [];

      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          attendance_records!inner(*)
        `)
        .eq('project_id', projectId)
        .eq('attendance_records.activity_id', selectedActivityId);

      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }

      // Get all registrations for this project
      const { data: allRegistrations, error: allRegError } = await supabase
        .from('registrations')
        .select('*')
        .eq('project_id', projectId);

      if (allRegError) throw allRegError;

      // Map attendance records to all registrations
      const mappedRegistrations = allRegistrations.map(reg => {
        const matchingReg = data?.find(d => d.id === reg.id);
        return {
          ...reg,
          attendance_records: matchingReg ? matchingReg.attendance_records : []
        };
      });

      console.log('Mapped registrations:', mappedRegistrations);
      return mappedRegistrations || [];
    },
    enabled: !!selectedActivityId
  });

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
      
      refetch();
    } catch (error) {
      console.error('Error recording attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
    }
  };

  const handleBarcodeScanned = async (code: string) => {
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

  const handleGroupAttendance = async (status: 'present' | 'absent') => {
    if (!selectedActivityId) {
      toast.error('الرجاء اختيار نشاط أولاً');
      return;
    }

    console.log('Recording group attendance:', status);
    try {
      // Get all registrations that need updating
      const registrationsToUpdate = registrations.filter(registration => {
        // If no attendance records, include for update
        if (!registration.attendance_records?.length) {
          return true;
        }
        // If has attendance records but different status, include for update
        const lastRecord = registration.attendance_records[registration.attendance_records.length - 1];
        return lastRecord.status !== status;
      });

      if (registrationsToUpdate.length === 0) {
        toast.info('لا يوجد مشاركين بحاجة لتحديث الحضور');
        return;
      }

      console.log('Registrations to update:', registrationsToUpdate);

      // Process each registration sequentially
      for (const registration of registrationsToUpdate) {
        await handleAttendance(registration.id, status);
      }
      
      toast.success(
        status === 'present' 
          ? 'تم تسجيل حضور جميع المشاركين' 
          : 'تم تسجيل غياب جميع المشاركين'
      );

      // Refresh the data
      refetch();
    } catch (error) {
      console.error('Error in group attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور الجماعي');
    }
  };

  return {
    registrations,
    isLoading,
    attendanceStats,
    setAttendanceStats,
    handleAttendance,
    handleBarcodeScanned,
    handleGroupAttendance
  };
};