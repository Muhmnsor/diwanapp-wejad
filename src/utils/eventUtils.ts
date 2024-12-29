import { Event } from "@/store/eventStore";
import { EventStatus } from "@/types/eventStatus";
import { getEventDateTime } from "./dateUtils";

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

export const getEventStatus = (event: {
  date: string;
  time: string;
  max_attendees: number;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  beneficiaryType: string;
  attendees: number;
  isProject?: boolean;
  endDate?: string;
}): EventStatus => {
  if (!event) {
    console.log('Event is undefined in getEventStatus');
    return 'notStarted';
  }

  console.log('Checking event status for:', {
    date: event.date,
    time: event.time,
    registrationStartDate: event.registrationStartDate,
    registrationEndDate: event.registrationEndDate,
    attendees: event.attendees,
    max_attendees: event.max_attendees,
    isProject: event.isProject,
    endDate: event.endDate
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // تحويل تواريخ التسجيل إلى كائنات Date
  const registrationStartDate = event.registrationStartDate ? 
    new Date(event.registrationStartDate) : null;
  const registrationEndDate = event.registrationEndDate ? 
    new Date(event.registrationEndDate) : null;

  // للمشاريع، نستخدم تاريخ النهاية للتحقق من انتهاء المشروع
  const eventDateTime = event.isProject && event.endDate ? 
    new Date(event.endDate) : 
    getEventDateTime(event.date, event.time);

  // تسجيل التواريخ للتحقق
  console.log('Registration dates:', {
    start: registrationStartDate?.toISOString(),
    end: registrationEndDate?.toISOString(),
    now: now.toISOString(),
    today: today.toISOString(),
    eventEnd: eventDateTime.toISOString()
  });

  // التحقق من بدء موعد التسجيل
  if (registrationStartDate) {
    const startDate = new Date(
      registrationStartDate.getFullYear(),
      registrationStartDate.getMonth(),
      registrationStartDate.getDate()
    );
    
    if (today < startDate) {
      console.log('Registration has not started yet');
      return 'notStarted';
    }
  }

  // التحقق من انتهاء موعد التسجيل
  if (registrationEndDate) {
    const endDate = new Date(
      registrationEndDate.getFullYear(),
      registrationEndDate.getMonth(),
      registrationEndDate.getDate(),
      23, 59, 59
    );

    if (now > endDate) {
      console.log('Registration period has ended');
      return 'ended';
    }
  }

  // التحقق من بدء الفعالية أو المشروع
  if (now >= eventDateTime) {
    console.log('Event/Project has already started or ended');
    return 'eventStarted';
  }

  // التحقق من اكتمال العدد
  if (event.max_attendees && event.attendees >= event.max_attendees) {
    console.log('Event/Project is full - no more seats available');
    return 'full';
  }

  console.log('Registration is available');
  return 'available';
};

export { getStatusConfig } from "./eventStatusConfig";