
import React from "react";
import { MeetingMinutesContent } from "./MeetingMinutesContent";
import { useMeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";
import { adaptMinutesData } from "@/hooks/meetings/adapters/minutesAdapter";

interface MinutesContentWrapperProps {
  meetingId: string;
}

export const MinutesContentWrapper: React.FC<MinutesContentWrapperProps> = ({ 
  meetingId 
}) => {
  const minutesQuery = useMeetingMinutes(meetingId);
  
  // Adapt the data to the format expected by components
  const adaptedData = adaptMinutesData(minutesQuery.data);
  
  // Replace the original data with the adapted data
  const wrappedQuery = {
    ...minutesQuery,
    data: adaptedData
  };
  
  return <MeetingMinutesContent query={wrappedQuery} meetingId={meetingId} />;
};
