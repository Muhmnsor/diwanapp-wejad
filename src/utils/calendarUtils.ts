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

  // Format for Google Calendar
  const googleParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${event.startDate}/${event.endDate}`,
  });

  if (isIOS) {
    // iOS Calendar format
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
    // Android Intent format
    return `content://com.android.calendar/events?${googleParams.toString()}`;
  } else {
    // Default to Google Calendar for web browsers
    return `https://calendar.google.com/calendar/render?${googleParams.toString()}`;
  }
};