import { useEventAttendance } from "@/hooks/attendance/useEventAttendance";
import { AttendanceContent } from "./components/AttendanceContent";
import { LoadingState } from "./components/LoadingState";

interface EventAttendanceTabProps {
  eventId: string;
}

export const EventAttendanceTab = ({ eventId }: EventAttendanceTabProps) => {
  const { 
    attendanceStats,
    handleAttendanceChange,
    handleGroupAttendance
  } = useEventAttendance(eventId);

  const isLoading = false;
  const error = null;
  const records: any[] = [];

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <AttendanceContent
      stats={attendanceStats}
      records={records}
      error={error}
      onRefresh={async () => {}}
    />
  );
};