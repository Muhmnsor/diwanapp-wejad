interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
}

export const createCalendarUrl = (event: CalendarEvent) => {
  // تحديد نوع الجهاز
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  
  console.log("Device detection:", { isIOS, isAndroid, userAgent });

  // تنسيق البيانات للتقويم
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

  if (isIOS) {
    // إنشاء رابط مباشر لتقويم iOS
    const base64Content = btoa(unescape(encodeURIComponent(icsContent)));
    return `webcal://calendar/download?content=${base64Content}`;
  } else if (isAndroid) {
    // إنشاء رابط لتقويم Android
    return `content://com.android.calendar/events?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${event.startDate}/${event.endDate}`;
  } else {
    // إنشاء رابط لتقويم Google (للمتصفح)
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${event.startDate}/${event.endDate}`;
  }
};