import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

export const formatDateWithDay = (dateString: string) => {
  if (!dateString) return "";
  const date = parseISO(dateString);
  return format(date, "EEEE، d MMMM yyyy", { locale: ar });
};

export const formatDate = (dateString: string | Date | null) => {
  if (!dateString) return "";
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, "d MMMM yyyy", { locale: ar });
};

export const formatTime = (timeString: string) => {
  if (!timeString) return "";
  // Assuming timeString is in HH:mm format
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
  return format(date, "h:mm a", { locale: ar });
};

export const formatDateTime = (date: Date) => {
  return format(date, "d MMMM yyyy، h:mm a", { locale: ar });
};