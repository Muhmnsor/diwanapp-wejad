
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
