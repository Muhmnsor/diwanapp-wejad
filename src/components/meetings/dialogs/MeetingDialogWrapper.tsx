
import React, { useState } from "react";
import { EditMeetingDialog } from "./EditMeetingDialog";
import { Meeting, MeetingType, MeetingStatus, AttendanceType } from "@/types/meeting";
import { useSelectAdapters } from "@/hooks/meetings/useSelectAdapters";

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
  // Initialize state with meeting values or defaults
  const [meetingTypeValue, setMeetingTypeValue] = useState<MeetingType>(
    meeting?.meeting_type || "other"
  );
  
  const [meetingStatusValue, setMeetingStatusValue] = useState<MeetingStatus>(
    meeting?.status as MeetingStatus || "scheduled"
  );
  
  const [attendanceTypeValue, setAttendanceTypeValue] = useState<AttendanceType>(
    meeting?.attendance_type || "in_person"
  );

  // Use our type-safe adapters
  const {
    meetingTypeAdapter,
    meetingStatusAdapter,
    attendanceTypeAdapter
  } = useSelectAdapters(
    setMeetingTypeValue,
    setMeetingStatusValue,
    setAttendanceTypeValue
  );

  // Pass modified meeting object with the updated fields to parent component
  const handleSaveMeeting = (updatedMeeting: Meeting) => {
    const finalMeeting = {
      ...updatedMeeting,
      meeting_type: meetingTypeValue,
      status: meetingStatusValue,
      attendance_type: attendanceTypeValue
    };
    onSave(finalMeeting);
  };

  return (
    <EditMeetingDialog
      open={open}
      onOpenChange={onOpenChange}
      meeting={meeting}
      meetingTypeValue={meetingTypeValue}
      meetingStatusValue={meetingStatusValue}
      attendanceTypeValue={attendanceTypeValue}
      onMeetingTypeChange={meetingTypeAdapter}
      onMeetingStatusChange={meetingStatusAdapter}
      onAttendanceTypeChange={attendanceTypeAdapter}
      onSaveMeeting={handleSaveMeeting}
    />
  );
};
