import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAttendanceManagement = (
  projectId?: string,
  eventId?: string,
  activityId?: string | null
) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    notRecorded: 0,
  });

  const fetchRegistrations = useCallback(async () => {
    try {
      console.log("Fetching registrations with params:", { projectId, eventId, activityId });
      
      // Determine which registrations to fetch based on context
      const { data: regs, error: regsError } = await supabase
        .from("registrations")
        .select(`
          *,
          attendance_records!left (
            status,
            check_in_time
          )
        `)
        .eq(projectId ? "project_id" : "event_id", projectId || eventId);

      if (regsError) throw regsError;

      // Process registrations and their attendance records
      const processedRegistrations = regs.map((reg: any) => {
        let attendanceRecord = null;
        
        if (reg.attendance_records && reg.attendance_records.length > 0) {
          if (activityId) {
            // For activities, find the specific activity attendance record
            attendanceRecord = reg.attendance_records.find((record: any) => 
              record.activity_id === activityId
            );
          } else {
            // For single events, use the first (and should be only) record
            attendanceRecord = reg.attendance_records[0];
          }
        }

        return {
          ...reg,
          attendance_status: attendanceRecord?.status || null,
          check_in_time: attendanceRecord?.check_in_time || null,
        };
      });

      setRegistrations(processedRegistrations);

      // Calculate stats
      const total = processedRegistrations.length;
      const present = processedRegistrations.filter(r => r.attendance_status === 'present').length;
      const absent = processedRegistrations.filter(r => r.attendance_status === 'absent').length;
      const notRecorded = total - (present + absent);

      setStats({
        total,
        present,
        absent,
        notRecorded,
      });

    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("حدث خطأ في جلب التسجيلات");
    }
  }, [projectId, eventId, activityId]);

  const handleAttendanceChange = async (registrationId: string, status: 'present' | 'absent') => {
    try {
      const timestamp = new Date().toISOString();
      
      // Check if there's an existing record
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('registration_id', registrationId)
        .eq(activityId ? 'activity_id' : 'event_id', activityId || eventId)
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('attendance_records')
          .update({
            status,
            check_in_time: timestamp,
          })
          .eq('id', existingRecord.id);

        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('attendance_records')
          .insert({
            registration_id: registrationId,
            status,
            check_in_time: timestamp,
            ...(activityId ? { activity_id: activityId } : { event_id: eventId }),
            ...(projectId ? { project_id: projectId } : {}),
          });

        if (insertError) throw insertError;
      }

      toast.success("تم تحديث الحضور بنجاح");
      await fetchRegistrations();
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("حدث خطأ في تحديث الحضور");
    }
  };

  const handleBarcodeScanned = async (code: string) => {
    try {
      const { data: registration, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('registration_number', code)
        .eq(projectId ? 'project_id' : 'event_id', projectId || eventId)
        .single();

      if (error) throw error;

      if (registration) {
        await handleAttendanceChange(registration.id, 'present');
        toast.success("تم تسجيل الحضور بنجاح");
      } else {
        toast.error("لم يتم العثور على رقم التسجيل");
      }
    } catch (error) {
      console.error("Error processing barcode:", error);
      toast.error("حدث خطأ في معالجة الباركود");
    }
  };

  const handleGroupAttendance = async (status: 'present' | 'absent') => {
    try {
      const timestamp = new Date().toISOString();
      
      // Get all registrations without attendance records
      const unrecordedRegistrations = registrations.filter(r => !r.attendance_status);
      
      for (const reg of unrecordedRegistrations) {
        const { error: insertError } = await supabase
          .from('attendance_records')
          .insert({
            registration_id: reg.id,
            status,
            check_in_time: timestamp,
            ...(activityId ? { activity_id: activityId } : { event_id: eventId }),
            ...(projectId ? { project_id: projectId } : {}),
          });

        if (insertError) throw insertError;
      }

      toast.success("تم تحديث الحضور الجماعي بنجاح");
      await fetchRegistrations();
    } catch (error) {
      console.error("Error in group attendance:", error);
      toast.error("حدث خطأ في تحديث الحضور الجماعي");
    }
  };

  return {
    registrations,
    stats,
    handleBarcodeScanned,
    handleGroupAttendance,
    handleAttendanceChange,
    fetchRegistrations,
  };
};