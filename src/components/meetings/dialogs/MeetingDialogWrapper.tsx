
import React, { useState } from "react";
import { EditMeetingDialog } from "./EditMeetingDialog";
import { Meeting, MeetingType, MeetingStatus, AttendanceType, MeetingLifecycleStatus } from "@/types/meeting";
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
    meeting?.meeting_status as MeetingStatus || "scheduled"
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
      meeting_status: meetingStatusValue, // Use meeting_status instead of status
      attendance_type: attendanceTypeValue,
      // Map meetingStatusValue to a compatible MeetingLifecycleStatus
      status: mapMeetingStatusToLifecycleStatus(meetingStatusValue)
    };
    onSave(finalMeeting);
  };
  
  // Helper function to map MeetingStatus to MeetingLifecycleStatus
  const mapMeetingStatusToLifecycleStatus = (status: MeetingStatus): MeetingLifecycleStatus => {
    switch (status) {
      case "scheduled": return "upcoming";
      case "in_progress": return "ongoing";
      case "completed": return "completed";
      case "cancelled": return "cancelled";
      default: return "upcoming";
    }
  };

  return (
    <EditMeetingDialog
      open={open}
      onOpenChange={onOpenChange}
      meeting={meeting}
      onSaveMeeting={handleSaveMeeting}
    />
  );
};
