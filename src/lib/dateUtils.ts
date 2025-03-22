
// Format date to locale string (e.g. "١٢ يناير ٢٠٢٤")
export const formatDate = (dateString: string): string => {
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

// Format time (e.g. "١٠:٣٠ ص")
export const formatTime = (timeString: string): string => {
  try {
    // If time is in HH:MM format, we need to add seconds
    const formattedTime = timeString.includes(':') && !timeString.includes(':00') 
      ? `${timeString}:00` 
      : timeString;
    
    const [hours, minutes] = formattedTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

// Format duration in minutes to hours and minutes (e.g. "ساعتين و ٣٠ دقيقة")
export const formatDuration = (minutes: number): string => {
  try {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} دقيقة`;
    } else if (remainingMinutes === 0) {
      if (hours === 1) {
        return 'ساعة واحدة';
      } else if (hours === 2) {
        return 'ساعتين';
      } else if (hours >= 3 && hours <= 10) {
        return `${hours} ساعات`;
      } else {
        return `${hours} ساعة`;
      }
    } else {
      let hoursText;
      if (hours === 1) {
        hoursText = 'ساعة';
      } else if (hours === 2) {
        hoursText = 'ساعتين';
      } else if (hours >= 3 && hours <= 10) {
        hoursText = `${hours} ساعات`;
      } else {
        hoursText = `${hours} ساعة`;
      }
      
      return `${hoursText} و ${remainingMinutes} دقيقة`;
    }
  } catch (error) {
    console.error('Error formatting duration:', error);
    return `${minutes} دقيقة`;
  }
};
