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
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '-';
  try {
    const parsedDate = new Date(date);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(parsedDate);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};