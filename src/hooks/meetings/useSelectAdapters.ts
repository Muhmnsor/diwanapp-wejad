
import { Dispatch, SetStateAction } from "react";
import { MeetingType, MeetingStatus, AttendanceType } from "@/types/meeting";

export interface TypeAdapters {
  meetingTypeAdapter: (value: string) => void;
  meetingStatusAdapter: (value: string) => void;
  attendanceTypeAdapter: (value: string) => void;
}

/**
 * Creates type-safe adapter functions to handle string values from select components
 * and convert them to the appropriate meeting type enums
 */
export const useSelectAdapters = (
  setMeetingType: Dispatch<SetStateAction<MeetingType>>,
  setMeetingStatus: Dispatch<SetStateAction<MeetingStatus>>,
  setAttendanceType: Dispatch<SetStateAction<AttendanceType>>
): TypeAdapters => {
  // These adapter functions safely convert string values from UI components
  // to the specific enum types required by the state setters
  const meetingTypeAdapter = (value: string) => {
    // Safely convert string value to MeetingType before setting
    if (isMeetingType(value)) {
      setMeetingType(value);
    } else {
      console.warn(`Invalid meeting type value: ${value}`);
    }
  };

  const meetingStatusAdapter = (value: string) => {
    // Safely convert string value to MeetingStatus before setting
    if (isMeetingStatus(value)) {
      setMeetingStatus(value);
    } else {
      console.warn(`Invalid meeting status value: ${value}`);
    }
  };

  const attendanceTypeAdapter = (value: string) => {
    // Safely convert string value to AttendanceType before setting
    if (isAttendanceType(value)) {
      setAttendanceType(value);
    } else {
      console.warn(`Invalid attendance type value: ${value}`);
    }
  };

  return {
    meetingTypeAdapter,
    meetingStatusAdapter,
    attendanceTypeAdapter,
  };
};

// Type guard functions to validate input values match the expected enum types
function isMeetingType(value: string): value is MeetingType {
  return ['board', 'department', 'team', 'committee', 'other'].includes(value);
}

function isMeetingStatus(value: string): value is MeetingStatus {
  return ['scheduled', 'in_progress', 'completed', 'cancelled'].includes(value);
}

function isAttendanceType(value: string): value is AttendanceType {
  return ['in_person', 'virtual', 'hybrid'].includes(value);
}
