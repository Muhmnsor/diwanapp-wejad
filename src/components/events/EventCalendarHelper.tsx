import { arabicToEnglishNum } from "@/utils/eventUtils";
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
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = cleanedTimeStr.split(':').map(Number);
    
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
    
    console.log("Event date object:", eventDate);
    
    // إضافة ساعتين للوقت النهائي
    const endDate = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000));
    
    // تنسيق التواريخ بشكل صحيح لجميع الأجهزة
    const formatDate = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    };

    const calendarEvent = {
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      startDate: formatDate(eventDate),
      endDate: formatDate(endDate),
    };

    console.log("Calendar event data:", calendarEvent);

    const calendarUrl = createCalendarUrl(calendarEvent);
    console.log("Generated calendar URL:", calendarUrl);
    
    if (calendarUrl.startsWith('blob:')) {
      // للأجهزة التي تدعم تنزيل ملف ICS
      const link = document.createElement('a');
      link.href = calendarUrl;
      link.download = `${event.title}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(calendarUrl);
      toast.success("تم تحميل ملف التقويم");
    } else {
      // للمتصفحات وأجهزة Android
      window.open(calendarUrl, '_blank');
      toast.success("تم فتح التقويم");
    }
  } catch (error) {
    console.error('Error creating calendar event:', error);
    toast.error("لم نتمكن من إضافة الفعالية إلى التقويم");
  }
};