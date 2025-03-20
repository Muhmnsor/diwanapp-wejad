
import { useMeetings } from "./useMeetings";
import { processMeetingsData } from "@/utils/meeting-utils";
import { Meeting } from "@/types/meeting";

/**
 * A wrapper hook around useMeetings that processes the data to ensure
 * objectives and agenda are always strings
 */
export const useProcessedMeetings = (folderId?: string, refreshTrigger: number = 0) => {
  const { data, isLoading, error } = useMeetings(folderId, refreshTrigger);
  
  // Process the meetings data to ensure compatibility
  const processedData = data ? processMeetingsData(data as Meeting[]) : [];
  
  return {
    data: processedData,
    isLoading,
    error
  };
};
