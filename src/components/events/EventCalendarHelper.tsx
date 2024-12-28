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
    
    console.log("Event date object:", eventDate);
    
    // إضافة ساعتين للوقت النهائي
    const endDate = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000));
    
    // تنسيق التواريخ بشكل صحيح لجميع الأجهزة
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}00`;
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