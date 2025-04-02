
export const formatTime12Hour = (time: string) => {
  try {
    // تحويل الوقت إلى تنسيق 12 ساعة
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
};

export const formatDateWithDay = (dateStr: string) => {
  try {
    const days = [
      'الأحد',
      'الإثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت'
    ];

    // تحويل التاريخ إلى كائن Date
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // الحصول على اسم اليوم
    const dayName = days[date.getDay()];
    
    // تنسيق التاريخ بالطريقة العربية
    return `${dayName}، ${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};

// Format time from timestamp
export const formatTime = (timestamp: string | null) => {
  if (!timestamp) return '-';
  try {
    // Create a date object with the timestamp 
    const date = new Date(timestamp);
    
    // Format to local time using Saudi Arabia locale (ar-SA)
    // This ensures proper time display with AM/PM in Arabic
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true, 
      timeZone: 'Asia/Riyadh' 
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timestamp;
  }
};

// Add the missing formatDate function
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Format as day/month/year
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

