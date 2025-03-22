
/**
 * Format a date string to Arabic locale
 */
export const formatDateArabic = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format time from 24-hour format to 12-hour format with AM/PM
 */
export const formatTime12Hour = (time24: string): string => {
  if (!time24) return '';
  
  try {
    // Parse the time (assuming format is "HH:MM")
    const [hours, minutes] = time24.split(':').map(Number);
    
    // Determine AM/PM
    const period = hours >= 12 ? 'م' : 'ص';
    
    // Convert hours to 12-hour format
    const hours12 = hours % 12 || 12;
    
    // Format the result
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time24;
  }
};
