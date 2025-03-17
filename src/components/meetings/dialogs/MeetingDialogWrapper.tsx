
import { useState, useEffect } from 'react';
import { Meeting } from '@/types/meeting';
import { EditMeetingDialog } from './EditMeetingDialog';
import { useSelectAdapters } from '@/hooks/meetings/useSelectAdapters';

interface MeetingDialogWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onSave: (meeting: Meeting) => void;
}

export const MeetingDialogWrapper = ({
  isOpen,
  onClose,
  meeting,
  onSave
}: MeetingDialogWrapperProps) => {
  // Use adapters to resolve type compatibility issues
  const { 
    createMeetingTypeAdapter,
    createMeetingStatusAdapter, 
    createAttendanceTypeAdapter 
  } = useSelectAdapters();
  
  // Set up adapters with initial values from the meeting
  const typeAdapter = createMeetingTypeAdapter(
    (meeting?.meeting_type as "board" | "department" | "team" | "committee" | "other") || "team"
  );
  
  const statusAdapter = createMeetingStatusAdapter(
    (meeting?.status as "scheduled" | "in_progress" | "completed" | "cancelled") || "scheduled"
  );
  
  const attendanceAdapter = createAttendanceTypeAdapter(
    (meeting?.attendance_type as "in_person" | "virtual" | "hybrid") || "in_person"
  );
  
  return (
    <EditMeetingDialog
      isOpen={isOpen}
      onClose={onClose}
      meeting={meeting}
      onSave={onSave}
      // Pass the adapter values and handlers
      meetingTypeValue={typeAdapter.value}
      onMeetingTypeChange={typeAdapter.onValueChange}
      meetingStatusValue={statusAdapter.value}
      onMeetingStatusChange={statusAdapter.onValueChange}
      attendanceTypeValue={attendanceAdapter.value}
      onAttendanceTypeChange={attendanceAdapter.onValueChange}
    />
  );
};
