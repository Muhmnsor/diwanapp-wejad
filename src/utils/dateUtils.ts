export const parseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.log('Invalid date string:', dateStr);
      return null;
    }
    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

export const getEventDateTime = (date: string | Date, time: string = '00:00'): Date => {
  try {
    // If date is already a Date object, use it directly
    if (date instanceof Date) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      return newDate;
    }

    // Otherwise, parse the date string
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    console.log('Parsing date:', { date, time, year, month, day, hours, minutes });
    
    return new Date(year, month - 1, day, hours, minutes);
  } catch (error) {
    console.error('Error in getEventDateTime:', { date, time, error });
    // Return current date as fallback
    return new Date();
  }
};
