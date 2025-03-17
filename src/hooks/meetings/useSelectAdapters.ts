
import { Dispatch, SetStateAction } from "react";
import { MeetingType, MeetingStatus, AttendanceType } from "@/types/meeting";

export interface TypeAdapters {
  meetingTypeAdapter: (value: string) => void;
  meetingStatusAdapter: (value: string) => void;
  attendanceTypeAdapter: (value: string) => void;
}

export const useSelectAdapters = (
  setMeetingType: Dispatch<SetStateAction<MeetingType>>,
  setMeetingStatus: Dispatch<SetStateAction<MeetingStatus>>,
  setAttendanceType: Dispatch<SetStateAction<AttendanceType>>
): TypeAdapters => {
  const meetingTypeAdapter = (value: string) => {
    setMeetingType(value as MeetingType);
  };

  const meetingStatusAdapter = (value: string) => {
    setMeetingStatus(value as MeetingStatus);
  };

  const attendanceTypeAdapter = (value: string) => {
    setAttendanceType(value as AttendanceType);
  };

  return {
    meetingTypeAdapter,
    meetingStatusAdapter,
    attendanceTypeAdapter,
  };
};
