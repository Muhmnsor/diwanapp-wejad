
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
