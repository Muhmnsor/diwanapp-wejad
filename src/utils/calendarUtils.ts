interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
}

export const createCalendarUrl = (event: CalendarEvent) => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  
  console.log("Device detection:", { isIOS, isAndroid, userAgent });

  // تنظيف البيانات
  const sanitizedEvent = {
    title: encodeURIComponent(event.title),
    description: encodeURIComponent(event.description),
    location: encodeURIComponent(event.location),
    startDate: event.startDate,
    endDate: event.endDate
  };

  if (isIOS) {
    // تنسيق ICS لأجهزة iOS
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      `DTSTART:${event.startDate}`,
      `DTEND:${event.endDate}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  } else if (isAndroid) {
    // تنسيق Google Calendar لأجهزة Android (تم تغيير المسار لاستخدام Google Calendar بدلاً من تطبيق التقويم الافتراضي)
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${sanitizedEvent.title}&details=${sanitizedEvent.description}&location=${sanitizedEvent.location}&dates=${sanitizedEvent.startDate}/${sanitizedEvent.endDate}`;
  } else {
    // تنسيق Google Calendar للمتصفحات
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${sanitizedEvent.title}&details=${sanitizedEvent.description}&location=${sanitizedEvent.location}&dates=${sanitizedEvent.startDate}/${sanitizedEvent.endDate}`;
  }
};