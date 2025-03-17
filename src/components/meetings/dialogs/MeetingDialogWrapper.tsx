
import React from "react";
import { EditMeetingDialog } from "./EditMeetingDialog";
import { Meeting, MeetingLifecycleStatus } from "@/types/meeting";

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
  // EditMeetingDialog expects onSuccess
  const handleSuccess = (updatedMeeting: Meeting) => {
    onSave({
      ...updatedMeeting,
      // Ensure status is properly set based on meeting_status
      status: mapMeetingStatusToLifecycleStatus(updatedMeeting.meeting_status)
    });
  };
  
  // Helper function to map MeetingStatus to MeetingLifecycleStatus
  const mapMeetingStatusToLifecycleStatus = (status: string): MeetingLifecycleStatus => {
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
      onSuccess={handleSuccess}
    />
  );
};
