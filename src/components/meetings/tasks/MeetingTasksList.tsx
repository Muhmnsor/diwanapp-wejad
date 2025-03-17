
import { MeetingTaskTypes } from "./MeetingTaskTypes";

interface MeetingTasksListProps {
  meetingId: string | undefined;
}

export const MeetingTasksList = ({ meetingId }: MeetingTasksListProps) => {
  return <MeetingTaskTypes meetingId={meetingId} />;
};
