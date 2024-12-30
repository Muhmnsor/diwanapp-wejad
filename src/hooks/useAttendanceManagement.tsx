import { useEventAttendance } from "./attendance/useEventAttendance";
import { useActivityAttendance } from "./attendance/useActivityAttendance";

export const useAttendanceManagement = (projectId: string) => {
  const {
    attendanceStats: eventStats,
    setAttendanceStats: setEventStats,
    handleAttendanceChange: handleEventAttendanceChange,
    handleGroupAttendance: eventGroupAttendance
  } = useEventAttendance(projectId);

  const {
    attendanceStats: activityStats,
    setAttendanceStats: setActivityStats,
    handleAttendanceChange: handleActivityAttendanceChange,
    handleGroupAttendance: activityGroupAttendance
  } = useActivityAttendance(projectId);

  const handleAttendanceChange = async (
    registrationId: string,
    status: 'present' | 'absent',
    activityId?: string
  ) => {
    console.log('Handling attendance change:', { registrationId, status, activityId });
    
    if (activityId) {
      await handleActivityAttendanceChange(registrationId, status, activityId);
    } else {
      await handleEventAttendanceChange(registrationId, status);
    }
  };

  return {
    attendanceStats: eventStats,
    setAttendanceStats: setEventStats,
    handleAttendanceChange,
    handleEventGroupAttendance: eventGroupAttendance,
    handleActivityGroupAttendance: activityGroupAttendance
  };
};