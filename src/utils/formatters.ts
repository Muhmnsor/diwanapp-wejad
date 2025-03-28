
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
 * Format a date string to standard format
 */
export const formatDate = (dateString: string): string => {
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
 * Get remaining days from now until a future date
 */
export const getRemainingDays = (dateString: string): number => {
  if (!dateString) return 0;
  
  try {
    const futureDate = new Date(dateString);
    const today = new Date();
    
    // Clear time part for accurate day calculation
    futureDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = futureDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  } catch (error) {
    console.error('Error calculating remaining days:', error);
    return 0;
  }
};

/**
 * Get time elapsed from a past date until now
 */
export const getTimeFromNow = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const pastDate = new Date(dateString);
    const now = new Date();
    
    const diffTime = now.getTime() - pastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? 'منذ دقيقة' : `منذ ${diffMinutes} دقائق`;
      }
      return diffHours === 1 ? 'منذ ساعة' : `منذ ${diffHours} ساعات`;
    }
    
    if (diffDays === 1) return 'منذ يوم';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return diffWeeks === 1 ? 'منذ أسبوع' : `منذ ${diffWeeks} أسابيع`;
    }
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return diffMonths === 1 ? 'منذ شهر' : `منذ ${diffMonths} أشهر`;
    }
    
    const diffYears = Math.floor(diffDays / 365);
    return diffYears === 1 ? 'منذ سنة' : `منذ ${diffYears} سنوات`;
  } catch (error) {
    console.error('Error calculating time from now:', error);
    return '';
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

/**
 * Format date relative to now (today, yesterday, etc)
 */
export const formatRelative = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const inputDate = new Date(dateString);
    const today = new Date();
    
    // Set to start of day for comparison
    today.setHours(0, 0, 0, 0);
    
    const inputDay = new Date(inputDate);
    inputDay.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - inputDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'الأمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    
    return formatDate(dateString);
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return dateString;
  }
};
