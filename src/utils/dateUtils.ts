
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

export const getEventDateTime = (date: string, time: string = '00:00'): Date => {
  const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];
  const eventDate = new Date(date);
  eventDate.setHours(hours, minutes, 0, 0);
  
  console.log('Creating event date from:', { date, time, result: eventDate });
  return eventDate;
};
