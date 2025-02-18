
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
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path 
              d="M21.56 10.738l-9.042-8.07a.75.75 0 00-.995.004l-9.042 8.07a.75.75 0 00-.26.57V22.5a.75.75 0 00.75.75h6a.75.75 0 00.75-.75v-7.5a.75.75 0 01.75-.75h3.75a.75.75 0 01.75.75v7.5a.75.75 0 00.75.75h6a.75.75 0 00.75-.75V11.31a.75.75 0 00-.26-.572z" 
              fill="#4285F4"
            />
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
