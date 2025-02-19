
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  addToCalendar, 
  createGoogleCalendarUrl, 
  createOutlookCalendarUrl, 
  generateICSContent,
  type CalendarEvent 
} from "@/utils/calendarUtils";
import { getEventDateTime } from "@/utils/dateUtils";
import { toast } from "sonner";

interface EventCalendarHelperProps {
  title: string;
  description: string;
  location: string;
  startDate: Date | string;
  endDate?: Date | string;
  time?: string;
}

export const EventCalendarHelper = ({
  title,
  description,
  location,
  startDate,
  endDate,
  time
}: EventCalendarHelperProps) => {
  // تحويل التاريخ والوقت إلى كائن Date صحيح
  const eventStartDate = typeof startDate === 'string' ? getEventDateTime(startDate, time) : startDate;
  const eventEndDate = endDate ? (typeof endDate === 'string' ? getEventDateTime(endDate as string, time) : endDate) : undefined;

  console.log('Start Date:', startDate, 'Time:', time);
  console.log('Parsed Event Start Date:', eventStartDate);
  console.log('Parsed Event End Date:', eventEndDate);

  const eventData: CalendarEvent = {
    title,
    description,
    location,
    startDate: eventStartDate,
    endDate: eventEndDate
  };

  console.log('Calendar Event Data:', eventData);

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-8 h-8 hover:bg-purple-50"
          title="إضافة إلى التقويم"
        >
          <CalendarDays className="h-4 w-4 text-purple-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[200px] p-2 backdrop-blur-xl bg-white/95 border border-purple-100 shadow-lg rounded-xl"
      >
        <DropdownMenuItem
          onClick={() => {
            window.open(createGoogleCalendarUrl(eventData), '_blank');
            toast.success("تم فتح تقويم Google");
          }}
          className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-purple-50 cursor-pointer"
        >
          <svg viewBox="0 0 150 150" className="w-4 h-4">
            <path className="st14" d="M120,76.1c0-3.1-0.3-6.3-0.8-9.3H75.9v17.7h24.8c-1,5.7-4.3,10.7-9.2,13.9l14.8,11.5C115,101.8,120,90,120,76.1L120,76.1z" fill="#4280EF"/>
            <path className="st15" d="M75.9,120.9c12.4,0,22.8-4.1,30.4-11.1L91.5,98.4c-4.1,2.8-9.4,4.4-15.6,4.4c-12,0-22.1-8.1-25.8-18.9L34.9,95.6C42.7,111.1,58.5,120.9,75.9,120.9z" fill="#34A353"/>
            <path className="st12" d="M50.1,83.8c-1.9-5.7-1.9-11.9,0-17.6L34.9,54.4c-6.5,13-6.5,28.3,0,41.2L50.1,83.8z" fill="#F6B704"/>
            <path className="st13" d="M75.9,47.3c6.5-0.1,12.9,2.4,17.6,6.9L106.6,41C98.3,33.2,87.3,29,75.9,29.1c-17.4,0-33.2,9.8-41,25.3l15.2,11.8C53.8,55.3,63.9,47.3,75.9,47.3z" fill="#E54335"/>
          </svg>
          <span className="text-gray-700">تقويم Google</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            window.open(createOutlookCalendarUrl(eventData), '_blank');
            toast.success("تم فتح تقويم Outlook");
          }}
          className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-purple-50 cursor-pointer"
        >
          <svg viewBox="0 0 48 48" className="w-4 h-4">
            <path fill="#03A9F4" d="M21,31c0,1.104,0.896,2,2,2h17c1.104,0,2-0.896,2-2V16c0-1.104-0.896-2-2-2H23c-1.104,0-2,0.896-2,2V31z"/>
            <path fill="#B3E5FC" d="M42,16.975V16c0-0.428-0.137-0.823-0.367-1.148l-11.264,6.932l-7.542-4.656L22.125,19l8.459,5L42,16.975z"/>
            <path fill="#0277BD" d="M27 41.46L6 37.46 6 9.46 27 5.46z"/>
            <path fill="#FFF" d="M21.216,18.311c-1.098-1.275-2.546-1.913-4.328-1.913c-1.892,0-3.408,0.669-4.554,2.003c-1.144,1.337-1.719,3.088-1.719,5.246c0,2.045,0.564,3.714,1.69,4.986c1.126,1.273,2.592,1.91,4.378,1.91c1.84,0,3.331-0.652,4.474-1.975c1.143-1.313,1.712-3.043,1.712-5.199C22.869,21.281,22.318,19.595,21.216,18.311z M19.049,26.735c-0.568,0.769-1.339,1.152-2.313,1.152c-0.939,0-1.699-0.394-2.285-1.187c-0.581-0.785-0.87-1.861-0.87-3.211c0-1.336,0.289-2.414,0.87-3.225c0.586-0.81,1.368-1.211,2.355-1.211c0.962,0,1.718,0.393,2.267,1.178c0.555,0.795,0.833,1.895,0.833,3.31C19.907,24.906,19.618,25.968,19.049,26.735z"/>
          </svg>
          <span className="text-gray-700">تقويم Outlook</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            const blob = new Blob(
              [generateICSContent(eventData)],
              { type: 'text/calendar;charset=utf-8' }
            );
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'event.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success("تم تنزيل ملف التقويم");
          }}
          className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-purple-50 cursor-pointer"
        >
          <CalendarDays className="h-4 w-4 text-purple-600" />
          <span className="text-gray-700">تنزيل ملف ICS</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
