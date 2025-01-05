import { useEventAttendance } from "@/hooks/attendance/useEventAttendance";
import { AttendanceContent } from "./components/AttendanceContent";
import { LoadingState } from "./components/LoadingState";

interface EventAttendanceTabProps {
  eventId: string;
}

export const EventAttendanceTab = ({ eventId }: EventAttendanceTabProps) => {
  const { stats, records, isLoading, error, refetch } = useEventAttendance(eventId);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <AttendanceContent
      stats={stats}
      records={records}
      error={error}
      onRefresh={async () => {
        await refetch();
      }}
    />
  );
};