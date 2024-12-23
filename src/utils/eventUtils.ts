import { Event } from "@/store/eventStore";

export const arabicToEnglishNum = (str: string) => {
  return str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

export const convertArabicDate = (dateStr: string, timeStr: string) => {
  console.log("Converting date and time:", { dateStr, timeStr });
  
  const [day, month, year] = dateStr.split(' ');
  const arabicMonths: { [key: string]: string } = {
    'يناير': 'January', 'فبراير': 'February', 'مارس': 'March',
    'ابريل': 'April', 'مايو': 'May', 'يونيو': 'June',
    'يوليو': 'July', 'اغسطس': 'August', 'سبتمبر': 'September',
    'اكتوبر': 'October', 'نوفمبر': 'November', 'ديسمبر': 'December'
  };
  
  const englishMonth = arabicMonths[month] || month;
  
  let cleanTimeStr = timeStr
    .replace('مساءً', 'PM')
    .replace('صباحاً', 'AM')
    .replace('ص', 'AM')
    .replace('م', 'PM');
  
  console.log("Cleaned time string:", cleanTimeStr);
  
  const dateString = `${englishMonth} ${day} ${year} ${cleanTimeStr}`;
  console.log("Final date string:", dateString);
  
  return dateString;
};

export const isEventPassed = (event: Event): boolean => {
  const now = new Date();
  const eventDateTime = new Date(`${event.date} ${event.time}`);
  return eventDateTime < now;
};

export type EventStatus = 'available' | 'full' | 'ended' | 'notStarted' | 'eventStarted';

export const getEventStatus = (event: Event): EventStatus => {
  console.log('Checking event status for:', event.title);
  
  const now = new Date();
  const eventDate = new Date(`${event.date} ${event.time}`);
  
  // Check if event has started
  if (now >= eventDate) {
    console.log('Event has already started or ended');
    return 'eventStarted';
  }
  
  // Check registration start date
  if (event.registrationStartDate) {
    const startDate = new Date(event.registrationStartDate);
    if (now < startDate) {
      console.log('Registration has not started yet');
      return 'notStarted';
    }
  }
  
  // Check registration end date
  if (event.registrationEndDate) {
    const endDate = new Date(event.registrationEndDate);
    if (now > endDate) {
      console.log('Registration period has ended');
      return 'ended';
    }
  }
  
  // Check if event is full
  if (event.attendees >= event.maxAttendees) {
    console.log('Event is full - no more seats available');
    return 'full';
  }
  
  console.log('Registration is available');
  return 'available';
};

export const getStatusConfig = (status: EventStatus) => {
  const configs = {
    available: {
      text: "تسجيل الحضور",
      className: "bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all",
      disabled: false
    },
    full: {
      text: "اكتمل التسجيل",
      className: "bg-gray-100 text-gray-500 cursor-not-allowed",
      disabled: true
    },
    ended: {
      text: "انتهى التسجيل",
      className: "bg-gray-50 text-gray-400 cursor-not-allowed",
      disabled: true
    },
    notStarted: {
      text: "لم يبدأ التسجيل بعد",
      className: "bg-gray-50 text-gray-400 cursor-not-allowed",
      disabled: true
    },
    eventStarted: {
      text: "بدأت الفعالية",
      className: "bg-gray-50 text-gray-400 cursor-not-allowed",
      disabled: true
    }
  };

  return configs[status];
};