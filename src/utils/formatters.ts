
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

/**
 * Format a date string to Arabic localized format dd/MM/yyyy
 * @param dateString The date string to format
 * @param fallback The fallback text if date is invalid or null
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | null | undefined, fallback: string = 'غير محدد'): string => {
  if (!dateString) return fallback;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return format(date, 'dd/MM/yyyy', { locale: ar });
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

/**
 * Format a date relative to current time (e.g. "2 days ago", "in 3 months")
 * If the date is null, returns the fallback text
 * @param dateString The date string to format
 * @param fallback The fallback text if date is invalid or null
 * @returns Formatted relative date string
 */
export const formatRelative = (dateString: string | null, fallback: string = 'غير محدد'): string => {
  if (!dateString) return fallback;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return formatDistanceToNow(date, { addSuffix: true, locale: ar });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return fallback;
  }
};

/**
 * Get relative time from now for a date
 * @param dateString The date string to calculate relative time for
 * @returns Formatted relative time string or null if date is invalid
 */
export const getTimeFromNow = (dateString: string | null): string | null => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return formatDistanceToNow(date, { addSuffix: true, locale: ar });
  } catch (error) {
    console.error('Error calculating time from now:', error);
    return null;
  }
};

/**
 * Get remaining days until a date
 * @param dateString The date string to calculate remaining days until
 * @returns Number of remaining days or null if date is invalid
 */
export const getRemainingDays = (dateString: string | null): number | null => {
  if (!dateString) return null;
  
  try {
    const dueDate = new Date(dateString);
    if (isNaN(dueDate.getTime())) {
      return null;
    }
    const today = new Date();
    const days = differenceInDays(dueDate, today);
    return days <= 0 ? 0 : days;
  } catch (error) {
    console.error('Error calculating remaining days:', error);
    return null;
  }
};

/**
 * Format time as 12-hour format with Arabic AM/PM indicators
 * @param time Time string in HH:MM format
 * @returns Formatted time string in 12-hour format
 */
export const formatTime12Hour = (time: string): string => {
  try {
    if (!time || !time.includes(':')) return time;
    
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

/**
 * Format date with Arabic day name
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Formatted date with Arabic day name
 */
export const formatDateWithDay = (dateStr: string): string => {
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

    // Parse the date string
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    // Get localized date components
    const dayName = days[date.getDay()];
    const formattedDate = format(date, 'dd/MM/yyyy', { locale: ar });
    
    // Format: "dayName، dd/MM/yyyy"
    return `${dayName}، ${formattedDate}`;
  } catch (error) {
    console.error('Error formatting date with day:', error);
    return dateStr;
  }
};
