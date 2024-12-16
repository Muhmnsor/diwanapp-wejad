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
  const [eventDate, eventTime] = [event.date, event.time];
  const eventDateTime = new Date(`${eventDate}T${eventTime}`);
  return eventDateTime < now;
};

export const getEventStatus = (event: Event): 'available' | 'full' | 'ended' | 'notStarted' => {
  console.log('Checking event status for:', event.title);
  
  // تحقق ما إذا كان الحدث قد انتهى
  if (isEventPassed(event)) {
    console.log('Event has passed:', event.title);
    return 'ended';
  }
  
  // تحقق من تاريخ بدء التسجيل
  if (event.registrationStartDate) {
    const startDate = new Date(event.registrationStartDate);
    const now = new Date();
    if (now < startDate) {
      console.log('Registration has not started yet for:', event.title);
      return 'notStarted';
    }
  }
  
  // تحقق من تاريخ انتهاء التسجيل
  if (event.registrationEndDate) {
    const endDate = new Date(event.registrationEndDate);
    const now = new Date();
    if (now > endDate) {
      console.log('Registration has ended for:', event.title);
      return 'ended';
    }
  }
  
  // تحقق من اكتمال العدد
  if (event.attendees >= event.maxAttendees) {
    console.log('Event is full:', event.title);
    return 'full';
  }
  
  console.log('Registration is available for:', event.title);
  return 'available';
};