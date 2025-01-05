import { useEventAttendance } from "@/hooks/attendance/useEventAttendance";
import { AttendanceContent } from "./components/AttendanceContent";
import { LoadingState } from "./components/LoadingState";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EventAttendanceTabProps {
  eventId: string;
}

export const EventAttendanceTab = ({ eventId }: EventAttendanceTabProps) => {
  const { 
    attendanceStats,
    handleAttendanceChange,
    handleGroupAttendance
  } = useEventAttendance(eventId);

  const { data: registrations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['event-registrations', eventId],
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
    }
  });

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <AttendanceContent
      stats={attendanceStats}
      records={registrations}
      error={error}
      onRefresh={refetch}
      onBarcodeScanned={async (code) => {
        const registration = registrations.find(r => r.registration_number === code);
        if (registration) {
          await handleAttendanceChange(registration.id, 'present');
          await refetch();
        }
      }}
      onGroupAttendance={async (status) => {
        await handleGroupAttendance(status);
        await refetch();
      }}
      onAttendanceChange={async (registrationId, status) => {
        await handleAttendanceChange(registrationId, status);
        await refetch();
      }}
    />
  );
};