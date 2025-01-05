import { useEventAttendance } from "@/hooks/attendance/useEventAttendance";
import { useRegistrationsQuery } from "./hooks/useRegistrationsQuery";
import { AttendanceContent } from "./components/AttendanceContent";
import { LoadingState } from "./components/LoadingState";

interface EventAttendanceTabProps {
  eventId: string;
}

export const EventAttendanceTab = ({ eventId }: EventAttendanceTabProps) => {
  const { data: registrations, isLoading, refetch } = useRegistrationsQuery(eventId);
  const {
    attendanceStats,
    setAttendanceStats,
    handleAttendanceChange,
    handleGroupAttendance
  } = useEventAttendance(eventId);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <AttendanceContent
      registrations={registrations}
      attendanceStats={attendanceStats}
      setAttendanceStats={setAttendanceStats}
      handleAttendanceChange={handleAttendanceChange}
      handleGroupAttendance={handleGroupAttendance}
      refetch={refetch}
    />
  );
};