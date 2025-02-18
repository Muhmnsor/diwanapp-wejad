
export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate?: Date;
}

export const formatDateForCalendar = (date: Date): string => {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15) + 'Z';
};

export const generateICSContent = (event: CalendarEvent): string => {
  const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000); // Default 1 hour
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    `DTSTART:${formatDateForCalendar(event.startDate)}`,
    `DTEND:${formatDateForCalendar(endDate)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};

export const createGoogleCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${formatDateForCalendar(event.startDate)}/${formatDateForCalendar(event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000))}`
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const createOutlookCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: event.startDate.toISOString(),
    enddt: (event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000)).toISOString()
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

export const addToCalendar = async (event: CalendarEvent) => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isMacOS = /macintosh/.test(userAgent);
  
  try {
    // للأجهزة التي تدعم Web Share API
    if (navigator.share && (isIOS || /android/.test(userAgent))) {
      const file = new File(
        [generateICSContent(event)],
        'event.ics',
        { type: 'text/calendar' }
      );
      
      await navigator.share({
        title: event.title,
        text: event.description,
        files: [file]
      });
      
      return true;
    }
    
    // للأجهزة iOS وmacOS
    if (isIOS || isMacOS) {
      const blob = new Blob([generateICSContent(event)], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'event.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return true;
    }
    
    // للأجهزة الأخرى، نفتح نافذة اختيار التقويم
    const calendarChoices = [
      { name: 'Google Calendar', url: createGoogleCalendarUrl(event) },
      { name: 'Outlook Calendar', url: createOutlookCalendarUrl(event) },
      { name: 'Download .ics', url: `data:text/calendar;charset=utf-8,${encodeURIComponent(generateICSContent(event))}` }
    ];
    
    return calendarChoices;
  } catch (error) {
    console.error('Error adding to calendar:', error);
    throw error;
  }
};
