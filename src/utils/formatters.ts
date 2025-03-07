
// Format a date string to a localized date display format
export const formatDate = (dateStr: string | null, fallback: string = "—") => {
  if (!dateStr) return fallback;
  
  try {
    const date = new Date(dateStr);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    // Return in Gregorian format dd/MM/yyyy
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return fallback;
  }
};

// Format number with currency
export const formatCurrency = (num: number) => {
  const formatted = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
  
  // Remove trailing zeros
  return formatted.replace(/\.00$/, '');
};

// Get time from now (e.g., "2 days ago", "in 3 hours")
export const getTimeFromNow = (dateStr: string | null): string => {
  if (!dateStr) return "—";
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `منذ ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'يوم' : 'أيام'}`;
    } else if (diffDays === 0) {
      return "اليوم";
    } else {
      return `بعد ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`;
    }
  } catch (e) {
    console.error("Error calculating time from now:", e);
    return "—";
  }
};

// Get remaining days until a date
export const getRemainingDays = (dateStr: string | null): number | null => {
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch (e) {
    console.error("Error calculating remaining days:", e);
    return null;
  }
};

// Format date relative to today (yesterday, today, tomorrow, or regular date)
export const formatRelative = (dateStr: string | null): string => {
  if (!dateStr) return "—";
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffMs = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === -1) {
      return "أمس";
    } else if (diffDays === 0) {
      return "اليوم";
    } else if (diffDays === 1) {
      return "غداً";
    } else {
      return formatDate(dateStr);
    }
  } catch (e) {
    console.error("Error formatting relative date:", e);
    return formatDate(dateStr);
  }
};
