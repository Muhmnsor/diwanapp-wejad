
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addToCalendar } from "@/utils/calendarUtils";
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
  const handleAddToCalendar = async () => {
    try {
      const result = await addToCalendar({
        title,
        description,
        location,
        startDate,
        endDate
      });

      if (Array.isArray(result)) {
        // نعرض قائمة الخيارات للمستخدم
        return;
      }

      toast.success("تمت إضافة الفعالية إلى التقويم");
    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast.error("حدث خطأ أثناء إضافة الفعالية إلى التقويم");
    }
  };

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-8 h-8 hover:bg-purple-50"
          onClick={handleAddToCalendar}
        >
          <CalendarDays className="h-4 w-4 text-purple-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[200px] p-2 backdrop-blur-xl bg-white/95 border border-purple-100 shadow-lg rounded-xl"
      >
        <DropdownMenuItem
          onClick={() => window.open(createGoogleCalendarUrl({
            title,
            description,
            location,
            startDate,
            endDate
          }), '_blank')}
          className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-purple-50 cursor-pointer"
        >
          <img src="/google-calendar.png" alt="Google Calendar" className="w-4 h-4" />
          <span className="text-gray-700">Google Calendar</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => window.open(createOutlookCalendarUrl({
            title,
            description,
            location,
            startDate,
            endDate
          }), '_blank')}
          className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-purple-50 cursor-pointer"
        >
          <img src="/outlook-calendar.png" alt="Outlook Calendar" className="w-4 h-4" />
          <span className="text-gray-700">Outlook Calendar</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            const blob = new Blob(
              [generateICSContent({ title, description, location, startDate, endDate })],
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
