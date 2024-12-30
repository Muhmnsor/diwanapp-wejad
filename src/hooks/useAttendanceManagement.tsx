import { useAttendanceStats } from "./attendance/useAttendanceStats";
import { useAttendanceRecords } from "./attendance/useAttendanceRecords";
import { useAttendanceActions } from "./attendance/useAttendanceActions";

export const useAttendanceManagement = (projectId: string, selectedActivityId: string | null) => {
  const { attendanceStats, setAttendanceStats, fetchActivityAttendance } = useAttendanceStats();
  const { data: registrations = [], isLoading, refetch } = useAttendanceRecords(projectId, selectedActivityId);
  const { handleAttendance, handleBarcodeScanned, handleGroupAttendance } = useAttendanceActions(projectId, selectedActivityId);

  return {
    registrations,
    isLoading,
    attendanceStats,
    setAttendanceStats,
    handleAttendance,
    handleBarcodeScanned: (code: string) => handleBarcodeScanned(code, registrations),
    handleGroupAttendance: (status: 'present' | 'absent') => handleGroupAttendance(status, registrations),
    fetchActivityAttendance: (activityId: string) => fetchActivityAttendance(projectId, activityId),
    refetch
  };
};