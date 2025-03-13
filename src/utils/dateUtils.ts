
import { format } from "date-fns";
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
