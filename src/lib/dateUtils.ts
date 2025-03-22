
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

export const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "yyyy/MM/dd", { locale: ar });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export const formatTime = (timeString: string) => {
  try {
    // If the timeString is in HH:mm:ss format, we need to add a fake date
    if (timeString.includes(":")) {
      return format(parseISO(`2000-01-01T${timeString}`), "hh:mm a", { locale: ar });
    }
    return timeString;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
};

export const formatDuration = (durationMinutes: number) => {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  } else if (hours > 0) {
    return `${hours} ساعة`;
  } else {
    return `${minutes} دقيقة`;
  }
};
