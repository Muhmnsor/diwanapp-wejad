
import { Meeting } from "@/types/meeting";

/**
 * Processes meeting data to ensure objectives and agenda are always strings
 * This helps compatibility with components expecting string format
 */
export const processMeetingsData = (meetings: Meeting[]): Meeting[] => {
  return meetings.map(meeting => {
    const processedMeeting = { ...meeting };
    
    // Convert objectives array to string if needed
    if (Array.isArray(processedMeeting.objectives)) {
      processedMeeting.objectives = processedMeeting.objectives.join(', ');
    }
    
    // Convert agenda array to string if needed
    if (Array.isArray(processedMeeting.agenda)) {
      processedMeeting.agenda = processedMeeting.agenda.join(', ');
    }
    
    return processedMeeting;
  });
};
