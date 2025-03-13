
import { format, parse } from "date-fns";
import { ar } from "date-fns/locale";

/**
 * Format a date string to localized format
 * @param dateString The date string to format
 * @param formatStr Optional format string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | null | undefined, formatStr = "yyyy-MM-dd"): string => {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "-";
    }
    return format(date, formatStr, { locale: ar });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
};

/**
 * Format date to full localized format with day, month, and year
 * @param dateString The date string to format
 * @returns Formatted date string with full month name
 */
export const formatDateFull = (dateString: string | null | undefined): string => {
  return formatDate(dateString, "dd MMMM yyyy");
};

/**
 * Format date to include time
 * @param dateString The date string to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  return formatDate(dateString, "yyyy-MM-dd HH:mm");
};

/**
 * Parse a date string into a Date object
 * @param dateString The date string to parse
 * @param formatStr Optional format string
 * @returns Date object or null if invalid
 */
export const parseDate = (dateString: string | null | undefined, formatStr = "yyyy-MM-dd"): Date | null => {
  if (!dateString) return null;
  
  try {
    // First try to parse as ISO string
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // If that fails, try to parse with the specified format
    return parse(dateString, formatStr, new Date());
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
};

/**
 * Combines a date string and time string into a single Date object
 * @param dateStr The date string (YYYY-MM-DD)
 * @param timeStr Optional time string (HH:MM)
 * @returns Date object with combined date and time
 */
export const getEventDateTime = (dateStr: string, timeStr?: string): Date => {
  try {
    const date = new Date(dateStr);
    
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      date.setHours(hours || 0);
      date.setMinutes(minutes || 0);
    } else {
      // Default to start of day if no time provided
      date.setHours(0, 0, 0, 0);
    }
    
    return date;
  } catch (error) {
    console.error("Error combining date and time:", error, "Date:", dateStr, "Time:", timeStr);
    // Return current date as fallback
    return new Date();
  }
};
