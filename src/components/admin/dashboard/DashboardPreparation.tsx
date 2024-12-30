import { useEffect } from "react";
import { AttendanceStats } from "./preparation/AttendanceStats";
import { AttendanceControls } from "./preparation/AttendanceControls";
import { AttendanceTable } from "./preparation/AttendanceTable";
import { useAttendanceManagement } from "@/hooks/useAttendanceManagement";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardPreparationProps {
  eventId: string;
}

export const DashboardPreparation = ({ eventId }: DashboardPreparationProps) => {
  const { data: registrations = [], isLoading, refetch } = useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      console.log('Fetching registrations for event:', eventId);
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          attendance_records(*)
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      console.log('Fetched registrations:', data);
      return data || [];
    },
  });

  const {
    attendanceStats,
    setAttendanceStats,
    handleAttendanceChange,
    handleEventGroupAttendance
  } = useAttendanceManagement(eventId);

  const handleBarcodeScanned = async (code: string) => {
    try {
      console.log('Scanning barcode for event:', eventId, 'code:', code);
      const registration = registrations.find(r => r.registration_number === code);
      if (registration) {
        await handleAttendanceChange(registration.id, 'present');
        await refetch();
        toast.success('تم تسجيل الحضور بنجاح');
      } else {
        toast.error('رقم التسجيل غير موجود');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
    }
  };

  const handleIndividualAttendanceChange = async (registrationId: string, status: 'present' | 'absent') => {
    try {
      console.log('Updating individual attendance for registration:', registrationId, 'with status:', status);
      await handleAttendanceChange(registrationId, status);
      await refetch();
      toast.success(status === 'present' ? 'تم تسجيل الحضور بنجاح' : 'تم تسجيل الغياب بنجاح');
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('حدث خطأ في تحديث الحضور');
    }
  };

  const handleGroupAttendanceWithRefresh = async (status: 'present' | 'absent') => {
    try {
      console.log('Processing group attendance for event:', eventId, 'with status:', status);
      await handleEventGroupAttendance(status);
      await refetch();
      toast.success(status === 'present' ? 'تم تحضير جميع المشاركين' : 'تم تغييب جميع المشاركين');
    } catch (error) {
      console.error('Error in group attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور الجماعي');
    }
  };

  useEffect(() => {
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
  }, [registrations, setAttendanceStats]);

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
        onGroupAttendance={handleGroupAttendanceWithRefresh}
      />
      <AttendanceStats stats={attendanceStats} />
      <AttendanceTable 
        registrations={registrations} 
        onAttendanceChange={handleIndividualAttendanceChange}
      />
    </div>
  );
};