import { arabicToEnglishNum, convertArabicDate } from "@/utils/eventUtils";
import { createCalendarUrl } from "@/utils/calendarUtils";
import { Event } from "@/store/eventStore";
import { toast } from "sonner";

export const handleAddToCalendar = (event: Event) => {
  try {
    const dateStr = arabicToEnglishNum(event.date);
    const timeStr = arabicToEnglishNum(event.time);
    
    console.log("Converting date and time:", { dateStr, timeStr });
    
    // تنظيف سلسلة الوقت
    const cleanedTimeStr = timeStr.trim();
    console.log("Cleaned time string:", cleanedTimeStr);
    
    // تحويل التاريخ والوقت إلى تنسيق قياسي
    const dateString = `${dateStr} ${cleanedTimeStr}`;
    console.log("Final date string:", dateString);
    
    const [year, month, day] = dateStr.split('-');
    const [hours, minutes] = cleanedTimeStr.split(':');
    
    // إنشاء كائن التاريخ
    const eventDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
    
    // التحقق من صحة التاريخ
    if (isNaN(eventDate.getTime())) {
      throw new Error('Invalid date conversion');
    }
    
    // إضافة ساعتين للوقت النهائي
    const endDate = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000));

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