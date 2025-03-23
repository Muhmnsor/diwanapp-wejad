
import { MeetingMinutes } from "../useMeetingMinutes";

/**
 * This adapter is needed because MeetingMinutesSection.tsx expects a different shape
 * for the minutes data than what is provided by useMeetingMinutes
 */
export const adaptMinutesData = (data: any) => {
  if (!data) return null;

  // Make sure we have the right properties that MeetingMinutesSection expects
  const adaptedData = {
    ...data,
    content: data.minutes?.content,
    attendees: data.minutes?.attendees || [],
    minutes: {
      ...data.minutes,
      content: data.minutes?.content,
      attendees: data.minutes?.attendees || []
    },
    minutesItems: data.minutesItems || []
  };

  return adaptedData;
};
