
import { CalendarDays, Mail } from "lucide-react";
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
import { toast } from "sonner";

interface EventCalendarHelperProps {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate?: Date;
}

export const EventCalendarHelper = ({
  title,
  description,
  location,
  startDate,
  endDate
}: EventCalendarHelperProps) => {
  const eventData: CalendarEvent = {
    title,
    description,
    location,
    startDate,
    endDate
  };

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
          <Mail className="h-4 w-4 text-[#0078D4]" />
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
