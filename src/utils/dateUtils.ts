
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

export const formatDate = (date: string | Date): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, 'dd MMMM yyyy', { locale: ar });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

export const formatDateTime = (date: string | Date, timeStr?: string): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const formattedDate = format(parsedDate, 'dd MMMM yyyy', { locale: ar });
    
    return timeStr ? `${formattedDate} - ${timeStr}` : formattedDate;
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return String(date);
  }
};

// Add new functions for the missing exports
export const parseDate = (dateString: string): Date | null => {
  try {
    if (!dateString) return null;
    return new Date(dateString);
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

export const getEventDateTime = (dateStr: string, timeStr?: string): Date => {
  try {
    const date = new Date(dateStr);
    
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      date.setHours(hours || 0, minutes || 0, 0);
    }
    
    return date;
  } catch (error) {
    console.error('Error creating event date time:', error);
    return new Date();
  }
};
