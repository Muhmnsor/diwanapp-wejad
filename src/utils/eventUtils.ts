import { Event } from "@/store/eventStore";
import { EventStatus } from "@/types/eventStatus";
import { parseDate, getEventDateTime } from "./dateUtils";
import { getStatusConfig } from "./eventStatusConfig";

export const arabicToEnglishNum = (str: string) => {
  return str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

export const isEventPassed = (event: Event): boolean => {
  if (!event) {
    console.log('Event is undefined in isEventPassed');
    return false;
  }
  const now = new Date();
  const eventDateTime = getEventDateTime(event.date, event.time);
  return eventDateTime < now;
};

export const getEventStatus = (event: Event): EventStatus => {
  if (!event) {
    console.log('Event is undefined in getEventStatus');
    return 'notStarted';
  }

  console.log('Checking event status for:', {
    title: event.title,
    date: event.date,
    time: event.time,
    registrationStartDate: event.registrationStartDate,
    registrationEndDate: event.registrationEndDate,
    attendees: event.attendees,
    max_attendees: event.max_attendees
  });

  const now = new Date();
  const eventDateTime = getEventDateTime(event.date, event.time);
  const registrationStartDate = parseDate(event.registrationStartDate);
  const registrationEndDate = parseDate(event.registrationEndDate);

  // Log parsed dates for debugging
  console.log('Registration period:', {
    start: registrationStartDate?.toISOString(),
    end: registrationEndDate?.toISOString(),
    now: now.toISOString()
  });

  // Check if event has already started or ended
  if (now >= eventDateTime) {
    console.log('Event has already started or ended');
    return 'eventStarted';
  }

  // Check if registration period hasn't started yet
  if (registrationStartDate && now < registrationStartDate) {
    console.log('Registration has not started yet');
    return 'notStarted';
  }

  // Check if registration period has ended
  if (registrationEndDate && now > registrationEndDate) {
    console.log('Registration period has ended');
    return 'ended';
  }

  // Check if event is full
  const currentAttendees = typeof event.attendees === 'number' ? event.attendees : 0;
  if (event.max_attendees && currentAttendees >= event.max_attendees) {
    console.log('Event is full - no more seats available');
    return 'full';
  }

  console.log('Registration is available');
  return 'available';
};

export { getStatusConfig };