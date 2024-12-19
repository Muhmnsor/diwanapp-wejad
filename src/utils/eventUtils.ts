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

export const getEventStatus = (event: Event): 'available' | 'full' | 'ended' | 'notStarted' => {
  console.log('Checking event status for:', event.title);
  console.log('Event registration dates:', {
    start: event.registrationStartDate,
    end: event.registrationEndDate
  });
  
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset time to start of day for date comparison

  // تحقق من تاريخ بدء التسجيل
  if (event.registrationStartDate) {
    const startDate = new Date(event.registrationStartDate);
    startDate.setHours(0, 0, 0, 0);
    
    console.log('Registration start date:', startDate.toISOString());
    console.log('Current date:', now.toISOString());
    
    if (now < startDate) {
      console.log('Registration has not started yet - current date is before start date');
      return 'notStarted';
    }
  }
  
  // تحقق من تاريخ انتهاء التسجيل
  if (event.registrationEndDate) {
    const endDate = new Date(event.registrationEndDate);
    endDate.setHours(23, 59, 59, 999); // Set to end of day
    
    console.log('Registration end date:', endDate.toISOString());
    
    if (now > endDate) {
      console.log('Registration period has ended - current date is after end date');
      return 'ended';
    }
  }
  
  // تحقق من موعد الفعالية
  const isEventEnded = isEventPassed(event);
  if (isEventEnded) {
    console.log('Event has already passed');
    return 'ended';
  }
  
  // تحقق من اكتمال العدد
  if (event.attendees >= event.maxAttendees) {
    console.log('Event is full - no more seats available');
    return 'full';
  }
  
  console.log('Registration is available');
  return 'available';
};