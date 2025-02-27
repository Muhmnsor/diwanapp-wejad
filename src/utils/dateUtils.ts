
export const parseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.log('Invalid date string:', dateStr);
      return null;
    }
    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

export const getEventDateTime = (date: string, time: string = '00:00'): Date => {
  const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];
  const eventDate = new Date(date);
  eventDate.setHours(hours, minutes, 0, 0);
  
  console.log('Creating event date from:', { date, time, result: eventDate });
  return eventDate;
};

// تعديل دالة formatDate لتعرض التاريخ بالميلادي والوقت بنظام 12 ساعة
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // عرض التاريخ بالتقويم الميلادي بتنسيق اليوم/الشهر/السنة
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // تحويل الوقت لنظام 12 ساعة مع إضافة ص/م
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12; // الساعة 0 تصبح 12
    const hoursStr = hours.toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};
