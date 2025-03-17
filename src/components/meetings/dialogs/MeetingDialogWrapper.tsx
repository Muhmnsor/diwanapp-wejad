
import React, { useState } from "react";
import { EditMeetingDialog } from "./EditMeetingDialog";
import { Meeting, MeetingType, MeetingStatus, AttendanceType } from "@/types/meeting";

interface MeetingDialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting;
  onSave: (meeting: Meeting) => void;
}

export const MeetingDialogWrapper = ({
  open,
  onOpenChange,
  meeting,
  onSave,
}: MeetingDialogWrapperProps) => {
  const [meetingTypeValue, setMeetingTypeValue] = useState<MeetingType>(
    meeting?.meeting_type || "other"
  );
  
  const [meetingStatusValue, setMeetingStatusValue] = useState<MeetingStatus>(
    meeting?.status || "scheduled"
  );
  
  const [attendanceTypeValue, setAttendanceTypeValue] = useState<AttendanceType>(
    meeting?.attendance_type || "in_person"
  );

  const handleMeetingTypeChange = (newValue: string) => {
    setMeetingTypeValue(newValue as MeetingType);
  };

  const handleMeetingStatusChange = (newValue: string) => {
    setMeetingStatusValue(newValue as MeetingStatus);
  };

  const handleAttendanceTypeChange = (newValue: string) => {
    setAttendanceTypeValue(newValue as AttendanceType);
  };

  return (
    <EditMeetingDialog
      open={open}
      onOpenChange={onOpenChange}
      meeting={meeting}
      onSave={onSave}
      meetingTypeValue={meetingTypeValue}
      meetingStatusValue={meetingStatusValue}
      attendanceTypeValue={attendanceTypeValue}
      onMeetingTypeChange={handleMeetingTypeChange}
      onMeetingStatusChange={handleMeetingStatusChange}
      onAttendanceTypeChange={handleAttendanceTypeChange}
    />
  );
};
