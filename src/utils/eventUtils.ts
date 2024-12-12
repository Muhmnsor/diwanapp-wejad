import { Event } from "@/store/eventStore";

export const arabicToEnglishNum = (str: string) => {
  return str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

export const convertArabicDate = (dateStr: string, timeStr: string) => {
  console.log("Converting date and time:", { dateStr, timeStr });
  
  // تحويل التاريخ
  const [day, month, year] = dateStr.split(' ');
  const arabicMonths: { [key: string]: string } = {
    'يناير': 'January', 'فبراير': 'February', 'مارس': 'March',
    'ابريل': 'April', 'مايو': 'May', 'يونيو': 'June',
    'يوليو': 'July', 'اغسطس': 'August', 'سبتمبر': 'September',
    'اكتوبر': 'October', 'نوفمبر': 'November', 'ديسمبر': 'December'
  };
  
  const englishMonth = arabicMonths[month] || month;
  
  // معالجة الوقت
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

export const getEventStatus = (event: Event): 'available' | 'full' | 'ended' | 'notStarted' => {
  const now = new Date();
  const eventDate = new Date(event.date);
  
  // Check if registration period is defined
  if (event.registrationStartDate && new Date(event.registrationStartDate) > now) {
    return 'notStarted';
  }
  
  if (event.registrationEndDate && new Date(event.registrationEndDate) < now) {
    return 'ended';
  }
  
  // Check if event is full
  if (event.attendees >= event.maxAttendees) {
    return 'full';
  }
  
  return 'available';
};