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

  const handleGroupAttendance = async (status: 'present' | 'absent', activityId?: string) => {
    console.log('Handling group attendance:', { status, activityId });
    
    if (activityId) {
      await activityGroupAttendance(status, activityId);
    } else {
      await eventGroupAttendance(status);
    }
  };

  return {
    attendanceStats: eventStats,
    setAttendanceStats: setEventStats,
    handleAttendanceChange,
    handleGroupAttendance
  };
};