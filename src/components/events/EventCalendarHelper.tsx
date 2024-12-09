import { arabicToEnglishNum, convertArabicDate } from "@/utils/eventUtils";
import { createCalendarUrl } from "@/utils/calendarUtils";
import { Event } from "@/store/eventStore";
import { toast } from "sonner";

export const handleAddToCalendar = (event: Event) => {
  try {
    const dateStr = arabicToEnglishNum(event.date);
    const timeStr = arabicToEnglishNum(event.time);
    
    console.log("Converting date:", dateStr, timeStr);
    const dateString = convertArabicDate(dateStr, timeStr);
    console.log("Parsed date string:", dateString);

    const eventDate = new Date(dateString);
    const endDate = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000));

    if (isNaN(eventDate.getTime())) {
      throw new Error('Invalid date conversion');
    }

    const calendarEvent = {
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: eventDate.toISOString().replace(/[-:]/g, '').split('.')[0],
      endDate: endDate.toISOString().replace(/[-:]/g, '').split('.')[0],
    };

    const calendarUrl = createCalendarUrl(calendarEvent);
    window.open(calendarUrl, '_blank');
  } catch (error) {
    console.error('Error creating calendar event:', error);
    toast.error("لم نتمكن من إضافة الفعالية إلى التقويم");
  }
};