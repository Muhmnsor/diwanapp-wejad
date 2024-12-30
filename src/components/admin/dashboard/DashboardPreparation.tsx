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
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          attendance_records(*)
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return data || [];
    },
  });

  const {
    attendanceStats,
    setAttendanceStats,
    handleAttendanceChange,
    handleGroupAttendance
  } = useAttendanceManagement(eventId);

  // Add handleBarcodeScanned function for single events
  const handleBarcodeScanned = async (code: string) => {
    console.log('Scanning barcode for event:', eventId, 'code:', code);
    const registration = registrations.find(r => r.registration_number === code);
    if (registration) {
      await handleAttendanceChange(registration.id, 'present');
      toast.success('تم تسجيل الحضور بنجاح');
    } else {
      toast.error('رقم التسجيل غير موجود');
    }
  };

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
        onGroupAttendance={handleGroupAttendance}
      />
      <AttendanceStats stats={attendanceStats} />
      <AttendanceTable 
        registrations={registrations} 
        onAttendanceChange={handleAttendanceChange}
      />
    </div>
  );
};