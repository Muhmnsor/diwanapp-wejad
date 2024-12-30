import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AttendanceStats } from "./preparation/AttendanceStats";
import { AttendanceControls } from "./preparation/AttendanceControls";
import { AttendanceTable } from "./preparation/AttendanceTable";

interface DashboardPreparationProps {
  eventId: string;
}

export const DashboardPreparation = ({ eventId }: DashboardPreparationProps) => {
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    notRecorded: 0
  });

  const { data: registrations = [], isLoading, refetch } = useQuery({
    queryKey: ['registrations-preparation', eventId],
    queryFn: async () => {
      console.log('Fetching registrations for preparation:', eventId);
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          attendance_records(*)
        `)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }

      console.log('Fetched registrations:', data);
      return data || [];
    },
  });

  useEffect(() => {
    // Calculate attendance statistics
    const stats = {
      total: registrations.length,
      present: 0,
      absent: 0,
      notRecorded: 0
    };

    registrations.forEach(registration => {
      const attendanceRecord = registration.attendance_records?.[0];
      if (!attendanceRecord) {
        stats.notRecorded++;
      } else if (attendanceRecord.status === 'present') {
        stats.present++;
      } else if (attendanceRecord.status === 'absent') {
        stats.absent++;
      }
    });

    setAttendanceStats(stats);
  }, [registrations]);

  const handleAttendance = async (registrationId: string, status: 'present' | 'absent') => {
    try {
      console.log('Recording attendance:', { registrationId, status });
      
      // First check if an attendance record already exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('registration_id', registrationId)
        .eq('event_id', eventId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing attendance:', fetchError);
        throw fetchError;
      }

      let result;
      
      if (existingRecord) {
        // Update existing record
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
        // Create new record
        const { data, error } = await supabase
          .from('attendance_records')
          .insert({
            registration_id: registrationId,
            event_id: eventId,
            status,
            check_in_time: status === 'present' ? new Date().toISOString() : null,
          })
          .select();

        if (error) throw error;
        result = data;
      }

      console.log('Attendance recorded:', result);
      toast.success(status === 'present' ? 'تم تسجيل الحضور' : 'تم تسجيل الغياب');
      
      // Refresh the data
      refetch();
    } catch (error) {
      console.error('Error recording attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
    }
  };

  const handleBarcodeScanned = async (code: string) => {
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
    console.log('Recording group attendance:', status);
    const unrecordedRegistrations = registrations.filter(
      registration => !registration.attendance_records?.[0]
    );

    try {
      for (const registration of unrecordedRegistrations) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      <AttendanceControls 
        onBarcodeScanned={handleBarcodeScanned}
        onGroupAttendance={handleGroupAttendance}
      />
      <AttendanceStats stats={attendanceStats} />
      <AttendanceTable 
        registrations={registrations} 
        onAttendanceChange={handleAttendance}
      />
    </div>
  );
};