import { useEventAttendance } from "./attendance/useEventAttendance";
import { useActivityAttendance } from "./attendance/useActivityAttendance";
import { AttendanceStats } from "./attendance/types";

export const useAttendanceManagement = (projectId: string) => {
  const {
    attendanceStats: eventStats,
    setAttendanceStats: setEventStats,
    handleAttendanceChange: handleEventAttendanceChange,
    handleGroupAttendance: handleEventGroupAttendance
  } = useEventAttendance(projectId);

  const {
    attendanceStats: activityStats,
    setAttendanceStats: setActivityStats,
    handleAttendanceChange: handleActivityAttendanceChange,
    handleGroupAttendance: handleActivityGroupAttendance
  } = useActivityAttendance(projectId);

  const handleAttendanceChange = async (
    registrationId: string,
    status: 'present' | 'absent',
    activityId?: string
  ) => {
    if (activityId) {
      await handleActivityAttendanceChange(registrationId, status, activityId);
    } else {
      await handleEventAttendanceChange(registrationId, status);
    }
  };

  const handleEventGroupAttendance = async (status: 'present' | 'absent') => {
    await handleEventGroupAttendance(status);
  };

  const handleActivityGroupAttendance = async (status: 'present' | 'absent', activityId: string) => {
    await handleActivityGroupAttendance(status, activityId);
  };

  return {
    attendanceStats: activityId ? activityStats : eventStats,
    setAttendanceStats: activityId ? setActivityStats : setEventStats,
    handleAttendanceChange,
    handleEventGroupAttendance,
    handleActivityGroupAttendance
  };
};